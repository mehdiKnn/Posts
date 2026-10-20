# Vidéos courtes

Des vidéos verticales de 30 à 45 s (Reels, Shorts, TikTok) qui vulgarisent un concept tech. Une mascotte fait cours sur une feuille à petits carreaux, un élève hors champ l'interpelle, le schéma se trace au feutre en suivant la voix.

Tout se pilote depuis Claude Code : des agents écrivent le script, le storyboard, la voix, l'animation, puis exportent la vidéo. Exemple de rendu : `videos/race-condition/video.mp4`.

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

Les vidéos produites restent sur ta machine (`.gitignore`) ; seul le gabarit `videos/race-condition/` est partagé.

## Coûts

- ElevenLabs : la voix (environ 45 s générées, parfois deux fois) et sa transcription de contrôle.
- Claude : un passage AFK lit environ 10 M de tokens, mis en cache pour la plupart.

## Ce qu'il y a dedans

| Chemin | Rôle |
|---|---|
| `.claude/skills/video-courte/` | Les règles : format, script, texte à l'écran, animation, charte, voix, et les sources qui les fondent. |
| `.claude/agents/` | Un agent par étape (scénariste, storyboarder, voix, animateur, monteur), plus le critique et le suivi du mode AFK. |
| `.claude/workflows/video-courte-afk.js` | Le mode AFK. |
| `render.mjs` | Export de la vidéo, captures et séquences de contrôle. |
| `verifier.mjs` | Les contrôles mesurables : durée, débit, repères, couleurs, zones sûres, temps morts, fiche technique. |
| `voix.py` | Génère le dialogue à deux voix, avec l'horodatage qui cale l'animation. |
| `charte/`, `mascottes/` | L'univers visuel, la mascotte et ses poses. |

Une nouvelle thématique demande sa mascotte : planche générée avec GPT Image via SeamUI, voix créée avec ElevenLabs. Le skill décrit la marche à suivre (`charte.md`, `visuels.md`, `voix.md`).
