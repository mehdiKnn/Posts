# DA Manar Studio : la direction artistique de référence

Depuis la vidéo « cache » (validée en DA Manar), **toute nouvelle vidéo part de cette DA**. Source : https://design.manar.studio/ (Decode by Manar est la marque éducative du studio). Les mascottes ne changent pas (`mascottes/`).

Base commune : `lib/manar.css` (jetons, variables de rôle `--encre`, `--fond`, `--action`, `--erreur`, `--reussite`, `--lumiere`, `--police-schema`, papier à pois, titre, cartes, sous-titres, signature « Manar Studio ») et `lib/manar.js` (filtres « sketch »), chargés après `lib/stage.css` avec les polices Google Fonts. Page de référence : `videos/cache/index.html`, avec la brique `lib/dispositifs/copie.js`. Partir de cette page, pas de `stage.css` seul.

## Adaptations validées à l'écran (1080×1920)
- Traits de 6 px et plus (flèches 9 px, mise en lumière 12 px, trait qui barre 8 px), pas les 2 px de l'interface web.
- Miel sur papier : 1,54:1, donc toute flèche miel porte un filet d'encre (~2,5 px) ; pas de miel en texte.
- Réussite = carte forêt avec valeur en crème (la forêt en texte sur encre ne se lit pas) ; erreur = rouge brique `#A8432F` ; action et lumière = miel.
- Étiquettes en DM Sans 700, casse normale (les capitales espacées de 0,16 em débordent des boîtes).
- Sous-titres crème sur forêt.
- Polices chargées et vérifiées (`document.fonts.check`) avant `demarrer()`.
- `verifier.mjs` accepte la palette de `da-manar.md` et celle de `charte.md` ; une couleur hors de ces deux listes est signalée.

## Jetons
- Fond « papier » `#F1ECDD` à pois kaki, léger grain ; ou thème nuit `#0B1B11` (texte crème). Papier par défaut.
- Encre-dessin `#1C2A22` pour texte, cadres et traits (jamais de noir).
- Forêt `#20392A` (surface sombre), forêt-2 `#2B4A37`, crème `#F5F2E8`, crème-2 `#ECE8D8`.
- Miel `#EDB92E` : la lumière, seulement sur ce qu'on éclaire (le mot clé, la valeur qui compte). Jamais en texte sur fond clair. Un seul groupe de mots surligné au pinceau par titre.
- Kaki `#8A8D5B` : scotch, points, marques secondaires, jamais du texte. Kaki clair `#E4E6D0` : texte atténué sur fond sombre.
- Dosage : crème 55 %, forêt 22 %, kaki clair 12 %, miel 8 %.

## Typographie
- Titres : Bricolage Grotesque 700-800, interlettrage serré. Texte : DM Sans. Annotations : Caveat. Étiquettes en capitales, interlettrage 0,16 em. Pas d'autre police.
- Chiffres alignés en colonnes (`font-variant-numeric: tabular-nums`).

## Formes
- Cartes = cadres au trait irrégulier (style « sketch »), pas de cartes arrondies colorées, pas d'ombre douce ; sous un cadre scotché, une ombre dure décalée.
- Scotch kaki, tampon rond, annotations manuscrites : avec parcimonie.
- Traits de 2 px, extrémités arrondies.

## Mouvement
- Un seul geste de lumière à la fois (halo, faisceau) ; lent et discret. Le miel éclaire ce qui compte à l'instant.

## Texte
- Typographie française (espace avant « : », « ? », « ! »), pas d'emoji.

## Ce qui ne change pas
- Mascotte taupe et voix de l'élève : planches et poses existantes (`mascottes/taupe/`).
- Dispositif collision, minutages, voix, sous-titres lisibles, zones sûres, signature, boucle sur la feuille vide.
