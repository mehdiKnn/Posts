// La machinerie commune des vidéos courtes. À charger après GSAP et `voix-align.js` ; chaque vidéo n'écrit que son schéma
// (ou choisit un dispositif de lib/dispositifs/), les repères de sa timeline et l'appel final à `demarrer()`.
//
// Ce que la page donne : #stage > #cam (titre, schéma), #taupe (une <img data-pose> par pose), #st (sous-titres),
// #signature (facultatif), #mot (le mot à retenir). Ce que la lib expose : cue, trace, apparait…, mascotte, sousTitres,
// signature, finir, demarrer, et window.REPERES / window.SFX que lisent render.mjs et verifier.mjs.
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
// Les sons sont ceux de lib/sfx/ : feutre, choc, clac, pop.
const son = (nom, t) => window.SFX.push({ son: nom, t })

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
const tremble = at => tl.to('#cam', { keyframes: { x: [0, -14, 12, -8, 5, 0] }, duration: 0.4, ease: 'none' }, at)

// La signature du studio : la feuille revient, vide, avec son nom écrit ; elle s'efface pour la boucle.
const SIGNATURE_S = 1.4
let FIN = ALIGN.end + 1.5
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
  tl.set(['#titre', '#mot', '#schema', '#cam > svg'], { opacity: 0 }, debut)
  ecrit('#signature .nom', debut + 0.1, 0.55)
  son('feutre', debut + 0.1)
  apparait('#signature .accroche', debut + 0.55, 0.3)
  // Elle s'efface en fin de vidéo : la dernière image est la feuille vide de la première. Le fondu finit une image avant la fin,
  // car l'export s'arrête sur la dernière image entière (FIN − 1/30 s), qui doit être propre.
  tl.to('#signature', { opacity: 0, duration: 0.3, ease: 'power1.in' }, FIN - 0.4)
}
// La durée de la vidéo : la voix, une pause pour que la règle se lise, puis la signature s'il y en a une.
const finir = () => tl.set({}, {}, FIN)

// La mascotte : la pose change selon qui parle (la mascotte, bâton levé, ou l'élève, qu'elle écoute) et, quand elle
// parle, sa bouche suit la voix : une ouverture par syllabe, d'après l'horodatage lettre par lettre.
const VOYELLE = /[aeiouyàâäéèêëîïôöùûü]/i
let majTaupe = () => {}
function mascotte({ qui = 'taupe', parle = 'pointe', ecoute = 'neutre' } = {}) {
  // Après la dernière réplique, quand la signature prend la feuille, la mascotte retourne à l'écoute (pour la boucle).
  const repos = window.SIGNATURE_DEBUT !== undefined ? [[window.SIGNATURE_DEBUT, ecoute]] : []
  const POSES = [[0, ecoute], ...R.map(r => [Math.max(0, r.debut - 0.1), r.qui === qui ? parle : ecoute]), ...repos]
    .filter((p, i, toutes) => i === 0 || p[1] !== toutes[i - 1][1])  // seulement les vrais changements de pose
  // Ouverte 60 % du temps jusqu'à la syllabe suivante, au moins 2 images ouverte puis 2 fermée (sinon la syllabe saute).
  const BOUCHE = []
  for (const r of R.filter(r => r.qui === qui)) {
    const syllabes = []
    let balise = false  // [sighs], [deadpan] : pas prononcés
    for (let i = r.de; i < r.a; i++) {
      const c = ALIGN.text[i]
      if (c === '[') balise = true
      if (!balise && VOYELLE.test(c) && !VOYELLE.test(ALIGN.text[i - 1] ?? '')) syllabes.push(ALIGN.t[i])
      if (c === ']') balise = false
    }
    syllabes.forEach((d, k) => {
      if (BOUCHE.length && d < BOUCHE.at(-1)[1] + 0.067) return
      const suivante = syllabes[k + 1] ?? d + 0.3
      BOUCHE.push([d, d + Math.min(0.16, Math.max(0.067, 0.6 * (suivante - d)))])
    })
  }
  const boucheOuverte = t => BOUCHE.some(([a, b]) => a <= t && t < b)
  const images = Object.fromEntries($$('#taupe img').map(i => [i.dataset.pose, i]))
  let visible = null
  majTaupe = t => {
    let i = 0
    while (i + 1 < POSES.length && POSES[i + 1][0] <= t) i++
    const [debutPose, pose] = POSES[i]
    const image = pose === parle ? (boucheOuverte(t) ? `${parle}-ouverte` : `${parle}-fermee`) : pose
    if (image !== visible) {
      if (visible) images[visible].style.visibility = 'hidden'
      images[image].style.visibility = 'visible'
      visible = image
    }
    // Petit rebond au changement de pose, et respiration lente.
    const rebond = 1 + 0.035 * Math.max(0, 1 - (t - debutPose) / 0.18)
    gsap.set('#taupe', { scaleX: rebond, scaleY: rebond * (1 + 0.008 * Math.sin(t * 2.1)) })
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
window.seekTo = t => { tl.seek(t); majTaupe(t); majST(t) }

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
      gsap.ticker.add(() => { majTaupe(tl.time()); majST(tl.time()) })
    })
}
