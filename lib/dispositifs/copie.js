// Dispositif « copie » (cache, réplique en retard, CDN) : une source à gauche, sa copie à droite, et rien qui les relie.
// Une lecture part de la copie vers la source et en rapporte une carte ; l'écriture d'Alice change la source sans
// toucher la copie ; Bob lit la copie, périmée tant que sa durée de vie court. La solution : le code d'Alice efface la
// copie juste après l'écriture, et la lecture suivante range la valeur fraîche.
//
//   Copie.monter({ avant: '20 €', apres: '25 €', duree: '10 min', ttl: 'TTL', source: 'Base', copie: 'Cache (serveur)' })
//   Copie.anime({ cache: "cache n'est", base: 'la base ne', ... })   pose les gestes, chacun sur son mot
//
// Aucune couleur ni police écrite ici : la page les donne en variables CSS, une par rôle.
//   --encre (contours, étiquettes, valeurs), --fond (l'intérieur des cartes et des têtes), --action (flèches),
//   --erreur (la valeur périmée, le trait qui barre), --reussite (la valeur fraîche), --lumiere (la marque « durée de vie »),
//   --police-schema (étiquettes, valeurs). L'épaisseur du trait vient de la classe `.trait` de la page.
// Les gestes s'enchaînent : chacun part sur son mot, ou à la fin du précédent si la voix va plus vite. Les mots `reset`
// et `reset2` sont des instants (la relance, la règle), pas des mots ; `reset2` attend que la carte de Bob ait été vue.
const Copie = (() => {
  const VUE = 0.7  // la carte de Bob tient au moins ce temps avant la remise à zéro de la règle

  // Une flèche : la ligne (droite ou courbe) puis sa tête, d'un seul trait, qui se trace d'un seul geste.
  // `[x2, y2]` : la pointe ; `[dx, dy]` : la direction d'arrivée.
  function fleche(id, d, [x2, y2], [dx, dy], cls) {
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, k = 24
    const p = a => [x2 - k * (ux * Math.cos(a) - uy * Math.sin(a)), y2 - k * (uy * Math.cos(a) + ux * Math.sin(a))].map(Math.round)
    const [g, h] = [p(0.6), p(-0.6)]
    return `<path id="${id}" class="trait ${cls}" d="${d} M${g[0]} ${g[1]} L${x2} ${y2} L${h[0]} ${h[1]}"/>`
  }
  const droite = (id, [x1, y1], [x2, y2], cls = 'cp-action') => fleche(id, `M${x1} ${y1} L${x2} ${y2}`, [x2, y2], [x2 - x1, y2 - y1], cls)
  // Les flèches servent plusieurs fois : une instance par usage, toutes de même géométrie.
  const ecriture = i => droite(`cp-ecrit-${i}`, [270, 910], [270, 815])
  const lectureBob = i => droite(`cp-litbob-${i}`, [720, 910], [720, 815])
  const lecture = i => droite(`cp-lit-${i}`, [610, 625], [410, 625])
  // L'effacement part d'Alice, passe sous la base et entre les colonnes, et vise la copie : il ne touche jamais la base.
  const effacement = i => fleche(`cp-eff-${i}`, 'M318 942 C430 965 525 905 540 800 C552 715 600 668 666 660', [666, 660], [66, -8], 'cp-action')

  const STYLE = `
    #schema{transform:none}
    #schema .cp-action{stroke:var(--action)} #schema .cp-erreur{stroke:var(--erreur)}
    #schema .cp-lumiere{stroke:var(--lumiere);stroke-width:12px}
    #schema .cp-fond{fill:var(--fond)} #schema .cp-noir{fill:var(--encre)}
    .cp-txt{position:absolute;text-align:center;line-height:1;white-space:nowrap;color:var(--encre);font-family:var(--police-schema);
      clip-path:inset(0 100% 0 0)}
    .cp-carte{position:absolute;display:flex;align-items:center;justify-content:center;line-height:1;white-space:nowrap;opacity:0;
      font-family:var(--police-schema);color:var(--encre);background:var(--fond);border:7px solid var(--encre);border-radius:18px}
    .cp-carte.erreur{color:var(--erreur);border-color:var(--erreur)}
    .cp-carte.reussite{color:var(--reussite);border-color:var(--reussite)}
    .cp-copie{left:680px;top:605px;width:220px;height:90px;font-size:80px}
    .cp-bob{left:790px;top:925px;width:170px;height:85px;font-size:64px}`

  // Les cartes : la copie se pose dans l'emplacement (centre 790, 650) ; celle de Bob à droite de sa tête (centre 875, 967).
  const COPIE = [790, 650], BOB = [875, 967], BASE = [270, 705]

  return {
    monter({ avant = '20 €', apres = '25 €', duree = '10 min', ttl = 'TTL', source = 'Base', copie = 'Cache (serveur)' } = {}) {
      const st = document.createElement('style')
      st.textContent = STYLE
      document.head.append(st)
      const carte = (id, cls, v) => `<div class="cp-carte ${cls}" id="${id}">${v}</div>`
      $('#schema').innerHTML = `
      <svg viewBox="0 0 1080 1920">
        <g id="cp-base">
          <path class="trait" d="M140 610 A130 30 0 0 1 400 610 A130 30 0 0 1 140 610"/>
          <path class="trait" d="M140 610 V770"/>
          <path class="trait" d="M400 610 V770"/>
          <path class="trait" d="M140 770 A130 30 0 0 0 400 770"/>
        </g>
        <g id="cp-cache"><rect class="trait" x="620" y="580" width="340" height="220" rx="14"/></g>
        <rect id="cp-place" class="trait" x="660" y="600" width="260" height="100" rx="16" style="stroke-dasharray:14 16;opacity:0"/>
        <path id="cp-marque" class="trait cp-lumiere" d="M738 732 C742 702 892 700 898 740 C903 782 752 790 735 754 C729 741 740 727 764 721"/>
        <g id="cp-alice">
          <path class="trait cp-noir" d="M236 936 C200 928 186 978 204 1010 C212 988 224 968 242 958 Z"/>
          <circle class="trait cp-fond" cx="270" cy="960" r="42"/>
          <circle class="trait" cx="290" cy="954" r="3"/>
        </g>
        <g id="cp-bob">
          <circle class="trait cp-fond" cx="720" cy="960" r="42"/>
          <path class="trait cp-noir" d="M679 954 C670 900 770 900 761 954 C742 934 700 932 679 954 Z"/>
          <circle class="trait" cx="740" cy="968" r="3"/>
        </g>
        <g id="cp-minuteur" style="opacity:0">
          <circle cx="932" cy="745" r="20" style="fill:none;stroke:var(--encre);stroke-width:4px;opacity:.2"/>
          <circle id="cp-anneau" cx="932" cy="745" r="20" pathLength="100" transform="rotate(-90 932 745)"
            style="fill:none;stroke:var(--action);stroke-width:8px;stroke-linecap:butt;stroke-dasharray:100 100;stroke-dashoffset:0"/>
        </g>
        ${ecriture(1)}${ecriture(2)}${ecriture(3)}
        ${lectureBob(1)}${lectureBob(2)}${lectureBob(3)}
        ${lecture(1)}${lecture(2)}
        ${effacement(1)}${effacement(2)}
      </svg>
      <div class="cp-txt" id="cp-nom-base" style="left:120px;top:517px;width:300px;font-size:56px">${source}</div>
      <div class="cp-txt" id="cp-nom-cache" style="left:590px;top:519px;width:400px;font-size:52px">${copie}</div>
      <div class="cp-txt" id="cp-avant" style="left:140px;top:657px;width:260px;font-size:96px">${avant}</div>
      <div class="cp-txt" id="cp-apres" style="left:140px;top:657px;width:260px;font-size:96px">${apres}</div>
      <div class="cp-txt" id="cp-ttl" style="left:634px;top:720px;width:92px;font-size:50px;text-align:right">${ttl}</div>
      <div class="cp-txt" id="cp-duree" style="left:736px;top:719px;width:160px;font-size:52px">${duree}</div>
      ${carte('cp-copie-1', 'cp-copie', avant)}${carte('cp-copie-2', 'cp-copie', apres)}
      ${carte('cp-bob-1', 'cp-bob erreur', avant)}${carte('cp-bob-2', 'cp-bob erreur', avant)}${carte('cp-bob-3', 'cp-bob reussite', apres)}
      <svg viewBox="0 0 1080 1920">
        <path id="cp-barre-1" class="trait cp-erreur" d="M690 690 L890 612"/>
        <path id="cp-barre-2" class="trait cp-erreur" d="M690 690 L890 612"/>
      </svg>`
      // Tout ce qui se trace est caché jusqu'à son tracé.
      for (const el of $$('#schema svg path, #schema svg rect:not(#cp-place), #schema #cp-alice circle, #schema #cp-bob circle')) {
        const L = el.getTotalLength()
        gsap.set(el, { strokeDasharray: `${L} ${L + 20}`, strokeDashoffset: L + 10 })
      }
      gsap.set('#schema :is(.cp-fond, .cp-noir)', { fillOpacity: 0 })
    },

    anime(mots) {
      // Options (facultatives, défauts inchangés) : `mots.vue`, la tenue de la carte de Bob avant la règle ;
      // `mots.depart`, le centre [x, y] d'où la carte sort de la base (par défaut, le centre de sa valeur).
      const depart = mots.depart ?? BASE
      const ECART = 0.12  // entre deux gestes : le suivant attend la fin du précédent, plus ce souffle
      let libre = 0       // l'instant où le schéma est de nouveau libre
      window.COPIE_GESTES = []  // chaque geste : son mot, l'instant du mot, l'instant où il part (le contrôle lit le retard)
      const part = (cle, tMot) => {
        const t = Math.max(tMot, libre)
        COPIE_GESTES.push({ cle, mot: typeof mots[cle] === 'string' ? mots[cle] : null, t_mot: +tMot.toFixed(2), part: +t.toFixed(2) })
        return t
      }
      const fini = t => (libre = t + ECART)

      const tracer = (el, at, d = 0.35) => {
        el = typeof el === 'string' ? $(el) : el
        const L = el.getTotalLength()
        tl.fromTo(el, { strokeDashoffset: L + 10 }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', immediateRender: false }, at)
        return at + d
      }
      // Un groupe (une colonne, une tête) : ses traits se suivent de près, puis ses aplats se posent.
      const tracerGroupe = (g, at, d = 0.3, pas = 0.06) => {
        const els = $$(`${g} :is(path, rect, circle)`)
        els.forEach((el, i) => tracer(el, at + i * pas, d))
        const fin = at + (els.length - 1) * pas + d
        const pleins = $$(`${g} :is(.cp-fond, .cp-noir)`)
        if (pleins.length) tl.fromTo(pleins, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.2, immediateRender: false }, fin - 0.2)
        return fin
      }
      const flecheTrace = (el, at, d = 0.35) => (son('feutre', at), tracer(el, at, d))
      const ecrire = (el, at, d = 0.35) => {
        tl.set(el, { opacity: 1 }, at)
        tl.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'none', immediateRender: false }, at)
        return at + d
      }
      const montrer = (els, at, d = 0.3) => (tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: d, ease: 'power1.out', immediateRender: false }, at), at + d)
      const effacer = (els, at, d = 0.25) => (tl.fromTo(els, { opacity: 1 }, { opacity: 0, duration: d, ease: 'power1.in', immediateRender: false }, at), at + d)
      // Une carte fait un trajet : elle apparaît au départ en reculant un peu, puis file en translation seule.
      const trajet = (el, [x0, y0], [x1, y1], at) => {
        const dx = x0 - x1, dy = y0 - y1, L = Math.hypot(dx, dy)
        tl.set(el, { x: dx, y: dy }, at)
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', immediateRender: false }, at)
        tl.to(el, { x: dx + 12 * dx / L, y: dy + 12 * dy / L, duration: 0.15, ease: 'power1.out' }, at + 0.05)
        tl.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power2.inOut' }, at + 0.2)
        son('pop', at + 0.7)
        return at + 0.7
      }
      // L'anneau de décompte : f = la part qui reste (1 plein, 0 vide). Il baisse par crans, entre deux gestes.
      const anneau = (f, at, d = 0.3) => (tl.to('#cp-anneau', { strokeDashoffset: (f - 1) * 100, duration: d, ease: 'power1.inOut' }, at), at + d)
      // La base change de valeur : la flèche d'Alice s'efface en frappant, la base tressaute, l'ancienne valeur s'efface ;
      // puis la nouvelle s'écrit.
      const change = (fleche, de, vers, at) => {
        effacer([fleche, de], at)
        tl.fromTo('#cp-base', { scale: 1.07, svgOrigin: '270 690' }, { scale: 1, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, at)
        son('pop', at + 0.37)
        return ecrire(vers, at + 0.37)
      }
      // L'effacement : la flèche d'Alice vise la copie, puis le trait la barre.
      const barre = (fleche, trait, at) => {
        const t = flecheTrace(fleche, at, 0.5) + ECART
        son('feutre', t)
        return tracer(trait, t, 0.3)
      }

      // 1. Mécanisme : la copie, la base, l'écriture d'Alice, la lecture de Bob.
      let t = part('cache', cue(mots.cache) - 0.1)
      son('feutre', t)
      tracer('#cp-cache rect', t, 0.5)
      ecrire('#cp-nom-cache', t + 0.1, 0.45)
      fini(montrer('#cp-place', t + 0.67, 0.3))

      t = part('base', cue(mots.base) - 0.1)
      son('feutre', t)
      fini(Math.max(tracerGroupe('#cp-base', t, 0.4, 0.1), ecrire('#cp-nom-base', t + 0.1, 0.45)))

      t = part('prix', cue(mots.prix))
      son('pop', t)
      fini(ecrire('#cp-avant', t))

      t = part('lecture', cue(mots.lecture))
      fini(flecheTrace('#cp-lit-1', t))

      t = part('range', cue(mots.range))
      effacer('#cp-lit-1', t + 0.1)  // la flèche s'efface pendant que la carte sort de la base
      t = trajet('#cp-copie-1', depart, COPIE, t) + ECART
      // La copie est rangée : son étiquette et son anneau, plein ; le décompte part d'ici.
      montrer('#cp-minuteur', t, 0.3)
      fini(ecrire('#cp-duree', t, 0.3))

      t = part('alice', cue(mots.alice))
      son('feutre', t)
      fini(tracerGroupe('#cp-alice', t, 0.25, 0.04))

      t = part('ecrit', cue(mots.ecrit))
      fini(flecheTrace('#cp-ecrit-1', t, 0.3))

      t = part('change', cue(mots.change))
      fini(change('#cp-ecrit-1', '#cp-avant', '#cp-apres', t))

      // Le temps passe : deux crans pendant que la voix s'amuse, avant que Bob lise.
      const tBob = cue(mots.bob)
      t = Math.max(libre, Math.min(libre + 0.2, tBob - 1.1))
      fini(anneau(0.5, anneau(0.75, t) + 0.15))

      t = part('bob', tBob)
      son('feutre', t)
      t = tracerGroupe('#cp-bob', t, 0.25, 0.04) + ECART
      fini(flecheTrace('#cp-litbob-1', t, 0.3))

      t = part('perime', cue(mots.perime))
      effacer('#cp-litbob-1', t + 0.1)
      t = trajet('#cp-bob-1', COPIE, BOB, t)
      // L'impact : la tête de Bob encaisse, une fois la carte posée.
      tl.fromTo('#cp-bob', { scale: 1.12, svgOrigin: '720 960' }, { scale: 1, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, t + 0.1)
      tremble(t)
      son('choc', t)
      fini(t + 0.35)

      // Plus tard : Bob relit la copie, encore vivante, et reçoit encore 20 €.
      t = part('encore', cue(mots.encore))
      effacer('#cp-bob-1', t)
      t = flecheTrace('#cp-litbob-2', t, 0.3)
      effacer('#cp-litbob-2', t + ECART + 0.1)
      fini(trajet('#cp-bob-2', COPIE, BOB, t + ECART))

      t = part('duree', cue(mots.duree))
      son('feutre', t)
      t = tracer('#cp-marque', t, 0.45) + ECART
      son('pop', t)
      t = ecrire('#cp-ttl', t, 0.3) + ECART
      fini(anneau(0.25, mots.expire ? Math.max(t, cue(mots.expire)) : t))  // un cran de plus, sur « expire »

      // 2. Relance : le schéma revient à zéro, la copie reste.
      t = part('reset', mots.reset)
      effacer(['#cp-bob-2', '#cp-marque', '#cp-apres'], t, 0.3)
      montrer('#cp-avant', t + 0.3 + ECART, 0.3)
      fini(anneau(1, t + 0.3 + ECART, 0.3))

      // 3. Solution : l'écriture, puis le code d'Alice efface la copie ; la lecture suivante range la valeur fraîche.
      t = part('code', cue(mots.code))
      fini(flecheTrace('#cp-ecrit-2', t, 0.3))
      t = part('change2', cue(mots.change2))
      fini(change('#cp-ecrit-2', '#cp-avant', '#cp-apres', t))
      t = part('efface', cue(mots.efface))
      fini(barre('#cp-eff-1', '#cp-barre-1', t))
      t = part('apres', cue(mots.apres))
      fini(effacer(['#cp-copie-1', '#cp-barre-1', '#cp-minuteur', '#cp-eff-1'], t, 0.3))
      t = part('vide', cue(mots.vide))
      t = flecheTrace('#cp-litbob-3', t, 0.3) + ECART
      tl.fromTo('#cp-place', { scale: 1, svgOrigin: '790 650' }, { scale: 1.08, duration: 0.15, ease: 'power1.inOut', immediateRender: false }, t)
      tl.to('#cp-place', { scale: 1, duration: 0.15, ease: 'power1.inOut' }, t + 0.15)
      fini(t + 0.3)
      t = part('relit', cue(mots.relit))
      effacer('#cp-litbob-3', t)
      fini(flecheTrace('#cp-lit-2', t, 0.35))
      t = part('frais', cue(mots.frais))
      effacer('#cp-lit-2', t + 0.1)
      t = trajet('#cp-copie-2', depart, COPIE, t) + ECART
      // La nouvelle copie : l'anneau se redessine plein. Puis Bob reçoit la valeur fraîche.
      tl.set('#cp-anneau', { strokeDashoffset: 100 }, t)
      tl.set('#cp-minuteur', { opacity: 1 }, t)
      tl.to('#cp-anneau', { strokeDashoffset: 0, duration: 0.3, ease: 'power1.inOut' }, t)
      fini(trajet('#cp-bob-3', COPIE, BOB, t + 0.3 + ECART))

      // 4. À retenir : remise à zéro une fois la carte de Bob vue, puis la règle rejouée. Option facultative
      // `mots.rejouer: false` : pas de règle rejouée, l'état final de la solution tient jusqu'à la fin.
      if (mots.rejouer === false) return libre
      t = part('reset2', Math.max(mots.reset2 ?? 0, libre - ECART + (mots.vue ?? VUE)))
      // En un seul fondu : la voix est déjà sur la règle.
      effacer(['#cp-bob-3', '#cp-copie-2', '#cp-apres'], t, 0.3)
      fini(montrer(['#cp-copie-1', '#cp-avant'], t, 0.3))
      t = part('dabord', cue(mots.dabord))
      t = flecheTrace('#cp-ecrit-3', t, 0.3) + ECART
      fini(change('#cp-ecrit-3', '#cp-avant', '#cp-apres', t))
      t = part('puis', cue(mots.puis))
      t = barre('#cp-eff-2', '#cp-barre-2', t) + ECART + 0.1
      fini(effacer(['#cp-copie-1', '#cp-barre-2', '#cp-minuteur', '#cp-eff-2'], t, 0.3))
      return libre
    },
  }
})()
