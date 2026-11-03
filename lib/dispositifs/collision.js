// Dispositif « collision » (concurrence, verrou, cache incohérent) : deux acteurs, chacun sur son écran, frappent le
// même objet au même instant ; la solution remet le schéma à zéro, y pose un verrou, et le second attend.
//
//   Collision.monter({ lecture: '1 place', fin: 'complet' })   écrit le schéma dans #schema
//   Collision.anime({ objet: 'Il reste', gauche: 'Alice', ... }) pose les gestes sur la timeline, chacun sur son mot
//
// Les mots sont ceux de la voix (cue() les cherche dans l'ordre du texte) : changer le texte du dialogue change
// les repères, pas la géométrie. `mots.reset` est un instant (la fin de la relance), pas un mot.
//
// Aucune couleur écrite ici : la page les donne en variables CSS, une par rôle (DA : lib/manar.css).
//   --encre (contours), --fond (l'intérieur des téléphones, du billet, du double et du cadenas), --action (les clics, les
//   flèches, l'attente, l'étoile du billet), --erreur (le choc, le double), --reussite (les coches, le cadenas, l'achat
//   d'Alice, « complet »), --police-schema (les écrans). L'épaisseur du trait vient de la classe `.trait` de la page.
const Collision = {
  STYLE: `
    #schema .co-action{stroke:var(--action)} #schema .co-erreur{stroke:var(--erreur)} #schema .co-reussite{stroke:var(--reussite)}
    #schema .co-fond{fill:var(--fond)}
    .ecran{font-family:var(--police-schema);color:var(--encre)}
    .ecran.co-reussite{color:var(--reussite)}`,

  monter({ lecture = '1 place', fin = 'complet' } = {}) {
    const st = document.createElement('style')
    st.textContent = this.STYLE
    document.head.append(st)
    const billet = 'M455 575 H625 V610 A20 20 0 0 0 625 650 V685 H455 V650 A20 20 0 0 0 455 610 Z'
    $('#schema').innerHTML = `
    <svg viewBox="0 0 1080 1920">
      <g id="tel-a">
        <rect class="trait plein co-fond" x="130" y="430" width="230" height="400" rx="32"/>
        <rect class="trait" x="148" y="480" width="194" height="290" rx="10"/>
        <circle class="trait" cx="245" cy="802" r="9"/>
      </g>
      <g id="tel-b">
        <rect class="trait plein co-fond" x="720" y="430" width="230" height="400" rx="32"/>
        <rect class="trait" x="738" y="480" width="194" height="290" rx="10"/>
        <circle class="trait" cx="835" cy="802" r="9"/>
      </g>
      <circle id="tap-a" class="trait co-action cache" cx="245" cy="625" r="40"/>
      <circle id="tap-b" class="trait co-action cache" cx="835" cy="625" r="40"/>
      <path id="ok-a" class="trait co-reussite" d="M215 690 L238 712 L278 668"/>
      <path id="ok-b" class="trait co-reussite" d="M805 690 L828 712 L868 668"/>
      <g id="double" class="cache"><path class="trait co-erreur co-fond" d="${billet}"/></g>
      <g id="billet">
        <path class="trait plein co-fond" d="${billet}"/>
        <path id="etoile" class="trait co-action" d="M540 604 L548 622 L567 623 L552 635 L557 654 L540 643 L523 654 L528 635 L513 623 L532 622 Z"/>
      </g>
      <g id="fleche-a"><path class="trait co-action" d="M368 630 H440"/><path class="trait co-action tete" d="M424 614 L442 630 L424 646"/></g>
      <g id="fleche-b"><path class="trait co-action" d="M712 630 H640"/><path class="trait co-action tete" d="M656 614 L638 630 L656 646"/></g>
      <g id="choc" class="cache">
        <path class="trait co-erreur" d="M540 548 V522"/><path class="trait co-erreur" d="M500 556 L486 536"/><path class="trait co-erreur" d="M580 556 L594 536"/>
        <path class="trait co-erreur" d="M540 712 V738"/><path class="trait co-erreur" d="M500 704 L486 724"/><path class="trait co-erreur" d="M580 704 L594 724"/>
      </g>
      <g id="verrou" class="cache">
        <path id="anse" class="trait co-reussite" d="M524 529 V513 A16 16 0 0 1 556 513 V529"/>
        <rect class="trait co-reussite co-fond" x="512" y="527" width="56" height="44" rx="8"/>
      </g>
      <g id="achat-a"><path class="trait co-reussite" d="M368 630 H440"/><path class="trait co-reussite tete" d="M424 614 L442 630 L424 646"/></g>
      <path id="attente-b" class="trait co-action cache" d="M712 630 H668" style="stroke-dasharray:12 12"/>
    </svg>
    <div class="ecran" id="place-a" style="left:148px;top:598px">${lecture}</div>
    <div class="ecran" id="place-b" style="left:738px;top:598px">${lecture}</div>
    <div class="ecran co-reussite" id="complet" style="left:738px;top:598px">${fin}</div>`
  },

  anime(mots) {
    // 1. Mécanisme : l'objet, les deux acteurs, la collision.
    const tObjet = cue(mots.objet)
    traceTout($('#billet'), tObjet - 0.1)
    son('feutre', tObjet - 0.1)
    tl.to('#billet .plein', { fillOpacity: 1, duration: 0.2 }, tObjet + 0.3)
    for (const [g, mot] of [['#tel-a', mots.gauche], ['#tel-b', mots.droite]]) {
      const t = cue(mot)
      traceTout($(g), t - 0.1, 0.45)
      son('feutre', t - 0.1)
      tl.to(`${g} .plein`, { fillOpacity: 1, duration: 0.2 }, t + 0.3)
    }
    const tClic = cue(mots.clic)
    for (const tap of ['#tap-a', '#tap-b']) tl.fromTo(tap, { opacity: 1, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.6, duration: 0.6, ease: 'power2.out', immediateRender: false }, tClic)
    son('pop', tClic)
    const tLecture = cue(mots.lecture)
    apparait(['#place-a', '#place-b'], tLecture)
    son('pop', tLecture)
    const tAction = cue(mots.action)
    for (const f of ['#fleche-a', '#fleche-b']) {
      const [ligne, tete] = $$(`${f} path`)
      trace(ligne, tAction - 0.05, 0.3)
      trace(tete, tAction + 0.22, 0.12)
    }
    son('feutre', tAction - 0.05)
    tl.fromTo('#choc', { opacity: 1, scale: 0.6, svgOrigin: '540 630' }, { scale: 1.15, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, tAction + 0.3)
    tremble(tAction + 0.3)
    son('choc', tAction + 0.3)
    const tControle = cue(mots.controle)
    trace($('#ok-a'), tControle, 0.3)
    trace($('#ok-b'), tControle + 0.1, 0.3)
    const tDoublon = cue(mots.doublon)
    tl.fromTo('#double', { opacity: 1, x: 0, y: 0, rotation: 0, svgOrigin: '540 630' }, { x: 70, y: 70, rotation: 9, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, tDoublon)
    son('pop', tDoublon)

    // 2. Relance : le schéma revient à zéro.
    disparait(['#double', '#choc', '#fleche-a', '#fleche-b', '#place-a', '#place-b', '#ok-a', '#ok-b'], mots.reset)

    // 3. Solution : même schéma, avec un verrou.
    const tVerrou = cue(mots.verrou)
    tl.set('#verrou', { opacity: 1 }, tVerrou - 0.1)
    traceTout($('#verrou'), tVerrou - 0.1, 0.35)
    son('feutre', tVerrou - 0.1)
    tl.fromTo('#anse', { y: -14 }, { y: 0, duration: 0.25, ease: 'back.out(3)' }, tVerrou + 0.45)  // le cadenas se ferme
    son('clac', tVerrou + 0.5)
    const tGagnant = cue(mots.gagnant)
    const [ligneA, teteA] = $$('#achat-a path')
    trace(ligneA, tGagnant, 0.3)
    trace(teteA, tGagnant + 0.27, 0.12)
    son('feutre', tGagnant)
    const tAttend = cue(mots.attend)
    tl.fromTo('#attente-b', { opacity: 1, scaleX: 0, svgOrigin: '712 630' }, { scaleX: 1, duration: 0.4, ease: 'power1.out', immediateRender: false }, tAttend)
    const tFin = cue(mots.fin) - 0.05
    apparait('#complet', tFin)
    son('pop', tFin)
  },
}
