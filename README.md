# Vidéos courtes

Des vidéos verticales de 30 à 45 s (Reels, Shorts, TikTok) qui vulgarisent un concept tech. Une mascotte fait cours sur un papier à pois (la DA de Manar Studio), un élève hors champ l'interpelle, le schéma se trace en suivant la voix.

Tout se pilote depuis Claude Code : des agents écrivent le script, le storyboard, la voix, l'animation, puis exportent la vidéo. Exemples de rendu : `videos/cache/video.mp4` et `videos/race-condition/video.mp4` (sous-titres, bruitages, signature, boucle).

## Installer

Prérequis : [Claude Code](https://claude.com/claude-code), Node 20 ou plus, Python 3, `ffmpeg`, Google Chrome.

```sh
npm install                      # playwright-core, pour les captures et l'export
npm install -g @elevenlabs/cli   # la voix
elevenlabs auth login            # avec ton compte de l'espace de travail ElevenLabs de l'équipe
```

Les voix de la taupe et de l'élève vivent dans l'espace de travail ElevenLabs de l'équipe (identifiants dans `.claude/skills/video-courte/charte.md` et `voix.py`). Sans invitation à cet espace, `voix.py` ne les trouve pas : demande-la avant ta première vidéo.

## Produire une vidéo

Ouvre Claude Code dans ce dossier, puis :

- **Pas à pas**, en validant chaque étape : « lance une vidéo sur le deadlock ». Claude suit le skill `video-courte` : script, storyboard, voix (tu l'écoutes), animation, rendu final.
- **D'une traite** (mode AFK), sans validation : « afk le deadlock ». Le workflow `video-courte-afk` enchaîne les étapes ; à chacune, un agent critique relit le livrable et le renvoie au producteur s'il le faut. Compte 30 à 40 min.

La vidéo arrive dans `videos/<sujet>/video.mp4`, avec `etapes.md` : ce qui est validé, les retours restés ouverts et ce que tu dois vérifier toi-même (l'écoute de la voix, la prononciation des termes anglais).

Les vidéos produites restent sur ta machine (`.gitignore`) ; seul le gabarit `videos/cache/` est partagé.

## Coûts

- ElevenLabs : la voix (environ 45 s générées, parfois deux fois) et sa transcription de contrôle.
- Claude : un passage AFK lit environ 10 M de tokens, mis en cache pour la plupart.

## Ce qu'il y a dedans

| Chemin | Rôle |
|---|---|
| `.claude/skills/video-courte/` | Les règles : format, script, texte à l'écran, animation, charte, voix, et les sources qui les fondent. |
| `.claude/agents/` | Un agent par étape (scénariste, storyboarder, voix, animateur, monteur), plus le critique et le suivi du mode AFK. |
| `.claude/workflows/video-courte-afk.js` | Le mode AFK. |
| `lib/` | La scène commune (`stage.css`, `stage.js`), les dispositifs de schéma réutilisables (`dispositifs/`) et les bruitages (`sfx/`). Une vidéo n'écrit que son titre, son dispositif et ses repères. |
| `render.mjs` | Export de la vidéo (voix et bruitages mixés, −14 LUFS), couverture, captures et séquences de contrôle (avec, au choix, ce que l'interface d'Instagram couvre). |
| `verifier.mjs` | Les contrôles mesurables : durée, débit, repères, couleurs, zones sûres, sous-titres, bruitages, signature, temps morts, fiche technique. |
| `galerie.mjs` | Génère `galerie.html` : la liste des vidéos (`videos/*/video.mp4`), à lire et à télécharger, dans la DA de Manar Studio. À relancer après chaque rendu final. |
| `voix.py` | Génère le dialogue à deux voix, avec l'horodatage qui cale l'animation. |
| `charte/`, `mascottes/` | Les voix, la mascotte et ses poses. |

Une nouvelle thématique demande sa mascotte : planche générée avec GPT Image via SeamUI, voix créée avec ElevenLabs. Le skill décrit la marche à suivre (`charte.md`, `visuels.md`, `voix.md`).

## Ce qui a changé (v2)

- **Un dossier et un expert avant la voix.** L'agent `chercheur` prépare la matière exacte du sujet (`dossier.md`) ; l'agent `expert` relit le dialogue contre elle et classe chaque affirmation : un « faux » ou un « trompeur » repart au scénariste avant que la voix ne soit payée.
- **Des briques de schéma.** `lib/dispositifs/collision.js` écrit un schéma entier et pose ses gestes sur les mots de la voix : la page ne donne que les mots.
- **Sous-titres, bruitages, signature, boucle, couverture** dans toutes les vidéos (voir `animation.md` et `texte.md`).
- **Les résultats d'abord mesurés.** `resultats.md` : après publication, on note la rétention et on corrige les règles sur des chiffres.
- Le mode AFK fait la voix pendant le storyboard (elles ne dépendent que du dialogue) et rend l'exactitude de la vidéo dans son bilan.

Sans ffmpeg ni ffprobe dans le PATH : les variables `FFMPEG` et `FFPROBE` les désignent (idem `PW` pour `playwright-core`).

## Mettre la galerie en ligne

`galerie.html` (générée par `node galerie.mjs`) liste les vidéos à lire et à télécharger. Le workflow `.github/workflows/pages.yml` la publie sur GitHub Pages à chaque push sur `main` qui touche `videos/*/video.mp4`, `couverture.png` ou `index.html`.

1. Sur GitHub : `Settings → Pages → Source : GitHub Actions` (une seule fois). Sur un dépôt privé, Pages demande un plan payant, et le site est public : les vidéos sont visibles par quiconque a l'adresse.
2. Après un rendu final : `node galerie.mjs` pour voir la page en local, puis commiter `video.mp4`, `couverture.png` et `index.html` de la vidéo (`.gitignore` ne suit que ceux-là, hors des gabarits partagés). L'adresse : `https://mehdiknn.github.io/Posts/`.
