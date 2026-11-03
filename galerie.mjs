// node galerie.mjs → galerie.html : la liste des vidéos de videos/*/video.mp4, à lire et à télécharger, dans la DA de Manar Studio.
// À relancer après chaque nouveau rendu final. Le titre vient du <title> de la page de la vidéo, la vignette de couverture.png.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'

// Les styles de lib/manar.css sont copiés dans la page : elle reste stylée même ouverte hors du dossier ou dans un aperçu qui ne suit pas les liens.
const manar = readFileSync('lib/manar.css', 'utf8')
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const videos = readdirSync('videos', { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(`videos/${d.name}/video.mp4`))
  .map(d => {
    const slug = d.name
    const page = existsSync(`videos/${slug}/index.html`) ? readFileSync(`videos/${slug}/index.html`, 'utf8') : ''
    const titre = page.match(/<title>([^<]*)<\/title>/)?.[1].trim() || slug
    return { slug, titre, couverture: existsSync(`videos/${slug}/couverture.png`), date: statSync(`videos/${slug}/video.mp4`).mtimeMs }
  })
  .sort((a, b) => b.date - a.date)

const cartes = videos.map(v => `
    <article class="carte" data-recherche="${esc(`${v.titre} ${v.slug}`.toLowerCase())}">
      <video controls preload="metadata" playsinline${v.couverture ? ` poster="videos/${v.slug}/couverture.png"` : ''} src="videos/${v.slug}/video.mp4" aria-label="${esc(v.titre)}"></video>
      <div class="infos">
        <h2>${esc(v.titre)}</h2>
        <p class="duree" aria-label="Durée"></p>
        <a class="bouton" href="videos/${v.slug}/video.mp4" download="${v.slug}.mp4">Télécharger</a>
      </div>
    </article>`).join('')

writeFileSync('galerie.html', `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vidéos courtes · Decode by Manar</title>
<!-- Généré par galerie.mjs : ne pas modifier à la main. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:opsz,wght@9..40,500;9..40,600;9..40,700&family=Caveat:wght@600&display=swap" rel="stylesheet">
<style>
${manar}
</style>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  /* Les pois du site de Manar Studio (design.manar.studio, .ms-paper) : fins, sur une trame de 24 px. Ceux de manar.css sont dimensionnés pour une vidéo 1080×1920. */
  body.papier{background-image:radial-gradient(rgba(138,141,91,.4) 1.1px,transparent 1.3px);background-size:24px 24px;background-position:0 0}
  body{min-height:100vh;padding:56px 20px 104px;font:500 18px/1.55 var(--texte-m)}
  main{max-width:1120px;margin:0 auto}
  .etiquette{font:700 14px/1 var(--texte-m);letter-spacing:.16em;text-transform:uppercase}
  h1{margin-top:16px;font:800 clamp(40px,7vw,72px)/1.05 var(--titre-m);letter-spacing:-.035em;text-wrap:balance}
  h1 mark{background:linear-gradient(transparent 62%,var(--miel) 62% 90%,transparent 90%);color:inherit;padding:0 4px}
  .intro{margin-top:16px;max-width:60ch;color:#4F5A50}
  .recherche{display:block;margin-top:32px;max-width:420px}
  .recherche span{display:block;margin-bottom:8px;font:700 14px/1 var(--texte-m);letter-spacing:.16em;text-transform:uppercase}
  .recherche input{width:100%;min-height:48px;padding:0 16px;border:2px solid var(--encre);border-radius:14px;background:var(--creme);color:var(--encre);font:500 16px var(--texte-m)}
  .recherche input::placeholder{color:#4F5A50}
  .recherche input:focus-visible{outline:3px solid var(--foret);outline-offset:3px}
  .grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:40px;margin-top:56px}
  .carte{display:flex;flex-direction:column;background:var(--creme);border:3px solid var(--encre);border-radius:14px 6px 16px 5px/6px 15px 5px 14px;box-shadow:7px 7px 0 var(--kaki);overflow:hidden}
  .carte video{display:block;width:100%;aspect-ratio:9/16;background:var(--foret);object-fit:cover}
  .infos{display:flex;flex-direction:column;gap:8px;padding:20px}
  h2{font:800 28px/1.15 var(--titre-m);letter-spacing:-.03em}
  .duree{font-variant-numeric:tabular-nums;color:#4F5A50;font-size:16px}
  .bouton{display:inline-flex;align-items:center;justify-content:center;align-self:flex-start;margin-top:8px;min-height:48px;padding:0 24px;border-radius:14px;background:var(--miel);color:var(--encre);border:2px solid var(--encre);font:700 16px var(--texte-m);text-decoration:none;transition:transform .18s}
  .bouton:hover{transform:translateY(-2px)}
  .bouton:focus-visible,video:focus-visible{outline:3px solid var(--foret);outline-offset:3px}
  .vide{margin-top:56px}
  [hidden]{display:none!important}
  @media (prefers-reduced-motion:reduce){.bouton{transition:none}}
</style>
</head>
<body class="papier">
<main>
  <p class="etiquette">Decode by Manar</p>
  <h1>Les <mark>vidéos</mark> courtes</h1>
  <p class="intro">Un concept tech expliqué en moins d'une minute. Lisez-les ici, ou téléchargez-les.</p>
  <label class="recherche"><span>Rechercher</span><input id="recherche" type="search" placeholder="Un titre, un concept…" autocomplete="off"></label>
  <section class="grille" aria-label="Vidéos">${cartes}
  </section>
  <p class="vide" id="vide" role="status" hidden></p>
</main>
<script>
  // La durée vient du fichier lui-même : rien à tenir à jour dans la page.
  document.querySelectorAll('.carte').forEach(c => {
    const v = c.querySelector('video'), d = c.querySelector('.duree')
    const afficher = () => { if (isFinite(v.duration)) d.textContent = Math.round(v.duration) + ' s' }
    v.readyState >= 1 ? afficher() : v.addEventListener('loadedmetadata', afficher)
  })
  // Le filtre : sur le titre, sans tenir compte des accents ni de la casse.
  const sans = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const cartes = [...document.querySelectorAll('.carte')], vide = document.getElementById('vide')
  const filtrer = () => {
    const q = sans(document.getElementById('recherche').value.trim())
    let n = 0
    cartes.forEach(c => { const ok = sans(c.dataset.recherche).includes(q); c.hidden = !ok; n += ok })
    vide.hidden = n > 0
    vide.textContent = cartes.length ? 'Aucune vidéo ne correspond à cette recherche.' : "Aucune vidéo pour l'instant."
  }
  document.getElementById('recherche').addEventListener('input', filtrer)
  filtrer()
  // Une seule vidéo à la fois.
  document.addEventListener('play', e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause()), true)
</script>
</body>
</html>
`)
console.log(`galerie.html : ${videos.length} vidéo(s) : ${videos.map(v => v.slug).join(', ')}`)
