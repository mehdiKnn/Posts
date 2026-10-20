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

## Le reste

- Le schéma (objets, flèches, cadenas…) se trace en SVG à l'animation : net, gratuit, animable trait par trait.
- Fond transparent pour tout ce qui s'anime séparément.
