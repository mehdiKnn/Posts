// node render.mjs videos/race-condition           → videos/race-condition/video.mp4 (index.html + voix.mp3 + bruitages de sons/)
// node render.mjs videos/race-condition 2 9.5     → shot-2.png, shot-9.5.png… dans le dossier (captures à ces secondes)
// node render.mjs videos/race-condition controle  → captures.png (une image par repère de cue()) et sequences/01.png…
//                                                  (quatre images autour de chaque repère, pour juger le mouvement)
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(process.env.PW || 'playwright-core')
const FPS = 30
const VOLUME_SONS = 0.5  // les bruitages sous la voix ; une voix (son(nom, t, 1)) garde son volume
const [dir, ...temps] = process.argv.slice(2)
const shots = temps.map(Number)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
await page.goto(pathToFileURL(`${dir}/index.html`) + '?render')
await page.waitForFunction(() => window.ready, null, { timeout: 30000 })
// La page peut exposer seekTo(t) pour ce qui ne passe pas par la timeline (poses, sauts de la mascotte).
const seek = t => page.evaluate(t => { window.seekTo ? window.seekTo(t) : tl.seek(t) }, t)
const ffmpeg = (...args) => new Promise((ok, ko) => spawn('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
  .on('close', code => code ? ko(new Error(`ffmpeg : code ${code}`)) : ok()))
// L'instant et le repère, en haut à gauche de chaque capture de contrôle (au-dessus de la zone sûre).
const etiquette = texte => page.evaluate(texte => {
  const e = document.getElementById('etiquette') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'etiquette' }))
  e.style.cssText = 'position:fixed;left:0;top:0;padding:6px 14px;font:600 44px monospace;background:#1C1C21;color:#FBFBF8;z-index:99'
  e.textContent = texte
}, texte)
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
} else if (shots.length) {
  for (const t of shots) {
    await seek(t)
    await page.screenshot({ path: `${dir}/shot-${t}.png` })
  }
} else {
  const n = Math.ceil(await page.evaluate(() => tl.duration()) * FPS)
  // Les bruitages notés par les gestes (window.SONS), chacun à son instant, mixés sous la voix.
  const sons = (await page.evaluate(() => window.SONS ?? [])).map(s => ({ ...s, f: new URL(`sons/${s.nom}.mp3`, import.meta.url).pathname }))
  const manquants = [...new Set(sons.filter(s => !existsSync(s.f)).map(s => s.nom))]
  if (manquants.length) console.log(`bruitages absents de sons/, ignorés : ${manquants.join(', ')}`)
  const presents = sons.filter(s => existsSync(s.f))
  const mix = presents.map((s, k) => `[${k + 2}:a]adelay=${Math.max(0, Math.round(s.t * 1000))}:all=1,volume=${s.volume ?? VOLUME_SONS}[s${k}];`).join('')
    + `[1:a]${presents.map((_, k) => `[s${k}]`).join('')}amix=inputs=${presents.length + 1}:normalize=0:duration=longest[a]`
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', `${dir}/voix.mp3`,
    ...presents.flatMap(s => ['-i', s.f]), '-filter_complex', mix, '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', `${dir}/video.mp4`],
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
