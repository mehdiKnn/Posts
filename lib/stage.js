// La machinerie commune des vidéos courtes. À charger après GSAP et `voix-align.js` ; chaque vidéo n'écrit que son schéma
// (ou choisit un dispositif de lib/dispositifs/), les repères de sa timeline et l'appel final à `demarrer()`.
//
// Ce que la page donne : #stage > #cam (titre, schéma), #mascotte (une <img data-pose> par pose, sans src : la lib la donne),
// #st (sous-titres), #signature (facultatif), #mot (le mot à retenir). Ce que la lib expose : cue, trace, apparait…, colle,
// mascotte, sousTitres, carteDeFin, signature, finir, demarrer, et window.REPERES / window.SFX que lisent render.mjs et verifier.mjs.
const $ = s => document.querySelector(s)
const $$ = s => [...document.querySelectorAll(s)]
const tl = gsap.timeline({ paused: true })
window.tl = tl
window.REPERES = []  // chaque repère et son instant : les contrôles (render.mjs controle, verifier.mjs) les lisent
window.SFX = []      // chaque bruitage et son instant : render.mjs les mixe avec la voix

// Instant où la voix prononce `p` ; les repères se demandent dans l'ordre du texte.
let curseur = 0
function cue(p) {
  const i = ALIGN.text.indexOf(p, curseur)
  if (i < 0) throw new Error('Repère introuvable dans la voix : ' + p)
  curseur = i + p.length
  REPERES.push({ mot: p, i, t: ALIGN.t[i] })
  return ALIGN.t[i]
}
const R = ALIGN.repliques  // les répliques : qui parle, de quand à quand

// Un bruitage dit quelque chose (un trait qui se pose, un choc, un cadenas qui claque) : jamais de décor sonore.
// Les sons sont ceux de lib/sfx/ : feutre, choc, clac, pop ; et les voix de fin de sons/fin-<mascotte>.mp3, avec leur volume.
const son = (nom, t, volume) => window.SFX.push({ son: nom, t, volume })

