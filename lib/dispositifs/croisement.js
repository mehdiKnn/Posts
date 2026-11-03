// Dispositif « croisement » (deadlock, ordre des verrous, deux ressources) : deux personnages, Alice à gauche et Bob à
// droite, et deux cadenas au centre, A en haut et B en bas. Chacun prend un cadenas puis demande celui de l'autre :
// la boucle se ferme. La solution remet le schéma à zéro et fait prendre les cadenas dans le même ordre.
//
//   Croisement.monter({ a: 'A', b: 'B' })        écrit le schéma dans #schema (les lettres des deux cadenas)
//   Croisement.anime({ cadenas: 'verrous peuvent', gauche: 'Alice vire', ... })  pose les gestes, chacun sur son mot
//
// Les mots sont ceux de la voix (cue() les cherche dans l'ordre du texte). `mots.reset` est un instant (le début de
// la relance), pas un mot. Les gestes qui s'enchaînent (un cadenas pris, puis l'autre) attendent la fin du précédent
// même si la voix va plus vite : un cadenas ne change jamais de main avant d'être revenu au centre.
//
// La géométrie est écrite en pixels de la page (1080 × 1920), de x 105 à 1000 et de y 525 à 1010, à taille réelle : sous le
// titre, au-dessus de la taupe de lib/manar.css et de son bâton (vers y 1067).
const Croisement = (() => {
  // Les poses des bras d'Alice (coude, main ; l'épaule est fixe) ; celles de Bob en miroir (x → 1080 − x).
  const EPAULE = [205, 700]
  const POSES = {
    bas1: [[232, 782], [248, 862]], bas2: [[178, 782], [162, 862]],
    tend: [[268, 752], [330, 770]],    // la main tendue vers le centre
    tient: [[268, 762], [330, 785]],   // un cadenas à mi-hauteur (le mécanisme)
    haut: [[268, 712], [330, 698]],    // le premier cadenas, en haut
    bas: [[250, 800], [330, 890]],     // le second, en bas
    paume1: [[270, 742], [315, 716]], paume2: [[152, 748], [112, 716]],  // mains ouvertes, vides
  }
  // Où se tient un cadenas (le centre de son corps).
  const PLACES = { A: [540, 640], B: [540, 900], tient: [392, 775], haut: [392, 688], bas: [392, 878] }
  const miroir = ([x, y], cote) => cote === 'a' ? [x, y] : [1080 - x, y]
  const bras = (cote, pose) => {
    const [e, m] = POSES[pose].map(p => miroir(p, cote)), s = miroir(EPAULE, cote)
    return `M${s[0]} ${s[1]} L${e[0]} ${e[1]} L${m[0]} ${m[1]}`
  }
  const main = (cote, pose) => miroir(POSES[pose][1], cote)
  const place = (cote, nom) => nom === 'A' || nom === 'B' ? PLACES[nom] : miroir(PLACES[nom], cote)

  // Une flèche : la ligne et sa tête, en deux tracés.
  function fleche(id, [x1, y1], [x2, y2], cls = 'trait cp-action', extra = '') {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, k = 24
    const p = a => [x2 - k * (ux * Math.cos(a) - uy * Math.sin(a)), y2 - k * (uy * Math.cos(a) + ux * Math.sin(a))].map(Math.round)
    const [g, d] = [p(0.6), p(-0.6)]
    return `<g id="${id}" ${extra}><path class="${cls}" d="M${x1} ${y1} L${x2} ${y2}"/><path class="${cls} tete" d="M${g[0]} ${g[1]} L${x2} ${y2} L${d[0]} ${d[1]}"/></g>`
  }
  const cadenas = (id, lettre) => `
      <g id="${id}">
        <path class="trait anse" d="M-28 -45 V-66 A28 28 0 0 1 28 -66 V-45"/>
        <rect class="trait plein" x="-55" y="-45" width="110" height="90" rx="16"/>
        <text class="cr-lettre" x="0" y="22" text-anchor="middle" style="opacity:0">${lettre}</text>
      </g>`
  // Les cheveux passent derrière la tête (la queue de cheval) ou devant (la frange) : `devant`.
  const perso = (id, cote, cheveux, devant = false) => {
    const [hx] = miroir([205, 0], cote), oeil = miroir([226, 594], cote)
    return `
      <g id="${id}">
        ${devant ? '' : cheveux}
        <circle class="trait plein" cx="${hx}" cy="600" r="48"/>
        ${devant ? cheveux : ''}
        <circle class="trait" cx="${oeil[0]}" cy="${oeil[1]}" r="3"/>
        <path class="trait" d="M${hx} 648 V840"/>
        <path class="trait" d="M${hx} 840 L${miroir([165, 0], cote)[0]} 1005"/>
        <path class="trait" d="M${hx} 840 L${miroir([245, 0], cote)[0]} 1005"/>
        <path id="bras-${cote}1" class="trait" d="${bras(cote, 'bas1')}"/>
        <path id="bras-${cote}2" class="trait" d="${bras(cote, 'bas2')}"/>
        ${[1, 2].map(n => `
        <g id="main-${cote}${n}"><circle class="trait poing" r="10"/><path class="trait paume" style="opacity:0" d="M-24 -8 Q-22 16 0 16 Q22 16 24 -8"/></g>`).join('')}
      </g>`
  }

  // Où chaque cadenas se trouve, pour l'élan avant le trajet.
  const ou = {}

  // Un cadenas glisse (un petit recul, puis le trajet) et, s'il le faut, se ferme ou se rouvre à l'arrivée.
  function glisse(nom, vers, at, { ferme = false, ouvre = false } = {}) {
    const g = `#cad-${nom.toLowerCase()}`, [x0, y0] = ou[nom], [x1, y1] = vers
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, recul = 12
    tl.to(g, { x: x0 - (x1 - x0) / L * recul, y: y0 - (y1 - y0) / L * recul, duration: 0.12, ease: 'power1.out' }, at)
    tl.to(g, { x: x1, y: y1, duration: 0.5, ease: 'power2.inOut' }, at + 0.12)
    ou[nom] = vers
    // L'anse claque quand le cadenas se pose (ou se rouvre en arrivant) : la fin du geste, que le suivant attend.
    if (ferme) {
      tl.to(`${g} .anse`, { y: 0, duration: 0.25, ease: 'back.out(3)' }, at + 0.5)
      son('clac', at + 0.6)
      return at + 0.75
    }
    if (ouvre) {
      tl.to(`${g} .anse`, { y: -18, duration: 0.25, ease: 'power1.inOut' }, at + 0.4)
      return at + 0.65
    }
    return at + 0.62
  }
  // Un bras prend une pose, la main suit ; la main se ferme (poing) ou s'ouvre (paume).
  function pose(cote, n, nom, at, d = 0.62) {
    tl.to(`#bras-${cote}${n}`, { attr: { d: bras(cote, nom) }, duration: d, ease: 'power2.inOut' }, at)
    const [x, y] = main(cote, nom)
    tl.to(`#main-${cote}${n}`, { x, y, duration: d, ease: 'power2.inOut' }, at)
    const paume = nom.startsWith('paume')
    tl.to(`#main-${cote}${n} .paume`, { opacity: paume ? 1 : 0, duration: 0.25, ease: 'power1.inOut' }, at + d / 2)
    tl.to(`#main-${cote}${n} .poing`, { opacity: paume ? 0 : 1, duration: 0.25, ease: 'power1.inOut' }, at + d / 2)
  }
  // Une flèche se trace : la ligne, puis la tête.
  function lance(id, at, d = 0.4) {
    tl.set(`#${id}`, { opacity: 1 }, at)
    const [ligne, tete] = $$(`#${id} path`)
    trace(ligne, at, d)
    trace(tete, at + d - 0.05, 0.25)
    return at + d + 0.2
  }

  // Les rôles de couleur (lib/manar.css) : action pour les flèches, erreur pour la boucle et le choc, lumière pour le
  // contour de A, fond pour les aplats. Les cadenas et les mains sont dessinés autour de leur origine (puis déplacés) : leur
  // trait « sketch » prend un filtre dont la zone entoure cette origine, sinon la moitié en coordonnées négatives serait coupée.
  const STYLE = `
    #schema .cp-action{stroke:var(--action)} #schema .cp-erreur{stroke:var(--erreur)} #schema .cp-reussite{stroke:var(--reussite)} #schema .cp-lumiere{stroke:var(--lumiere);stroke-width:12px}
    #schema .plein{fill:var(--fond)}
    #schema :is(#cad-a, #cad-b, [id^="main-"]) .trait{filter:url(#sketch-local)}
    #schema .cr-lettre{font-family:var(--police-schema);font-weight:700;font-size:64px;fill:var(--encre)}`
  const FILTRE = `<filter id="sketch-local" filterUnits="userSpaceOnUse" x="-120" y="-120" width="240" height="240">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="bruit"/>
        <feDisplacementMap in="SourceGraphic" in2="bruit" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>`

  return {
    monter({ a = 'A', b = 'B' } = {}) {
      const st = document.createElement('style')
      st.textContent = STYLE
      document.head.append(st)
      const boucle = 'M205 745 C205 690 225 640 258 622 L612 722 C650 733 690 750 702 775 C716 805 800 805 875 745 '
        + 'C875 690 855 640 822 622 L468 722 C430 733 390 750 378 775 C364 805 280 805 205 745 Z'
      // La géométrie est en pixels de la page, à taille réelle (pas la mise à l'échelle par défaut de #schema dans lib/stage.css).
      $('#schema').style.transform = 'none'
      $('#schema').innerHTML = `
    <svg viewBox="0 0 1080 1920">
      <defs>${FILTRE}</defs>
      <path id="boucle" class="trait cp-erreur" style="stroke-width:26;stroke-opacity:.6;opacity:0" d="${boucle}"/>
      ${perso('alice', 'a', '<path class="trait plein" style="fill:var(--encre)" d="M163 588 C122 596 112 642 130 676 C140 652 150 632 168 618 Z"/>')}
      ${perso('bob', 'b', '<path class="trait plein" style="fill:var(--encre)" d="M829 596 C824 538 926 538 921 596 C902 576 866 572 829 596 Z"/>', true)}
      ${cadenas('cad-a', a)}
      ${cadenas('cad-b', b)}
      ${fleche('demande-a', [258, 622], [612, 722], 'trait cp-action', 'style="opacity:0"')}
      ${fleche('demande-b', [822, 622], [468, 722], 'trait cp-action', 'style="opacity:0"')}
      <g id="choc" class="cache">${[90, 55, 125, 235, 270, 305].map(d => {
        const r = d * Math.PI / 180, c = Math.cos(r), s = -Math.sin(r)
        return `<path class="trait cp-erreur" d="M${Math.round(540 + 34 * c)} ${Math.round(702 + 34 * s)} L${Math.round(540 + 60 * c)} ${Math.round(702 + 60 * s)}"/>`
      }).join('')}</g>
      ${fleche('ordre-a', [258, 630], [466, 630], 'trait cp-action', 'style="opacity:0"')}
      ${fleche('ordre-b', [822, 630], [700, 630], 'trait cp-action', 'style="opacity:0"')}
      ${fleche('attente-b', [822, 630], [700, 630], 'trait', 'style="opacity:0;stroke-dasharray:12 12"')}
      ${fleche('passe-b', [822, 630], [614, 630], 'trait cp-action', 'style="opacity:0"')}
      ${fleche('final-a', [258, 630], [466, 630], 'trait cp-action', 'style="opacity:0"')}
      ${fleche('final-b', [822, 630], [614, 630], 'trait cp-action', 'style="opacity:0"')}
      <rect id="contour" class="trait cp-lumiere" x="462" y="508" width="156" height="204" rx="28"/>
    </svg>`
      // Les cadenas au centre, ouverts ; les mains au bout des bras baissés ; rien n'est encore tracé.
      for (const n of ['A', 'B']) {
        ou[n] = PLACES[n]
        gsap.set(`#cad-${n.toLowerCase()}`, { x: PLACES[n][0], y: PLACES[n][1] })
        gsap.set(`#cad-${n.toLowerCase()} .anse`, { y: -18 })
      }
      for (const c of ['a', 'b']) for (const n of [1, 2]) {
        const [x, y] = main(c, `bas${n}`)
        gsap.set(`#main-${c}${n}`, { x, y })
      }
      // Les traits à tracer restent cachés jusqu'à leur tracé (le trou du pointillé dépasse le trait).
      for (const el of $$('#schema svg :is(#alice, #bob, #cad-a, #cad-b) :is(path, rect, circle):not(.paume), #contour')) {
        const L = el.getTotalLength()
        gsap.set(el, { strokeDasharray: `${L} ${L + 20}`, strokeDashoffset: L + 10 })
      }
    },

    anime(mots) {
      const lettre = n => `#cad-${n} text`
      // 1. Mécanisme : les deux cadenas, les deux personnages, chacun en prend un.
      const tCadenas = cue(mots.cadenas)
      for (const [n, dt] of [['a', 0], ['b', 0.2]]) {
        traceTout($(`#cad-${n}`), tCadenas - 0.1 + dt, 0.45)
        tl.to(`#cad-${n} .plein`, { fillOpacity: 1, duration: 0.2 }, tCadenas + dt + 0.35)
        apparait(lettre(n), tCadenas + dt + 0.35)
      }
      son('feutre', tCadenas - 0.1)
      // Un personnage se trace d'un seul geste : la tête et le corps, puis les bras et les mains.
      let finPerso = 0
      for (const [qui, cote, mot] of [['#alice', 'a', mots.gauche], ['#bob', 'b', mots.droite]]) {
        const t = cue(mot) - 0.1
        $$(`${qui} > :is(path, circle)`).filter(e => !e.id).forEach((e, i) => trace(e, t + i * 0.08, 0.35))
        tl.to(`${qui} .plein`, { fillOpacity: 1, duration: 0.2 }, t + 0.4)
        for (const n of [1, 2]) {
          const b = $(`#bras-${cote}${n}`), d = t + 0.4
          trace(b, d, 0.4)
          tl.set(b, { strokeDasharray: 'none' }, d + 0.41)  // le bras changera de longueur
          trace($(`#main-${cote}${n} circle`), d + 0.2, 0.3)
          finPerso = d + 0.5
        }
        son('feutre', t)
      }
      const tTend = Math.max(cue(mots.tend), finPerso + 0.12)
      pose('a', 1, 'tend', tTend, 0.5)
      pose('b', 1, 'tend', tTend, 0.5)
      for (const [n, cote, mot] of [['A', 'a', mots.prendA], ['B', 'b', mots.prendB]]) {
        const t = cue(mot) - 0.05
        pose(cote, 1, 'tient', t)
        glisse(n, place(cote, 'tient'), t, { ferme: true })
      }
      const tDemande = cue(mots.demande)
      lance('demande-a', tDemande, 0.45)
      lance('demande-b', tDemande, 0.45)
      son('feutre', tDemande)
      const tChoc = tDemande + 0.72  // une fois les deux têtes de flèche posées
      tl.fromTo('#choc', { opacity: 1, scale: 0.6, svgOrigin: '540 702' }, { scale: 1.15, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, tChoc)
      tremble(tChoc)
      son('choc', tChoc)
      disparait('#choc', tChoc + 0.9, 0.3)
      // La boucle complète : Alice, sa flèche, B dans la main de Bob, Bob, sa flèche, A dans la main d'Alice.
      const tBoucle = cue(mots.boucle)
      tl.set('#boucle', { opacity: 1 }, tBoucle)
      trace($('#boucle'), tBoucle, 1.8)
      son('feutre', tBoucle)
      const tPulse = cue(mots.pulse)
      tl.to('#boucle', { strokeWidth: 38, strokeOpacity: 0.85, duration: 0.3, ease: 'power1.inOut', yoyo: true, repeat: 1 }, tPulse)

      // 2. Relance : flèches et boucle s'effacent, les cadenas se rouvrent au centre, les bras se baissent.
      disparait(['#boucle', '#demande-a', '#demande-b'], mots.reset)
      const tRetour = mots.reset + 0.5
      for (const [n, cote] of [['A', 'a'], ['B', 'b']]) {
        glisse(n, PLACES[n], tRetour, { ouvre: true })
        pose(cote, 1, 'bas1', tRetour)
      }

      // 3. Solution : tout le monde prend A, puis B.
      const tOrdre = cue(mots.ordre)
      lance('ordre-a', tOrdre, 0.45)
      lance('ordre-b', tOrdre, 0.45)
      son('feutre', tOrdre)
      const tA = cue(mots.soloA) - 0.05
      pose('a', 1, 'haut', tA)
      disparait('#ordre-a', tA, 0.3)
      let fin = glisse('A', place('a', 'haut'), tA, { ferme: true })
      // A est pris : la flèche de Bob passe en pointillé grisé, elle attend.
      const tAttente = fin + 0.22
      disparait('#ordre-b', tAttente, 0.3)
      tl.to('#attente-b', { opacity: 0.5, duration: 0.3, ease: 'power1.inOut' }, tAttente)
      const tB = Math.max(cue(mots.soloB) - 0.05, tAttente + 0.45)
      pose('a', 2, 'bas', tB)
      fin = glisse('B', place('a', 'bas'), tB, { ferme: true })
      // Bob attend, les mains ouvertes et vides.
      const tVides = Math.max(cue(mots.vides), fin + 0.22)
      pose('b', 1, 'paume1', tVides, 0.5)
      pose('b', 2, 'paume2', tVides, 0.5)
      // Alice relâche A, puis B : chacun se rouvre et revient au centre.
      const tFinit = cue(mots.finit)
      pose('a', 1, 'bas1', tFinit)
      glisse('A', PLACES.A, tFinit, { ouvre: true })
      pose('a', 2, 'bas2', tFinit + 0.2)
      fin = glisse('B', PLACES.B, tFinit + 0.2, { ouvre: true })
      son('pop', tFinit)
      son('pop', tFinit + 0.2)
      // Bob passe : sa flèche redevient pleine et atteint A, puis il prend A, puis B. Pas avant que B soit au centre.
      const tPasse = Math.max(cue(mots.passe), fin + 0.22)
      disparait('#attente-b', tPasse, 0.3)
      son('feutre', tPasse)
      // Une fois la flèche posée : A part le premier, B le suit de près (la voix enchaîne sur « Même ordre »).
      const tPrend = lance('passe-b', tPasse, 0.4) + 0.22
      disparait('#passe-b', tPrend, 0.3)
      pose('b', 1, 'haut', tPrend)
      glisse('A', place('b', 'haut'), tPrend, { ferme: true })
      pose('b', 2, 'bas', tPrend + 0.2)
      fin = glisse('B', place('b', 'bas'), tPrend + 0.2, { ferme: true })

      // 4. À retenir : Bob relâche, puis les deux flèches visent A, et A se met en lumière (miel).
      const tRelache = Math.max(cue(mots.relache), fin + 0.22)
      pose('b', 1, 'bas1', tRelache)
      glisse('A', PLACES.A, tRelache, { ouvre: true })
      pose('b', 2, 'bas2', tRelache)
      fin = glisse('B', PLACES.B, tRelache, { ouvre: true })
      son('pop', tRelache)
      const tTous = Math.max(cue(mots.tous), fin + 0.22)
      lance('final-a', tTous, 0.45)
      fin = lance('final-b', tTous, 0.45)
      son('feutre', tTous)
      const tContour = Math.max(cue(mots.contour), fin + 0.22)
      trace($('#contour'), tContour, 0.55)
      son('feutre', tContour)
    },
  }
})()
