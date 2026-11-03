# Le cache : storyboard

Mascotte : la taupe (Backend). Dispositif : collision en écran partagé, deux versions d'une même donnée, réutilisé pour la solution : la base à gauche (côté Alice), la colonne « Cache (serveur) » à droite (Bob la lit). Exemple unique : le prix d'un produit, 20 € puis 25 €, gardé en cache 10 minutes. Pas de code à l'écran (validé au pitch).

Estimation : 96 mots (élève 13, taupe 83), environ 41,8 s avec les blancs (`script.md`), plus 1,5 s de fin tenue, puis la signature (1,4 s). Le rire (`[chuckles]`) avant « Bob voit » peut ajouter une demi-seconde : la voix réelle tranche.

Ici, la collision n'est pas un choc simultané : l'expert l'a interdit (« au même instant » était trompeur). Ce qui se heurte, ce sont deux valeurs d'une même donnée, 25 € à gauche et 20 € à droite, dans un même écran. Tous les gestes sont donc successifs, aucun n'est lancé en même temps qu'un autre.

Brique : ni `collision.js` (un billet, deux téléphones, un verrou) ni `croisement.js` (deux personnages, deux cadenas) ne portent ce schéma. Je propose une nouvelle brique, `lib/dispositifs/copie.js` (une source et sa copie : cache, réplique en retard, CDN), sur le même modèle : `Copie.monter({ avant: '20 €', apres: '25 €', duree: '10 min', source: 'Base', copie: 'Cache (serveur)' })`, puis `Copie.anime(mots)` avec les mots ci-dessous. Elle est d'autant plus utile ici que deux animations partagent ce storyboard : une seule géométrie, un seul jeu de repères, et chaque page n'apporte que sa DA. À trancher ; à défaut, l'animateur écrit le SVG dans chaque page avec les mêmes gestes.

## Deux DA, un storyboard

Deux animations sortiront de ce storyboard : la DA habituelle (`index.html`, `charte.md`) et la DA Manar Studio (`index-manar.html`, `manar/da-manar.md`). Le storyboard ne fixe donc ni couleur ni police : il nomme des rôles, que chaque page traduit dans sa DA.

| Rôle | Sert à |
|---|---|
| Fond | la feuille, vide au début et à la fin |
| Encre | les contours, le titre, les étiquettes, les valeurs ordinaires |
| Action | les flèches de lecture et d'écriture, le soulignement du titre |
| Erreur | le 20 € périmé que Bob reçoit, le trait qui barre la copie |
| Réussite | le 25 € que Bob reçoit à la solution |
| Mise en lumière | la marque sur l'étiquette « 10 min » (« durée de vie ») |
| Police de titre | « Cache » |
| Police du schéma | « Base », « Cache (serveur) », les prix, « 10 min », « TTL » |

La géométrie (positions, tailles en pixels) et l'ordre des gestes sont communs aux deux versions. Le trait (feutre ou « sketch ») et le grain viennent de chaque DA ; la brique pose des classes de rôle, jamais une couleur écrite en dur.

## Dialogue

Les balises entre crochets vont à la voix, jamais à l'écran.

1. **Élève** : M'sieur, quand la base change, le cache suit, non ?
2. **Taupe** : [warmly] Eh non : le cache n'est qu'une copie, la base ne le prévient pas. Un prix de 20 euros est gardé en cache. Alice le passe à 25 euros en base. [chuckles] Bob voit toujours 20 euros… jusqu'à ce que la durée de vie de la copie expire.
3. **Élève** : Et on fait comment ?
4. **Taupe** : [warmly] Le code qui passe le prix à 25 euros en base efface aussi la copie, juste après. Bob trouve le cache vide, relit la base : 25 euros.
5. **Taupe** : La base d'abord, puis on efface la copie : là, elle suit.

## Beats

