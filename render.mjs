// node render.mjs videos/cache           → videos/cache/video.mp4 (index.html + voix.mp3)
// node render.mjs videos/cache 2 9.5     → shot-2.png, shot-9.5.png… dans le dossier (captures à ces secondes)
// node render.mjs videos/cache controle  → captures.png (une image par repère de cue()) et sequences/01.png…
//                                                  (quatre images autour de chaque repère, pour juger le mouvement)
// node render.mjs videos/cache controle masque → les mêmes, avec en rouge ce que l'interface d'Instagram couvre
// node render.mjs videos/cache couverture [s]  → couverture.png : l'image de couverture (à `s` secondes, sinon
//                                                  l'instant que la page donne dans window.COUVERTURE)
// Le bruitage : ce que la page range dans window.SFX (lib/stage.js) se mixe avec la voix, au niveau de VOLUME_SFX.
// ffmpeg se prend dans le PATH, ou dans la variable FFMPEG.
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const playwright = await import(process.env.PW || 'playwright-core')
const chromium = playwright.chromium ?? playwright.default.chromium  // l'import d'un module CommonJS les met sous `default`
const FPS = 30
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
// Les bruitages : ceux de lib/sfx/ (feutre, choc, clac, pop), dosés ici ; et les voix off de sons/<nom>.mp3 (la voix de fin de la
// mascotte, `son(nom, t, volume)`), qui gardent le volume que la page leur donne.
const SFX_DOSSIER = new URL('./lib/sfx/', import.meta.url).pathname
const SONS_DOSSIER = new URL('./sons/', import.meta.url).pathname
// Les bruitages restent sous la voix (1) : ils soulignent un geste, ils ne le couvrent pas.
const VOLUME_SFX = { feutre: 0.2, choc: 0.5, clac: 0.45, pop: 0.3 }
const fichierSon = nom => existsSync(`${SFX_DOSSIER}${nom}.wav`) ? `${SFX_DOSSIER}${nom}.wav` : `${SONS_DOSSIER}${nom}.mp3`
const [dir, ...temps] = process.argv.slice(2)
const shots = temps.map(Number).filter(Number.isFinite)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
await page.goto(pathToFileURL(`${dir}/index.html`) + '?render')
await page.waitForFunction(() => window.ready, null, { timeout: 30000 })
// La page peut exposer seekTo(t) pour ce qui ne passe pas par la timeline (poses, sauts de la mascotte).
const seek = t => page.evaluate(t => { window.seekTo ? window.seekTo(t) : tl.seek(t) }, t)
const ffmpeg = (...args) => new Promise((ok, ko) => spawn(FFMPEG, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
  .on('close', code => code ? ko(new Error(`ffmpeg : code ${code}`)) : ok()))
// L'instant et le repère, en haut à gauche de chaque capture de contrôle (au-dessus de la zone sûre).
const masque = temps.includes('masque')
const etiquette = texte => page.evaluate(([texte, masque]) => {
  const e = document.getElementById('etiquette') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'etiquette' }))
  e.style.cssText = 'position:fixed;left:0;top:0;padding:6px 14px;font:600 44px monospace;background:#1C1C21;color:#FBFBF8;z-index:99'
  e.textContent = texte
  // Ce que l'interface d'Instagram couvre (mesuré sur un iPhone 15 Pro Max, voir animation.md) : en-tête, légende, boutons.
  document.getElementById('masque')?.remove()
  if (masque) {
    const m = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'masque' }))
    m.style.cssText = 'position:fixed;inset:0;z-index:98;pointer-events:none'
    m.innerHTML = [[0, 0, '100%', 230], [0, 1715, '100%', 205], [920, 1275, 160, 440]]
      .map(([x, y, w, h]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${typeof w === 'number' ? w + 'px' : w};height:${h}px;background:rgba(226,55,44,.28)"></div>`).join('')
  }
}, [texte, masque])
const DECALAGES = [-0.1, 0.2, 0.5, 1]  // autour d'un repère : juste avant, l'action, son milieu, ce qui en reste

