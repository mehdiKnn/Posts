# Visuels

Trois règles, tirées de la vidéo race condition :

- **Des planches.** Tout ce qui doit rester cohérent (les poses d'une mascotte, une série d'objets) se génère ensemble, sur une même planche, puis se découpe : une planche garde le même trait, les mêmes couleurs et la même échelle d'une figure à l'autre.
- **Le code découpe, l'image se régénère.** Le code découpe, retire le fond blanc et met à l'échelle (`prep.py`) ; il recolle aussi le visage bouche ouverte sur le corps bouche fermée, pour que seule la bouche bouge. Toute autre correction du contenu d'une image (une couleur, une partie) passe par une nouvelle planche.
- **Le maximum d'éléments de DA dans chaque génération** : l'image de l'univers et la planche de la mascotte en référence, les traits de la [charte](charte.md) décrits (trait, aplats, couleurs, expressions), ce qu'il faut éviter. Ce qui manque à la charte se demande à l'utilisateur avant de générer : références visuelles, exemples.

Modèle : GPT Image uniquement, via SeamUI et le compte OpenAI (GPT Image 2 a produit la planche de la taupe). Une correction régénère la planche entière.

## La mascotte

- Sa planche de référence, validée par l'utilisateur avant toute autre image, contient d'emblée les poses des vidéos, tournées vers la droite : en train d'écouter, bouche fermée, sans bâton ; en train de parler, bâton levé, dessinée deux fois côte à côte, bouche ouverte et bouche fermée. Plus quelques expressions de tête. 4 figures au plus par planche, pour garder environ 500 px de haut par pose.
- `python3 prep.py`, dans le dossier de la mascotte, découpe ces poses (boîtes notées dans le script), retire le fond blanc, colle le visage bouche ouverte sur la pose bouche fermée et les aligne dans `sprites/`. Les deux dessins ne coïncident jamais : on garde le corps, le casque et les cheveux de la bouche fermée, et une couture cherchée là où les deux images se ressemblent ne remplace que le visage. Les repères de la tête dans `bouche()` sont propres à chaque mascotte.
- Contrôle avant validation : les poses alignées sur la feuille, à leur taille d'affichage dans la vidéo, et un zoom sur les visages.

## Les autocollants du schéma

Les objets concrets que nomme la voix (un téléphone, un billet, un serveur, un cadenas) sont des autocollants, dessinés dans le trait de la mascotte. Ce qui relie ou change (flèches, collision, valeurs, coches, pointillés) se trace en SVG au feutre, sur son mot, à côté des autocollants sans jamais les toucher : un schéma qui se dessine fait mieux apprendre ([sources](sources.md)).

- **Une planche par vidéo**, 4 objets au plus, générée d'un coup : même trait, même échelle. Le storyboard la prévoit dans « Visuels prévus », chaque objet avec son nom de fichier.
- **Vide là où va une valeur** : un écran, une étiquette restent vides ; la valeur s'y pose en texte HTML, nette et changeable.
- **Un état qui change** (un cadenas ouvert, puis fermé, un objet barré ou cassé) : deux figures de la même planche, nommées `<objet>-<état>`. Aucun trait ne se dessine sur un autocollant.
- **Ni contour, ni ombre dans l'image** : le filtre `#autocollant` du gabarit les pose ([animation.md](animation.md)).
- **L'utilisateur valide la planche** avant l'animation, même en mode AFK : c'est elle qui fixe le style à l'écran. Une correction régénère la planche entière.
- **Génération** (agent `illustrateur`) : GPT Image 2 via SeamUI, sur le compte OpenAI (`provider: default`), 1536 × 1024, qualité `high`, fond opaque, PNG ; environ 0,20 $. Références : la planche de la mascotte, puis `charte/univers.png`. Le prompt, en anglais, avec un objet par ligne :

  ```
  A clean reference sheet of <N> separate cartoon props for a 2D animated educational short, drawn in EXACTLY the same style as the mascot in the first reference image (2D animation style of the French YouTube duo Laink et Terracid / Wankil Studio): thick, slightly rough black ink outlines (#1C1C21), bold flat colors with light simple cel shading, hand-drawn feel, slightly exaggerated proportions. The second reference image shows the universe these props will be placed in (a school notebook with small blue squares) and its marker palette: blue #2356D8, red #E2372C, green #1E9C57, ink #1C1C21.

  The <N> props, laid out left to right in one row, evenly spaced with lots of empty space between them, each fully visible, front view, no overlap:
  1. <the object: shape, palette colors, what stays blank (e.g. "a large completely blank pure white screen")>
  2. …
  <for two states of one object: "3. A padlock, OPEN: … 4. The SAME padlock, CLOSED: identical body, only the shackle differs.">

  All <N> props share the same line weight and scale: <the tallest> is about 60% of the image height; the others are smaller.
  Background: plain flat pure white, no notebook grid, no floor, no cast shadows, no frame, no stickers outline.
  Avoid: any text, letters, numbers, logos, brand names, watermarks, gradients, 3D render, photorealism, glossy reflections, extra objects, the mascot itself.
  ```

- **Découpe** : la planche va dans `videos/<sujet>/autocollants/planche.png`, puis `python3 autocollants.py videos/<sujet> telephone billet cadenas-ouvert cadenas-ferme` (les noms dans l'ordre de la planche, de gauche à droite) écrit une image par objet, fond retiré, au cadre serré ; les états d'un même objet partagent un cadre, calés sur leur base. Exemple : `videos/race-condition/autocollants/`.
- **Autocollants communs** : ceux de la carte de fin (`coeur`, `abonne`) sont dans `charte/autocollants/`. Ils sont générés une fois, avec le même prompt, dans le projet SeamUI « charte », puis découpés par `python3 autocollants.py charte coeur abonne`.
- Fond transparent pour tout ce qui s'anime séparément.