Les temps sont ceux de `script.md` (2,3 mots/s pour la taupe, 3,3 pour l'élève) : l'animation les recale sur la voix réelle. Chaque geste part sur son mot, ou juste après la fin du geste précédent si la voix va plus vite (le geste suivant attend toujours la fin de celui qui le précède).

| Beat | Temps | Voix | Image | Texte à l'écran |
|---|---|---|---|---|
| Idée fausse | 0–2,7 s | Réplique 1 | La feuille plein écran. « Cache » écrit en haut et souligné (rôle action). La taupe en bas à gauche, en pose d'écoute, bouche fermée. Le schéma est encore vide. | « Cache » |
| Mécanisme | 3,2–22,7 s | Réplique 2 | Sur « cache n'est », la colonne de droite se trace : une boîte, son intitulé « Cache (serveur) » au-dessus, et dans la boîte un emplacement vide, en pointillé. Sur « la base ne », la base se trace à gauche : un cylindre, « Base » au-dessus. Entre les deux, rien : aucun trait ne les relie (« ne le prévient pas »). Sur « Un prix », « 20 € » s'écrit dans la base. Sur « gardé », une flèche de lecture part de la boîte du cache, vide, et file vers la base (rôle action). Sur « en cache », la flèche s'efface et une carte « 20 € » sort de la base, fait le trajet jusqu'au cache et se pose dans l'emplacement : c'est la copie. Au même endroit, sous la carte, l'étiquette « 10 min » apparaît avec son anneau de décompte, plein ; à partir de cet instant, et pas avant, l'anneau se vide lentement. Sur « Alice », la tête d'Alice se trace sous la base. Sur « le passe », sa flèche d'écriture monte vers la base. Sur « 25 euros en base », elle frappe : la base tressaute, « 20 € » s'efface, « 25 € » s'écrit ; la flèche s'efface. Le cache ne bouge pas : il garde 20 €. Sur « Bob voit » (après le rire, donc bien après le passage à 25 €), la tête de Bob se trace sous le cache, puis sa flèche de lecture monte vers le cache. Sur « toujours », la flèche s'efface et une carte « 20 € » (rôle erreur) descend du cache jusqu'à Bob et se pose à sa droite : choc, le seul tremblement d'écran de la vidéo. Image décisive : 25 € à gauche, 20 € à droite, Bob tient 20 €. Sur « jusqu'à », plus tard (l'anneau a visiblement baissé, sans être vide) : la carte de Bob s'efface, une nouvelle flèche de Bob monte vers le cache, et une nouvelle carte « 20 € » (rôle erreur) redescend jusqu'à lui. Sur « durée de vie », l'étiquette « 10 min » se marque (un trait de mise en lumière l'entoure) et « TTL » s'écrit juste avant « 10 min ». L'anneau continue de baisser, sans atteindre zéro. | « Cache (serveur) », « Base », « 20 € », « 25 € », « 10 min », « TTL » |
| Relance | 23,2–24,4 s | Réplique 3 | La taupe écoute, bouche fermée. Le schéma revient à zéro, sans repère : la carte de Bob et la marque de l'étiquette s'effacent, « 25 € » s'efface de la base et « 20 € » y revient ; l'anneau se remplit. Restent : la base à 20 €, la copie à 20 € avec « TTL 10 min », Alice et Bob. | aucun nouveau |
| Solution | 24,8–36,6 s | Réplique 4 | Même schéma. Sur « Le code qui », la flèche d'écriture d'Alice monte vers la base. Sur « prix à 25 », elle frappe : la base tressaute, « 20 € » s'efface, « 25 € » s'écrit ; la flèche s'efface. Sur « efface aussi », une fois la base à 25 €, une seconde flèche part d'Alice (pas de la base), passe sous la base, et vise la copie : à son arrivée, un trait (rôle erreur) barre la carte « 20 € ». Sur « juste après », la carte barrée, son trait, l'anneau et la flèche s'effacent : l'emplacement est vide, en pointillé ; l'étiquette « TTL 10 min » reste. Sur « Bob trouve », la flèche de Bob monte vers le cache ; à son arrivée, l'emplacement vide pulse une fois. Sur « relit », la flèche s'efface et une flèche de lecture part du cache vers la base, comme au mécanisme. Sur le dernier « 25 euros », elle s'efface : une carte « 25 € » sort de la base, se pose dans l'emplacement (la nouvelle copie, rangée par la lecture de Bob), l'anneau se redessine plein et repart ; puis une carte « 25 € » (rôle réussite) descend du cache jusqu'à Bob. | aucun nouveau |
| À retenir | 37,0–41,8 s, puis 1,5 s tenue | Réplique 5 | Remise à zéro, sans repère, dès que la carte de Bob est posée et a été vue (au moins 0,7 s) : la carte de Bob s'efface, la base revient à 20 €, la copie « 20 € » revient avec son anneau plein. Sur « base d'abord », la flèche d'écriture d'Alice frappe la base, qui passe à 25 €. Sur « on efface », la seconde flèche d'Alice vise la copie, qui se barre, puis s'efface ; l'anneau part avec elle. Le schéma tient : base à 25 €, emplacement vide, « TTL 10 min ». Puis la signature. | aucun nouveau |

