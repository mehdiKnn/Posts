# Animation et export

Gabarit : `videos/race-condition/index.html` (feuille, schéma SVG tracé au feutre, poses de la mascotte), à copier dans `videos/<sujet>/` à côté de `dialogue.json`, `voix.mp3` et `voix-align.js`. Export, depuis le dossier du projet : `node render.mjs videos/<sujet>` écrit `video.mp4` ; `node render.mjs videos/<sujet> 2 9.5` capture des images à ces secondes. `npm install` installe `playwright-core` dans le projet ; les captures passent par Google Chrome.

- Animation : page HTML 1080×1920 avec une timeline GSAP en pause. L'export avance image par image (`tl.seek`), capture avec Playwright et encode avec ffmpeg (H.264, yuv420p, 30 fps, AAC) : chaque export est identique au précédent.
- Synchro : chaque animation se déclenche sur un mot du script (`cue('verrou')`), à partir de l'horodatage de la voix. Modifier le texte recale toute la vidéo.
- Mascotte : deux poses (`mascottes/<nom>/sprites/`), choisies selon qui parle. Quand la mascotte parle, la pose avec le bâton, dont la bouche suit la voix : elle alterne `pointe-ouverte` et `pointe-fermee`, une ouverture par syllabe, d'après l'horodatage lettre par lettre (`BOUCHE` dans le gabarit). Quand l'élève parle, la pose bouche fermée, sans bâton. La pose change au début de chaque réplique, avec un petit rebond.
- Place : la mascotte en bas à gauche, environ 560 px de haut, pieds à 1550 px : ils mordent d'environ 70 px sur la zone de légende, qui protège le texte et le schéma, pas les sandales. Le schéma prend le reste de la page ; le mot-clé final se place juste à droite du bout du bâton.
- Feuille : le quadrillage est dessiné en CSS (dégradés linéaires) sur toute la page, aux valeurs de la [charte](charte.md) : net à toute taille.
- Mouvement : chaque geste doit être vu et compris ; une animation trop rapide ou trop chargée ne s'apprend pas ([sources](sources.md)).
  - Un seul mouvement à la fois : l'élément actif bouge sur son mot (il se trace, se déplace ou pulse une fois), le reste du schéma attend. Exception : la collision, dont la simultanéité est le propos ; ses deux gestes sont identiques, symétriques et lancés ensemble.
  - Seul bouge ce qui sert le concept : pas de mouvement décoratif dans le schéma, la vie vient de la mascotte. Les sprites ont un bâton fixe : il ne désigne pas les éléments, c'est l'élément actif qui se signale.
  - La voix prime : chaque geste part sur son mot. Un état clé tient jusqu'au geste suivant, idéalement 1 s ; quand la voix enchaîne plus vite, le geste suivant part quand même sur son mot. Ces durées se calent sur la voix réelle, à l'animation : le storyboard fixe l'ordre et les mots, pas les tenues.
  - Le schéma ne reste pas figé plus de 3 s pendant une explication.
  - Un seul tremblement d'écran, sur l'impact principal.
- Courbes et durées, d'après les principes de Disney (anticipation, accélération et ralentissement, dépassement) :

  | Geste | Durée | Courbe GSAP |
  |---|---|---|
  | Tracé au feutre | 0,4 à 0,6 s | `power1.inOut` |
  | Apparition d'un objet | 0,3 à 0,4 s | `back.out(2)` : il dépasse un peu, puis se pose |
  | Trajet (un billet, une requête) | 0,5 à 0,8 s | anticipation : un recul de 10 à 15 px en 0,12 s (`power1.out`), puis le trajet en `power2.inOut` |
  | Impact | 0,25 s | `back.out(3)` sur l'objet touché, puis le tremblement |
  | Changement d'état (un cadenas qui se ferme, une couleur) | 0,25 à 0,3 s | `back.out(3)` pour ce qui claque, sinon `power1.inOut` |
  | Disparition, à la fin d'un geste éphémère | 0,25 à 0,35 s | `power1.in` |

  Aucun geste sous 0,25 s : il passerait inaperçu.
- Zones sûres des Reels : le contenu important tient entre 250 px sous le haut et 440 px au-dessus du bas, à 120 px du bord droit.
- Pièges connus :
  - `page.evaluate` renvoie `undefined` : l'appel s'écrit en bloc, `t => { tl.seek(t) }`, et l'export avance.
  - Un `fromTo` qui part d'une opacité non nulle prend `immediateRender: false` : l'élément apparaît à son heure.
  - `cue()` avance dans le texte : un même mot se demande une seule fois, et on garde l'instant dans une variable.
  - Un trait SVG à tracer prend un pointillé dont le trou dépasse la longueur du trait : son bout arrondi reste caché jusqu'au tracé.
  - En SVG, les rotations et échelles autour d'un point passent par `svgOrigin`.
- Contrôle de l'animation : `cue()` note chaque repère dans `window.REPERES`. `node render.mjs videos/<sujet> controle` en tire `captures.png`, une image par repère, et `sequences/`, une image par repère avec quatre instants (−0,1, +0,2, +0,5 et +1 s) pour juger le mouvement. `node verifier.mjs videos/<sujet>` mesure le reste : mots et durée, voix réelle (ouverture, débits), repères du storyboard, couleurs hors charte, zones sûres, textes sous 48 px, temps morts du schéma pendant la voix, gestes qui se chevauchent, fiche technique de la vidéo.
- Contrôle du rendu final : une planche d'images extraites de la vidéo, une par beat, pour passer la checklist.