if (temps[0] === 'controle') {
  const reperes = await page.evaluate(() => [...(window.REPERES ?? []), ...(window.REPERES_FIN ?? [])])  // + la carte de fin si la page l'expose
  if (!reperes?.length) throw new Error("La page n'expose pas window.REPERES : reprendre la fonction cue() du gabarit")
  const tmp = await mkdtemp(join(tmpdir(), 'controle-'))
  await rm(`${dir}/sequences`, { recursive: true, force: true })
  await mkdir(`${dir}/sequences`)
  for (const [k, { mot, t }] of reperes.entries()) {
    for (const [j, dt] of DECALAGES.entries()) {
      const s = Math.max(0, t + dt)
      await seek(s)
      await etiquette(`${s.toFixed(2)} s · ${mot}`)
      await page.screenshot({ path: join(tmp, `${k}-${j}.png`) })
    }
    await ffmpeg('-i', join(tmp, `${k}-%d.png`), '-vf', 'scale=540:-1,tile=2x2', '-frames:v', '1', `${dir}/sequences/${String(k + 1).padStart(2, '0')}.png`)
    await copyFile(join(tmp, `${k}-2.png`), join(tmp, `vue-${k}.png`))
  }
  await ffmpeg('-i', join(tmp, 'vue-%d.png'), '-vf', `scale=270:-1,tile=6x${Math.ceil(reperes.length / 6)}:color=white`, '-frames:v', '1', `${dir}/captures.png`)
  await rm(tmp, { recursive: true })
  console.log(`${reperes.length} repères : captures.png et sequences/`)
} else if (temps[0] === 'couverture') {
  const t = Number(temps[1]) || (await page.evaluate(() => window.COUVERTURE)) || (await page.evaluate(() => tl.duration())) * 0.8
  await seek(t)
  await page.screenshot({ path: `${dir}/couverture.png` })
  console.log(`couverture.png à ${t.toFixed(2)} s`)
} else if (shots.length) {
  for (const t of shots) {
    await seek(t)
    await page.screenshot({ path: `${dir}/shot-${t}.png` })
  }
} else {
  const n = Math.ceil(await page.evaluate(() => tl.duration()) * FPS)
  const sfx = (await page.evaluate(() => window.SFX || [])).filter(e => existsSync(fichierSon(e.son)))
  .map(e => ({ ...e, volume: VOLUME_SFX[e.son] ?? e.volume ?? 0.5 }))
  // Le son : la voix, puis chaque bruitage à son instant, au niveau voulu ; le tout ramené à un niveau de plateforme.
  const stereo = 'aformat=sample_rates=44100:channel_layouts=stereo'
  const graphe = [`[1:a]${stereo}[v]`]
  sfx.forEach((e, k) => graphe.push(`[${2 + k}:a]${stereo},adelay=${Math.max(0, Math.round(e.t * 1000))}:all=1,volume=${e.volume}[s${k}]`))
  graphe.push(`[v]${sfx.map((_, k) => `[s${k}]`).join('')}amix=inputs=${sfx.length + 1}:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:${(n / FPS).toFixed(3)},asetpts=N/SR/TB[a]`)
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', `${dir}/voix.mp3`,
    ...sfx.flatMap(e => ['-i', fichierSon(e.son)]), '-filter_complex', graphe.join(';'), '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', `${dir}/video.mp4`],
    { stdio: ['pipe', 'inherit', 'inherit'] })
  for (let i = 0; i < n; i++) {
    await seek(i / FPS)
    if (!ff.stdin.write(await page.screenshot())) await once(ff.stdin, 'drain')
    if (i % 150 === 0) console.log(`image ${i}/${n}`)
  }
  ff.stdin.end()
  await once(ff, 'close')
  console.log(`fini : ${n} images`)
}
await browser.close()
