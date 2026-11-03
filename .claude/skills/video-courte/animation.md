# Animation et export

Gabarit : `videos/cache/index.html` (DA Manar : `lib/stage.css` puis `lib/manar.css` et `lib/manar.js`), à copier dans `videos/<sujet>/` à côté de `dialogue.json`, `voix.mp3` et `voix-align.js`. Il est court : tout ce qui est commun vit dans `lib/` (la feuille et la mise en page, `lib/stage.css` ; la machinerie, `lib/stage.js` ; les schémas, `lib/dispositifs/`). Une vidéo ne contient que son titre, son dispositif, ses repères et cinq appels : `signature()`, `finir()`, `mascotte()`, `sousTitres()`, `demarrer()`. Export, depuis le dossier du projet : `node render.mjs videos/<sujet>` écrit `video.mp4` ; `node render.mjs videos/<sujet> 2 9.5` capture des images à ces secondes. `npm install` installe `playwright-core` dans le projet ; les captures passent par Google Chrome.

- **Les dispositifs sont des briques.** `lib/dispositifs/<nom>.js` (aujourd'hui `collision.js`) écrit le schéma d'un dispositif dans `#schema` (`monter()`) et pose ses gestes sur la timeline, chacun sur un mot de la voix (`anime(mots)`). La page donne les mots, pas la géométrie : changer le dialogue change les repères, le schéma reste juste, et son emprise est connue d'avance. Un nouveau dispositif s'ajoute comme un nouveau fichier de `lib/dispositifs/`, sur le modèle de `collision.js` : même `monter` et `anime`, les gestes de `lib/stage.js` (`trace`, `traceTout`, `apparait`, `disparait`, `ecrit`, `tremble`) et un bruitage (`son`) sur chaque geste qui en appelle un. Tant qu'un concept n'a pas sa brique (réaction en chaîne, couches, transformation, échelle), l'animateur écrit le SVG dans la page, comme avant, avec les mêmes gestes.
- **Bruitages.** `son('feutre' | 'choc' | 'clac' | 'pop', t)` range un bruitage ; `render.mjs` les mixe sous la voix. Ils disent quelque chose : un trait qui se pose, un choc, un cadenas qui claque, un objet qui apparaît. Jamais de musique ni de décor sonore ([sources.md](sources.md), Brame : retirer ce qui n'a pas de rôle). `node lib/sfx/make.mjs` les resynthétise (variable `FFMPEG` si ffmpeg n'est pas dans le PATH).
- **Signature et boucle.** `charte/signature.js` donne le nom du studio et sa ligne ; `signature()` fait revenir la feuille vide à la fin de la vidéo, le nom s'y écrit, puis elle s'efface : la dernière image est celle de la première. Retirer le fichier de la page pour finir sans signature.
- **Couverture.** La page donne l'instant de l'image de couverture dans `window.COUVERTURE` (le titre, le schéma complet, le mot à retenir) ; `node render.mjs videos/<sujet> couverture` écrit `couverture.png`. Elle doit se lire en petit.
- **Interface de la plateforme.** `node render.mjs videos/<sujet> controle masque` ajoute aux captures, en rouge, ce que l'interface d'Instagram couvre (en-tête, légende, boutons) : on voit les zones sûres au lieu de les déduire des mesures.
- Animation : page HTML 1080×1920 avec une timeline GSAP en pause. L'export avance image par image (`tl.seek`), capture avec Playwright et encode avec ffmpeg (H.264, yuv420p, 30 fps, AAC) : chaque export est identique au précédent.
- Synchro : chaque animation se déclenche sur un mot du script (`cue('verrou')`), à partir de l'horodatage de la voix. Modifier le texte recale toute la vidéo.
- Mascotte (`mascotte()` de `lib/stage.js`) : deux poses (`mascottes/<nom>/sprites/`), choisies selon qui parle. Quand la mascotte parle, la pose avec le bâton, dont la bouche suit la voix : elle alterne `pointe-ouverte` et `pointe-fermee`, une ouverture par syllabe, d'après l'horodatage lettre par lettre (`BOUCHE` dans le gabarit). Quand l'élève parle, la pose bouche fermée, sans bâton. La pose change au début de chaque réplique, avec un petit rebond.
- Place de la mascotte : en bas à gauche, environ 560 px de haut. Dans la pose qui parle, la figure va de x 90 à 550, le bout du bâton est vers (540, 1067), la tête vers y 1115, les pieds à 1680 : `#taupe{left:-138px;top:1048px}`, à reporter dans la copie du gabarit, qui la place encore 130 px plus haut. Les pieds mordent d'environ 30 px sur la zone de légende, qui protège le texte et le schéma, pas les sandales.
- Place du schéma : il remplit l'espace libre et ne se tasse pas dans une bande. Sa zone : de y 500 (sous le titre) à y 1040 (au-dessus du bâton), sur toute la largeur utile (x 80 à 1000), soit 920 × 540 px ; plus, quand le dispositif s'y prête, l'espace à droite de la taupe (x 600 à 900, jusqu'à y 1650). Sur la dernière image, où il est complet, il couvre au moins 80 % de cette bande en largeur et en hauteur (736 × 432 px). Des objets qui la laissent vide se dessinent plus grands, ou se disposent autrement (en colonne, en triangle).
- Papier : le fond à pois est dessiné en CSS (`lib/manar.css`) sur toute la page, aux valeurs de [da-manar.md](da-manar.md) : net à toute taille.
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
- Zones sûres des Reels, mesurées dans l'app Instagram d'un iPhone 15 Pro Max : l'écran, plus allongé que la vidéo, la remplit en coupant environ 60 px de chaque côté ; l'en-tête « Reels » couvre le haut jusqu'à y 230, le pseudo et la légende commencent vers y 1715, les boutons occupent x > 920 sous y 1275. Le contenu important tient donc de y 250 à y 1650 et de x 80 à x 1000, hors du coin des boutons (x > 900 et y > 1270).
- Pièges connus :
  - `page.evaluate` renvoie `undefined` : l'appel s'écrit en bloc, `t => { tl.seek(t) }`, et l'export avance.
  - Un `fromTo` qui part d'une opacité non nulle prend `immediateRender: false` : l'élément apparaît à son heure.
  - `cue()` avance dans le texte : un même mot se demande une seule fois, et on garde l'instant dans une variable.
  - Un trait SVG à tracer prend un pointillé dont le trou dépasse la longueur du trait : son bout arrondi reste caché jusqu'au tracé.
  - En SVG, les rotations et échelles autour d'un point passent par `svgOrigin`.
- Contrôle de l'animation : `cue()` note chaque repère dans `window.REPERES`. `node render.mjs videos/<sujet> controle` en tire `captures.png`, une image par repère, et `sequences/`, une image par repère avec quatre instants (−0,1, +0,2, +0,5 et +1 s) pour juger le mouvement. `node verifier.mjs videos/<sujet>` mesure le reste : mots et durée, voix réelle (ouverture, débits), repères du storyboard, couleurs hors charte, zones sûres, emprise du schéma, textes sous 48 px, temps morts du schéma pendant la voix, gestes qui se chevauchent, fiche technique de la vidéo.
- Contrôle du rendu final : une planche d'images extraites de la vidéo, une par beat, pour passer la checklist.