// Un trait se dessine comme au feutre.
function trace(el, at, duree = 0.5) {
  const L = el.getTotalLength()
  // Le trou du pointillé dépasse le trait, sinon son bout arrondi laisse un point visible avant le tracé.
  gsap.set(el, { strokeDasharray: `${L} ${L + 20}`, strokeDashoffset: L + 10 })
  tl.to(el, { strokeDashoffset: 0, duration: duree, ease: 'power1.inOut' }, at)
}
const traceTout = (g, at, duree) => g.querySelectorAll('path, rect, circle').forEach((el, i) => trace(el, at + i * 0.12, duree))
const apparait = (el, at, d = 0.3) => tl.to(el, { opacity: 1, duration: d, ease: 'power1.out' }, at)
const disparait = (els, at, d = 0.35) => tl.to(els, { opacity: 0, duration: d, ease: 'power1.in' }, at)
const ecrit = (el, at, d = 0.7) => tl.to(el, { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'none' }, at)
let FIN = ALIGN.end + 1.5  // la fin de la vidéo ; la carte de fin et la signature la repoussent
const tremble = at => tl.to('#cam', { keyframes: { x: [0, -14, 12, -8, 5, 0] }, duration: 0.4, ease: 'none' }, at)
// Un objet se pose : il arrive un peu grand et penché, puis se plaque sur la feuille.
const colle = (el, at) => (son('pop', at), tl.fromTo(el, { opacity: 0, scale: 1.25, rotation: -8, transformOrigin: '50% 50%' },
  { opacity: 1, scale: 1, rotation: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, at))

// La carte de fin, commune à toutes les vidéos : le schéma, le titre et la mascotte s'effacent, puis la voix off de la mascotte
// dit « Like, et abonne-toi ! » (sons/fin-<mascotte>.mp3) : le cœur se colle sur « Like », l'abonnement sur « abonne », seuls au
// milieu de la feuille. À appeler avant signature(). Les instants de « Like », de « abonne » et de la fin dans chaque voix :
// `sh sons/generer.sh` les produit, et une nouvelle mascotte ajoute sa ligne ici.
const VOIX_FIN = {
  taupe: { like: 0.4, abonne: 1.12, fin: 2.08 },
  cameleon: { like: 0.16, abonne: 1.04, fin: 1.92 },
}
function carteDeFin(qui = 'taupe') {
  const v = VOIX_FIN[qui]
  if (!v) throw new Error('Pas de voix de fin pour la mascotte : ' + qui)
  $('#cam').insertAdjacentHTML('beforeend', `<div id="fin">
    <img id="coeur" src="../../charte/autocollants/coeur.png" style="left:160px;top:780px;width:340px" alt="">
    <img id="abonne" src="../../charte/autocollants/abonne.png" style="left:599px;top:780px;width:302px" alt="">
    <div class="legende" id="j-aime" style="left:150px;top:1126px">Like</div>
    <div class="legende" id="abonne-toi" style="left:570px;top:1126px">Abonne-toi</div>
  </div>`)
  const at = ALIGN.end + 0.4
  disparait(['#schema', '#titre', '#mot', '#cam > svg', '#mascotte'], at, 0.35)
  const voix = at + 0.5 - v.like
  son(`fin-${qui}`, voix, 1)
  colle(['#coeur', '#j-aime'], at + 0.5)
  colle(['#abonne', '#abonne-toi'], voix + v.abonne)
  FIN = voix + v.fin + 1.5
}

// La signature du studio : la feuille revient, vide, avec son nom écrit ; elle s'efface pour la boucle.
const SIGNATURE_S = 1.4
function signature() {
  const s = window.SIGNATURE
  if (!s) return
  $('#signature .nom').textContent = s.nom
  $('#signature .accroche').textContent = s.accroche || ''
  const debut = FIN
  window.SIGNATURE_DEBUT = debut
  FIN += SIGNATURE_S
  tl.set('#signature', { opacity: 1 }, debut)
  // Dessous, la feuille se vide : quand la signature s'efface, on retrouve la première image (le titre pas encore écrit,
  // la mascotte à l'écoute), et la vidéo boucle sans à-coup.
  tl.set(['#titre', '#mot', '#schema', '#cam > svg', '#fin'], { opacity: 0 }, debut)
  tl.set('#mascotte', { opacity: 1 }, debut)  // la carte de fin l'avait effacée : elle revient, à l'écoute
  ecrit('#signature .nom', debut + 0.1, 0.55)
  son('feutre', debut + 0.1)
  apparait('#signature .accroche', debut + 0.55, 0.3)
  // Elle s'efface en fin de vidéo : la dernière image est la feuille vide de la première. Le fondu finit une image avant la fin,
  // car l'export s'arrête sur la dernière image entière (FIN − 1/30 s), qui doit être propre.
  tl.to('#signature', { opacity: 0, duration: 0.3, ease: 'power1.in' }, FIN - 0.4)
}
// La durée de la vidéo : la voix, une pause pour que la règle se lise, puis la signature s'il y en a une.
const finir = () => tl.set({}, {}, FIN)

// La mascotte : la pose change selon qui parle (la mascotte, bâton levé, ou l'élève, qu'elle écoute). Sa bouche ne bouge jamais :
// quand elle parle, un petit saut façon Wankil (14 px, 0,18 s) marque chaque syllabe qui suit la précédente de 0,22 s au moins,
// d'après l'horodatage lettre par lettre de la voix. `qui` est sa clé : le `qui` de ses répliques dans dialogue.json, son dossier
// de mascottes/ (sprites) et sa voix de fin.
const VOYELLE = /[aeiouyàâäéèêëîïôöùûü]/i
let majMascotte = () => {}
function mascotte({ qui = 'taupe', parle = 'pointe', ecoute = 'neutre' } = {}) {
  for (const i of $$('#mascotte img')) i.src = `../../mascottes/${qui}/sprites/${i.dataset.pose}.png`
  // Après la dernière réplique, quand la signature prend la feuille, la mascotte retourne à l'écoute (pour la boucle).
  const repos = window.SIGNATURE_DEBUT !== undefined ? [[window.SIGNATURE_DEBUT, ecoute]] : []
  const POSES = [[0, ecoute], ...R.map(r => [Math.max(0, r.debut - 0.1), r.qui === qui ? parle : ecoute]), ...repos]
    .filter((p, i, toutes) => i === 0 || p[1] !== toutes[i - 1][1])  // seulement les vrais changements de pose
  const SAUTS = []
  for (const r of R.filter(r => r.qui === qui)) {
    let balise = false  // [sighs], [deadpan] : pas prononcés
    let avant = -Infinity
    for (let i = r.de; i < r.a; i++) {
      const c = ALIGN.text[i]
      if (c === '[') balise = true
      if (!balise && VOYELLE.test(c) && !VOYELLE.test(ALIGN.text[i - 1] ?? '')) {
        if (ALIGN.t[i] - avant >= 0.22) SAUTS.push(ALIGN.t[i])
        avant = ALIGN.t[i]
      }
      if (c === ']') balise = false
    }
  }
  // Hauteur du saut en cours, de 0 à 1 et retour en 0,18 s.
  const saut = t => {
    const a = SAUTS.findLast(a => a <= t)
    const p = a === undefined ? 1 : (t - a) / 0.18
    return p < 1 ? Math.sin(Math.PI * p) : 0
  }
  const images = Object.fromEntries($$('#mascotte img').map(i => [i.dataset.pose, i]))
  let visible = null
  majMascotte = t => {
    let i = 0
    while (i + 1 < POSES.length && POSES[i + 1][0] <= t) i++
    const [debutPose, pose] = POSES[i]
    if (pose !== visible) {
      if (visible) images[visible].style.visibility = 'hidden'
      images[pose].style.visibility = 'visible'
      visible = pose
    }
    // Petit rebond au changement de pose, respiration lente, et les sauts quand elle parle.
    const rebond = 1 + 0.035 * Math.max(0, 1 - (t - debutPose) / 0.18)
    const h = pose === parle ? saut(t) : 0
    gsap.set('#mascotte', { y: -14 * h, scaleX: rebond * (1 - 0.015 * h), scaleY: rebond * (1 + 0.008 * Math.sin(t * 2.1) + 0.03 * h) })
  }
}

// Sous-titres : la voix, balises de jeu retirées, en morceaux d'au plus ST_MAX signes, coupés aussi après . ? ! … :
// chaque morceau s'affiche de son premier mot au morceau suivant, et s'éteint à la fin de sa réplique.
const ST_MAX = 36  // deux lignes
let majST = () => {}
function sousTitres() {
  const ST = []
  for (const r of R) {
    const mots = []
    let avant = ''  // un « isolé attend le mot qui le suit
    for (const m of ALIGN.text.slice(r.de, r.a).matchAll(/\[[^\]]*\]|\S+/g)) {
      const w = m[0], t = ALIGN.t[r.de + m.index]
      if (w.startsWith('[')) continue
      if (/[\p{L}\d]/u.test(w)) mots.push({ w: avant + w, t }), avant = ''
      else if (w.startsWith('«')) avant = w + ' '
      else if (mots.length) mots.at(-1).w += ' ' + w  // ? : » collés au mot d'avant
    }
    const debut = ST.length
    for (const { w, t } of mots) {
      const der = ST.length > debut && ST.at(-1)
      if (der && der.texte.length + 1 + w.length <= ST_MAX && !/[.?!…:]$/.test(der.texte)) der.texte += ' ' + w
      else ST.push({ texte: w, de: t })
    }
    for (let k = debut; k < ST.length; k++) ST[k].a = ST[k + 1]?.de ?? r.fin
  }
  const st = $('#st span')
  majST = t => {
    const texte = ST.find(s => s.de <= t && t < s.a)?.texte ?? ''
    if (st.textContent !== texte) st.textContent = texte
  }
}

// Une image de la page à l'instant t : la timeline, la pose, le sous-titre.
window.seekTo = t => { tl.seek(t); majMascotte(t); majST(t) }

// Quand tout est chargé : la page est prête pour l'export ; ouverte à la main, elle se lance d'un clic, avec le son.
function demarrer() {
  Promise.all([...$$('img').map(i => i.decode())])
    .then(() => document.fonts.ready)
    .then(() => {
      window.seekTo(0)
      window.ready = true
      if (location.search.includes('render')) return
      const fit = () => $('#stage').style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`
      fit(); addEventListener('resize', fit)
      const play = $('#play'), vo = $('#vo')
      play.style.display = 'grid'
      play.onclick = () => { play.style.display = 'none'; vo.currentTime = 0; vo.play(); tl.restart() }
      gsap.ticker.add(() => { majMascotte(tl.time()); majST(tl.time()) })
    })
}
