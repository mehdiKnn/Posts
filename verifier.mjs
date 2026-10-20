// node verifier.mjs videos/deadlock → JSON des contrôles mesurables, selon les fichiers présents dans le dossier :
//   dialogue.json : mots et durée estimée ; storyboard.md : repères de synchro ;
//   voix-align.js : durée réelle, ouverture et débit réel de chaque voix ;
//   index.html : couleurs hors charte, zones sûres, textes trop petits, temps morts du schéma, gestes qui se chevauchent,
//   repères de cue() ;
//   video.mp4 : fiche technique. La partie page passe par playwright-core (npm install), comme render.mjs.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

// Recopiés de la charte (débits), de voix.py (blanc), de script.md (bornes), d'animation.md et texte.md (zones, taille).
const DEBIT = { taupe: 2.3, eleve: 3.3 }
const BLANC = 0.45
const BORNES = [30, 45]
const OUVERTURE = 3  // secondes au plus pour l'idée fausse de l'élève
const ZONE = { haut: 250, bas: 1920 - 440, droite: 1080 - 120, gauche: 0 }
const POLICE_MIN = 48
const TEMPS_MORT = 3  // secondes où le schéma ne bouge pas pendant la voix
// Deux éléments lancés à moins de ECART secondes l'un de l'autre font un seul geste (un billet et sa traînée,
// la paire symétrique d'une collision) ; au-delà, un geste qui démarre pendant qu'un autre bouge est un chevauchement.
const ECART = 0.25
const PAS = 0.1

const dir = process.argv[2]
const lire = f => existsSync(`${dir}/${f}`) ? readFileSync(`${dir}/${f}`, 'utf8') : null
const r1 = x => Math.round(x * 10) / 10
const sansBalises = s => s.replace(/\[[^\]]*\]/g, ' ')
const compte = s => sansBalises(s).split(/\s+/).filter(w => /[\p{L}\d]/u.test(w)).length
const out = {}