Ce qui garde le schéma exact (`exactitude.md`) :

- Le décompte part du rangement de la copie : l'anneau naît plein au moment où la carte « 20 € » se pose dans le cache, et la flèche d'Alice ne le touche pas.
- La première lecture de Bob part après que la base affiche 25 € (le geste attend la fin de l'écriture, même si la voix enchaîne). La seconde part plus tard, l'anneau encore visible et non vide : la copie est périmée tant que sa durée de vie court, pas seulement au moment de l'écriture.
- Aucun trait ne relie jamais la base au cache dans le sens base vers cache : la base ne prévient pas. Les seuls trajets entre les deux colonnes sont une lecture (flèche du cache vers la base) suivie de son retour (la carte).
- À la solution, l'effacement vient du code d'Alice : la seconde flèche part d'elle, pas de la base. Sans cette flèche, la copie barrée juste après le changement de la base se lirait comme « la base a prévenu le cache », l'idée fausse même, et c'est le trompeur n° 1 de l'expert remis en image. Cette flèche n'est pas dans `script.md` : je l'ajoute pour cette raison (à trancher).
- L'ordre se voit : la base passe à 25 € avant que la seconde flèche parte ; la lecture de Bob part après l'effacement ; la carte « 25 € » se range dans le cache au retour de cette lecture, jamais à l'écriture d'Alice (sinon, ce serait du *write-through*).
- La première lecture (« gardé en cache ») part du cache lui-même, sans lecteur dessiné : Bob n'est pas encore nommé. C'est le même trajet que la lecture de Bob à la solution, sans le premier et le dernier segment.
- Rien ne promet « jamais périmé » : à la fin, l'étiquette « TTL 10 min » reste, en filet.

## Image de couverture

À la fin de la réplique 2 (`R[1].fin`, environ 22,7 s) : le titre « Cache », la base à 25 €, la copie à 20 € dans le cache avec « TTL 10 min » marqué et l'anneau à moitié vide, Bob qui tient le 20 € (rôle erreur), Alice. C'est l'image du concept, deux vérités pour une même donnée, et l'écart 25 € / 20 € se lit en vignette. Pas de mot à retenir (`texte.md` : pas de mot-clé de conclusion) : le titre en tient lieu. L'autre choix, la fin de la solution (25 € des deux côtés, Bob en rôle réussite), montre la règle mais pas le problème.

## Repères de synchro

Dans l'ordre du texte, chacun demandé une seule fois (`cue()` avance dans le texte, qui contient les balises et la ponctuation de `dialogue.json`, apostrophes droites). Attention : « base » et « cache » apparaissent d'abord dans la réplique de l'élève, d'où `cache n'est` et `la base ne` ; `25 euros` est le dernier de la réplique 4, demandé après `relit` (le premier, dans `prix à 25`, est déjà passé). Les prix sont en chiffres dans le texte : à vérifier dans `voix-align.js` après la voix (si la transcription les écrit en lettres, les repères changent).

| Événement | Mot de la voix | Clé `anime()` proposée | Beat |
|---|---|---|---|
| Titre « Cache » écrit et souligné, sans repère (début de la vidéo) | — | — | Idée fausse |
| La colonne « Cache (serveur) » se trace, emplacement vide | `cache n'est` | `cache` | Mécanisme |
| La base se trace à gauche, « Base » au-dessus | `la base ne` | `base` | Mécanisme |
| « 20 € » s'écrit dans la base | `Un prix` | `prix` | Mécanisme |
| Flèche de lecture du cache vers la base | `gardé` | `lecture` | Mécanisme |
| La carte « 20 € » se range dans le cache ; « 10 min » et l'anneau plein ; le décompte part | `en cache` | `range` | Mécanisme |
| La tête d'Alice se trace | `Alice` | `alice` | Mécanisme |
| La flèche d'écriture d'Alice monte | `le passe` | `ecrit` | Mécanisme |
| La base tressaute, passe à 25 € | `25 euros en base` | `change` | Mécanisme |
| La tête de Bob se trace, puis sa flèche de lecture monte | `Bob voit` | `bob` | Mécanisme |
| La carte « 20 € » (erreur) descend jusqu'à Bob ; choc et tremblement | `toujours` | `perime` | Mécanisme |
| Seconde lecture de Bob, de nouveau 20 € (erreur) | `jusqu'à` | `encore` | Mécanisme |
| « 10 min » se marque, « TTL » s'écrit | `durée de vie` | `duree` | Mécanisme |
| Remise à zéro, sans repère (début de la relance, `R[2].debut`) | — | `reset` | Relance |
| La flèche d'écriture d'Alice monte | `Le code qui` | `code` | Solution |
| La base tressaute, passe à 25 € | `prix à 25` | `change2` | Solution |
| Seconde flèche d'Alice vers la copie, qui se barre | `efface aussi` | `efface` | Solution |
| La copie barrée et l'anneau s'effacent ; emplacement vide | `juste après` | `apres` | Solution |
| Flèche de Bob vers le cache ; l'emplacement vide pulse | `Bob trouve` | `vide` | Solution |
| Flèche de lecture du cache vers la base | `relit` | `relit` | Solution |
| La carte « 25 € » se range dans le cache, anneau plein ; puis « 25 € » (réussite) descend jusqu'à Bob | `25 euros` | `frais` | Solution |
| Remise à zéro, sans repère (`R[4].debut`, ou la fin du geste précédent plus 0,7 s) | — | `reset2` | À retenir |
| Flèche d'écriture d'Alice ; la base passe à 25 € | `base d'abord` | `dabord` | À retenir |
| Seconde flèche d'Alice ; la copie se barre, puis s'efface | `on efface` | `puis` | À retenir |
| Image de couverture, sans repère (`R[1].fin`) | — | — | — |

## Le schéma, en SVG

Tout se trace trait par trait en SVG : net, gratuit, animable. Coordonnées en pixels de la page (1080 × 1920). Zone du schéma : x 80 à 1000, y 500 à 1040 (sous le titre, au-dessus du bâton de la taupe, placée comme le dit `animation.md` : `#taupe{left:-138px;top:1048px}`). Si une page garde la taupe plus haut, le schéma se resserre, comme `croisement.js` (0,92). La place à droite de la taupe, sous y 1040, reste aux sous-titres.

- **Titre** : « Cache », police de titre, environ 110 px, encre, souligné (rôle action), entre y 260 et 470.
- **Base** : un cylindre (ellipse du haut, deux flancs, arc du bas), x 140 à 400, y 580 à 800 ; « Base » au-dessus, centré vers x 270, y 545, environ 56 px. La valeur au centre, vers (270, 705), environ 96 px. Le passage de 20 € à 25 € : le corps tressaute (`back.out(3)`, 0,25 s), l'ancienne valeur s'efface, la nouvelle s'écrit au même endroit ; la valeur ne bouge jamais elle-même, elle reste nette.
- **Cache** : une boîte rectangulaire, x 620 à 960, y 580 à 800 ; « Cache (serveur) » au-dessus, centré vers x 790, y 545, environ 52 px (une ligne d'environ 370 px ; si elle dépasse x 1000 dans une DA, sur deux lignes, « (serveur) » dessous en plus petit, au moins 48 px). Dans la boîte, l'emplacement : un rectangle arrondi en pointillé, x 660 à 920, y 600 à 700.
- **Carte de prix** : un rectangle arrondi d'environ 220 × 90 px, contour encre, la valeur au centre, environ 80 px. Elle se déplace en translation seule (recul de 12 px, puis trajet en `power2.inOut`, 0,6 s), sans échelle ni rotation : le texte reste net. Copie : posée dans l'emplacement. Carte de Bob : posée à droite de sa tête, x 790 à 960, y 925 à 1010 ; rôle erreur (20 €) ou réussite (25 €) pour son contour et sa valeur.
- **Étiquette « 10 min »** : sous l'emplacement, x 730 à 880, y 715 à 775, police du schéma, environ 52 px ; « TTL » s'écrit à sa gauche sur « durée de vie », x 635 à 715, au moins 48 px. La place de « TTL » est réservée dès le début : « 10 min » ne se décale jamais. L'étiquette est écrite une fois et ne bouge plus jusqu'à la signature.
- **Anneau de décompte** : un cercle d'environ 26 px de rayon, vers (915, 745), dont l'arc se vide dans le sens des aiguilles d'une montre. Plein au rangement d'une copie ; vidé lentement et régulièrement tant qu'elle est là (à la vitesse qui le laisse à environ un quart à la fin de la réplique 2) ; il disparaît avec la copie effacée et renaît plein avec la suivante. Ce n'est pas du texte : c'est le seul objet qui bouge en continu (voir la checklist).
- **Marque « durée de vie »** : un trait à main levée (rôle mise en lumière) qui entoure l'étiquette, tracé en 0,5 s ; effacé à la relance.
- **Alice** : une tête ronde (rayon 42) avec une queue de cheval, à la manière de `croisement.js`, vers (270, 960), sous la base. **Bob** : la même tête, cheveux courts avec frange, vers (720, 960), sous le cache. Pas de nom écrit : les deux têtes se distinguent par la coiffure, comme dans `deadlock`.
- **Flèche d'écriture d'Alice** : verticale, de (270, 910) à (270, 815), sous la base ; ligne puis tête, rôle action.
- **Seconde flèche d'Alice (effacement)** : une courbe qui part d'Alice vers (320, 935), passe sous la base et le vide entre les colonnes, et s'arrête au bord gauche de la copie vers (670, 660) ; rôle action. Elle ne touche jamais la base.
- **Trait qui barre la copie** : une diagonale (rôle erreur) sur la carte, tracée en 0,3 s.
- **Flèche de lecture de Bob** : verticale, de (720, 910) à (720, 815), sous le cache.
- **Flèche de lecture du cache vers la base** : horizontale, de (610, 625) à (410, 625), au-dessus du trajet de retour des cartes (qui passe vers y 700).
- **Pulsation de l'emplacement vide** : une seule, 0,3 s, `power1.inOut`.
- Chaque flèche est éphémère : elle se trace, fait son effet, puis s'efface (0,3 s, `power1.in`). Restent : les colonnes, les valeurs, la copie, l'étiquette, les têtes et la carte que Bob tient.
- Emprise sur la dernière image : x 140 à 960, y 520 à 1005, soit 820 × 485 px (au-delà des 736 × 432 demandés).
- **Bruitages** : `feutre` sur chaque tracé (colonnes, têtes, flèches, trait qui barre, marque) ; `pop` sur chaque valeur qui s'écrit et chaque carte qui se pose ; `choc` sur la première carte « 20 € » qui arrive à Bob, avec le tremblement ; aucun pour les remises à zéro ni pour l'anneau. Pas de `clac` : il n'y a pas de cadenas.

## Images à générer

Aucune. La taupe a ses deux poses dans `mascottes/taupe/sprites/`, qui servent aux deux DA (`da-manar.md` : la mascotte ne change pas) ; les colonnes, les cartes, les têtes et les flèches se tracent en SVG.

## Checklist sur le papier

- [x] Durée et nombre de mots dans les bornes : environ 41,8 s (30 à 45 s) et 96 mots (70 à 100 avec la taupe)
- [x] Ouvre en 2,7 s sur l'idée fausse de l'élève, réfutée dès « Eh non » ; la taupe est sur la feuille
- [x] Chaque beat apporte une info nouvelle : la copie qui ne suit pas, la question, l'effacement par le code, la règle ; la seconde lecture de Bob ajoute la durée (périmée tant que la copie vit), elle ne répète pas la première
- [x] Le mécanisme tient en un moment clé (25 € à gauche, 20 € à droite, Bob tient 20 €), en une seule passe : la copie rangée, l'écriture d'Alice, la lecture de Bob, plus la seconde lecture, accordée au script (`etapes.md`) ; la solution réutilise le même schéma
- [x] L'image suit la voix : chaque action dite se voit sur son mot (lecture, rangement, écriture, effacement), et les flèches s'effacent après leur effet ; « ne le prévient pas » et « expire » ne sont pas des actions, ils se lisent dans l'absence de lien entre les colonnes et dans l'anneau qui baisse ; aucun temps figé de plus de 3 s prévu
- [ ] Un seul mouvement à la fois : tous les gestes sont successifs, mais l'anneau de décompte se vide en continu pendant les autres gestes. Il sert le concept (le temps qui passe, « plus tard ») et il est lent ; c'est une exception à trancher (l'autre choix : l'anneau ne baisse que par crans, entre deux gestes)
- [x] Un seul exemple, le prix du produit ; chaque phrase le sert
- [x] Code : aucun
- [x] Texte limité au sujet (« Cache »), aux noms des deux colonnes et aux valeurs du schéma (« 20 € », « 25 € », « 10 min », « TTL ») ; chacun entre une fois et reste immobile ; une valeur qui change s'efface, puis la nouvelle s'écrit
- [x] Le schéma remplit sa zone : 820 × 485 px sur la dernière image ; tout tient dans les zones sûres, hors du coin des boutons (rien sous y 1040 à droite de x 900)
- [ ] Chaque texte est net à chaque image : se vérifie sur les captures des deux animations (aucun effet n'est prévu sur le texte ; les cartes ne font que se translater)
- [ ] Univers, couleurs et mascotte conformes à la charte : la taupe est conforme dans les deux versions, mais le storyboard ne fixe que des rôles ; la conformité se vérifie sur chaque animation, à `charte.md` pour l'une, à `manar/da-manar.md` pour l'autre
- [x] Exact : les deux trompeurs de l'expert sont levés dans le dialogue, et le schéma tient ses trois points à vérifier (décompte au rangement ; base à 25 € avant la copie barrée, lecture de Bob après l'effacement ; copie « 25 € » rangée par la lecture de Bob) ; l'effacement part d'Alice, pas de la base
- [x] Sous-titres à droite de la taupe (x 600 à 900, sous y 1040), sans recouvrir le schéma ni la mascotte
- [x] Bruitages : feutre, pop, un choc, chacun sur un geste ; aucune musique
- [x] Signature en fin de vidéo, la dernière image est la feuille vide de la première (`signature()`), dans chaque DA (feuille à carreaux, ou papier à pois de la DA Manar)
- [x] Image de couverture choisie sur le papier : `R[1].fin` (`couverture.png` s'écrit au rendu de chaque version)
- [ ] Voix natives, validées à l'écoute : la voix n'est pas encore générée ; « cache » est à faire écouter (`etapes.md`), et les prix en chiffres sont à vérifier à la transcription
