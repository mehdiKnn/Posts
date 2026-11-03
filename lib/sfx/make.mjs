// node lib/sfx/make.mjs  → écrit feutre.wav, choc.wav, clac.wav et pop.wav à côté de ce fichier (synthétisés, sans licence).
// Chacun dit quelque chose : un trait de feutre qui se pose, un choc, un cadenas qui claque, un objet qui apparaît.
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dossier = dirname(fileURLToPath(import.meta.url))
const ffmpeg = process.env.FFMPEG || 'ffmpeg'
const SONS = {
  // Un feutre qui frotte : du bruit filtré, haché par un frémissement.
  feutre: ['-f', 'lavfi', '-i', 'anoisesrc=color=white:amplitude=0.5:duration=0.5:sample_rate=44100,highpass=f=1800,lowpass=f=6500,tremolo=f=24:d=0.65,afade=t=in:d=0.06,afade=t=out:st=0.32:d=0.18,volume=0.7'],
  // Un choc : un grave qui retombe vite, avec un claquement.
  choc: ['-f', 'lavfi', '-i', "aevalsrc='0.9*sin(2*PI*68*t)*exp(-9*t)+0.5*(random(0)*2-1)*exp(-55*t)':d=0.5:s=44100"],
  // Un cadenas : deux claquements secs.
  clac: ['-f', 'lavfi', '-i', "aevalsrc='0.8*sin(2*PI*2100*t)*exp(-110*t)+0.7*gt(t,0.09)*sin(2*PI*1100*(t-0.09))*exp(-80*(t-0.09))':d=0.35:s=44100"],
  // Une apparition : une bulle qui monte.
  pop: ['-f', 'lavfi', '-i', "aevalsrc='0.7*sin(2*PI*(520+1100*t)*t)*exp(-30*t)':d=0.22:s=44100"],
}
for (const [nom, args] of Object.entries(SONS)) {
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...args, '-ac', '1', '-c:a', 'pcm_s16le', join(dossier, `${nom}.wav`)], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`ffmpeg n'a pas fait ${nom}.wav`)
}
console.log('4 bruitages écrits dans', dossier)