const dialogue = lire('dialogue.json') && JSON.parse(lire('dialogue.json')).repliques
if (dialogue) {
  const mots = {}, problemes = []
  dialogue.forEach((r, i) => {
    if (!(r.qui in DEBIT)) problemes.push(`réplique ${i + 1} : voix « ${r.qui} » absente de voix.py`)
    mots[r.qui] = (mots[r.qui] || 0) + compte(r.texte)
  })
  const duree = r1(Object.entries(mots).reduce((s, [qui, n]) => s + n / (DEBIT[qui] ?? 3), 0) + BLANC * (dialogue.length - 1))
  if (duree < BORNES[0] || duree > BORNES[1]) problemes.push(`durée estimée ${duree} s, hors de ${BORNES.join(' à ')} s`)
  if (/\[[a-z ]+\](?!\()/.test(lire('script.md') || '')) problemes.push('script.md contient des balises de jeu')
  out.dialogue = { mots, duree_estimee: duree, problemes }
}

// La voix réelle, dès que voix.py l'a produite : l'ouverture se mesure, et les débits de la charte se recalent.
const voixAlign = lire('voix-align.js')
if (voixAlign && dialogue) {
  const align = JSON.parse(voixAlign.slice(voixAlign.indexOf('=') + 1))
  const reel = {}, problemes = []
  align.repliques.forEach((s, i) => {
    const r = (reel[s.qui] ??= { mots: 0, secondes: 0 })
    r.mots += compte(dialogue[i]?.texte ?? '')
    r.secondes += s.fin - s.debut
  })
  const debits = Object.fromEntries(Object.entries(reel).map(([qui, r]) => [qui, Math.round(r.mots / r.secondes * 100) / 100]))
  for (const [qui, d] of Object.entries(debits))
    if (DEBIT[qui] && Math.abs(d - DEBIT[qui]) > 0.1 * DEBIT[qui]) problemes.push(`débit réel de ${qui} : ${d} mots/s, la charte dit ${DEBIT[qui]}`)
  const ouverture = r1(align.repliques[0].fin - align.repliques[0].debut)
  if (ouverture > OUVERTURE) problemes.push(`ouverture de ${ouverture} s, au-delà de ${OUVERTURE} s`)
  out.voix = { duree: r1(align.end), ouverture, debits, problemes }
}

// Les repères du storyboard, cherchés comme cue() les cherche : dans l'ordre du texte, chacun une fois.
const storyboard = lire('storyboard.md')
if (storyboard && dialogue) {
  const section = storyboard.split(/^## Repères.*$/m)[1]?.split(/^## /m)[0] ?? ''
  const reperes = section.split('\n').filter(l => l.startsWith('|') && !l.includes('sans repère'))
    .map(l => l.split('|')[2]?.match(/`([^`]+)`/)?.[1]).filter(Boolean)
  const texte = dialogue.map(r => r.texte).join(' ')
  const res = { reperes: reperes.length, introuvables: [], hors_ordre: [], doublons: [] }
  let curseur = 0
  reperes.forEach((mot, k) => {
    if (reperes.indexOf(mot) < k) res.doublons.push(mot)
    const i = texte.indexOf(mot, curseur)
    if (i >= 0) curseur = i + mot.length
    else (texte.includes(mot) ? res.hors_ordre : res.introuvables).push(mot)
  })
  out.storyboard = reperes.length ? res : { erreur: 'aucun repère lu : section « ## Repères de synchro » absente, ou repères hors de la 2e colonne' }
}

const html = lire('index.html')
if (html && voixAlign) {
  const charte = readFileSync(new URL('.claude/skills/video-courte/charte.md', import.meta.url), 'utf8')
  const palette = new Set(charte.match(/#[0-9A-F]{6}\b/gi).map(c => c.toUpperCase()))
  const couleurs = {}
  html.split('\n').forEach((l, n) => {
    for (const [c] of l.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![\w-])/gi))
      if (!palette.has(c.toUpperCase())) (couleurs[c.toUpperCase()] ??= []).push(n + 1)
  })
  out.page = { couleurs_hors_charte: couleurs }

  const { chromium } = await import(process.env.PW || 'playwright-core')
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  const erreurs = []
  page.on('pageerror', e => erreurs.push(e.message))
  await page.goto(pathToFileURL(`${dir}/index.html`) + '?render')
  try {
    await page.waitForFunction(() => window.ready, null, { timeout: 30000 })
    Object.assign(out.page, await page.evaluate(mesurer, { ZONE, POLICE_MIN, TEMPS_MORT, ECART, PAS }))
  } catch (e) {
    out.page.erreurs = erreurs.length ? erreurs : [e.message]
  }
  await browser.close()
}

if (existsSync(`${dir}/video.mp4`)) {
  const p = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate:format=duration',
    '-of', 'json', `${dir}/video.mp4`], { encoding: 'utf8' }))
  const v = p.streams.find(s => s.codec_type === 'video'), a = p.streams.find(s => s.codec_type === 'audio')
  const video = { largeur: v.width, hauteur: v.height, fps: v.r_frame_rate, codec_video: v.codec_name, codec_audio: a?.codec_name, duree: r1(+p.format.duration) }
  const problemes = []
  if (v.width !== 1080 || v.height !== 1920) problemes.push(`${v.width} × ${v.height} au lieu de 1080 × 1920`)
  if (v.r_frame_rate !== '30/1') problemes.push(`${v.r_frame_rate} images par seconde au lieu de 30`)
  if (v.codec_name !== 'h264' || a?.codec_name !== 'aac') problemes.push(`codecs ${v.codec_name} et ${a?.codec_name} au lieu de h264 et aac`)
  const attendue = out.page?.duree
  if (attendue && Math.abs(video.duree - attendue) > 0.15) problemes.push(`durée ${video.duree} s au lieu de ${attendue} s (la timeline)`)
  if (html && statSync(`${dir}/video.mp4`).mtimeMs < statSync(`${dir}/index.html`).mtimeMs) problemes.push('video.mp4 est plus ancienne que index.html : à réexporter')
  out.video = { ...video, problemes }
}

console.log(JSON.stringify(out, null, 1))

// Dans la page : parcourt la timeline tous les PAS secondes, la mascotte mise à part (sa place est fixée par animation.md).
function mesurer({ ZONE, POLICE_MIN, TEMPS_MORT, ECART, PAS }) {
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100
  const dit = s => s.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim()
  const cam = document.querySelector('#cam'), taupe = document.querySelector('#taupe')
  const nom = e => { const p = e.closest('[id]'); return (p ? `#${p.id} ` : '') + e.tagName.toLowerCase() }
  const formes = [...cam.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text, image')]
    .filter(e => !e.closest('#taupe, defs, clipPath'))
  const textes = [...cam.querySelectorAll('*')].filter(e => !(e instanceof SVGElement) && !e.closest('#taupe')
    && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
  // Visible : rien d'éteint au-dessus, et ni pas encore tracé au feutre, ni pas encore écrit (clip à 100 %).
  const visible = e => {
    for (let p = e; p && p !== cam; p = p.parentElement) {
      const s = getComputedStyle(p)
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.02 || s.clipPath.includes('100%')) return false
    }
    const s = getComputedStyle(e)
    const nonTrace = e.getTotalLength && s.strokeDasharray !== 'none' && parseFloat(s.strokeDashoffset) >= e.getTotalLength() - 1
    return !(nonTrace && (s.fill === 'none' || +s.fillOpacity < 0.02))
  }
  // Le cadre réel : pour un texte, la largeur des glyphes et la hauteur de sa ligne (la boîte de la police dépasse
  // les lettres) ; pour une forme, le trait compris.
  const cadre = e => {
    if (!(e instanceof SVGElement)) {
      const r = document.createRange()
      r.selectNodeContents(e)
      const g = r.getBoundingClientRect(), l = (getComputedStyle(e).display === 'inline' ? e.parentElement : e).getBoundingClientRect()
      return { top: Math.max(g.top, l.top), bottom: Math.min(g.bottom, l.bottom), left: g.left, right: g.right }
    }
    const r = e.getBoundingClientRect(), s = getComputedStyle(e)
    const m = s.stroke === 'none' ? 0 : parseFloat(s.strokeWidth) / 2 * Math.abs(e.getScreenCTM()?.a ?? 1)
    return { top: r.top - m, bottom: r.bottom + m, left: r.left - m, right: r.right + m }
  }

  // Les acteurs : les éléments nommés les plus fins (un coffre, une flèche, le titre), hors mascotte. Le tremblement,
  // posé sur leur conteneur, n'en fait bouger aucun.
  const acteurs = [...cam.querySelectorAll('[id]')].filter(e => !e.closest('#taupe') && !e.querySelector('[id]'))
  const chevauchements = [], lance = new Map()  // acteur en mouvement → instant où il s'est mis à bouger
  let avant = null

  const duree = tl.duration(), hors = {}, etats = []
  for (let k = 0; k * PAS <= duree; k++) {
    const t = r2(k * PAS)
    window.seekTo ? seekTo(t) : tl.seek(t)
    const maintenant = acteurs.map(e => e.outerHTML)
    const bougent = avant ? acteurs.filter((e, i) => maintenant[i] !== avant[i]) : []
    avant = maintenant
    for (const e of lance.keys()) if (!bougent.includes(e)) lance.delete(e)
    const nouveaux = bougent.filter(e => !lance.has(e))
    nouveaux.forEach(e => lance.set(e, t))
    const enCours = bougent.filter(e => lance.get(e) <= t - ECART)
    if (nouveaux.length && enCours.length) chevauchements.push({ t, demarrent: nouveaux.map(e => '#' + e.id), bougent_encore: enCours.map(e => '#' + e.id) })
    for (const e of [...formes, ...textes]) {
      if (!visible(e)) continue
      const b = cadre(e)
      const ecarts = { haut: ZONE.haut - b.top, bas: b.bottom - ZONE.bas, droite: b.right - ZONE.droite, gauche: ZONE.gauche - b.left }
      for (const [cote, px] of Object.entries(ecarts)) {
        if (px < 0.5) continue
        const h = (hors[nom(e) + cote] ??= { element: nom(e), cote, px: 0, de: t })
        h.px = r1(Math.max(h.px, px))
        h.a = t
      }
    }
    etats.push(cam.outerHTML.replace(taupe.outerHTML, ''))
  }

  // Temps morts : le schéma (titre et mot-clé compris) ne change pas pendant que la voix parle.
  const temps_morts = []
  for (let debut = 0, k = 1; k <= etats.length; k++) {
    if (k < etats.length && etats[k] === etats[k - 1]) continue
    const de = r2(debut * PAS), a = r2(Math.min(k * PAS, ALIGN.end))
    const mots = [...ALIGN.text.matchAll(/\S+/g)].filter(m => ALIGN.t[m.index] >= de && ALIGN.t[m.index] < a)
    if (a - de >= TEMPS_MORT) temps_morts.push({ de, a, voix: dit(mots.map(m => m[0]).join(' ')) })
    debut = k
  }

  const polices = [...textes, ...formes.filter(e => e.tagName === 'text')]
    .map(e => ({ element: nom(e), px: Math.round(parseFloat(getComputedStyle(e).fontSize) * (e instanceof SVGElement ? e.getScreenCTM().a : 1)) }))
    .filter(p => p.px < POLICE_MIN)

  // Chaque repère avec la phrase où la voix le dit : de quoi comparer l'image à ce qu'on entend.
  const s = ALIGN.text
  const reperes = window.REPERES ? REPERES.map(({ mot, i, t }) => {
    let a = i, b = i + mot.length
    while (a > 0 && !/[.?!…]/.test(s[a - 1])) a--
    while (b < s.length && !/[.?!…]/.test(s[b])) b++
    return { mot, t: r2(t), phrase: dit(s.slice(a, b + 1)) }
  }) : "la page n'expose pas window.REPERES : reprendre la fonction cue() du gabarit"

  return { duree: r2(duree), reperes, hors_zone: Object.values(hors), polices_sous_48: polices, temps_morts, gestes_qui_se_chevauchent: chevauchements }
}
