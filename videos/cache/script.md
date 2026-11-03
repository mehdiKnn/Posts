# Le cache : script

## Pitch

**Concept.** Un cache est une copie du résultat d'une lecture, gardée sous la main : quand la base change, la copie ne bouge pas, et elle sert une valeur périmée jusqu'à ce que sa durée de vie expire ou que le code l'efface.

**Idée fausse d'ouverture** (validée au dossier) : « quand la base change, le cache suit ». C'est la plus répandue : on imagine le cache branché sur la base, alors que rien ne le prévient. La taupe la réfute en montrant les deux vérités côte à côte.

**Exemple unique** : le prix d'un produit, mis en cache 10 minutes. Alice le passe de 20 € à 25 € en base ; Bob affiche le produit et voit encore 20 €. Le même exemple porte la solution : quand on change le prix, on efface la copie.

**Dispositif** (« La forme suit le fond ») : le concept est un conflit entre deux versions d'une même donnée, donc la **collision en écran partagé**, comme dans `race-condition` et `deadlock`. À gauche la base, côté Alice ; à droite le cache, intitulé « Cache (serveur) » : il est partagé, côté serveur, et Bob le lit.

- **Mécanisme**, une passe en trois étapes : (1) le cache est vide, la lecture va à la base, revient avec 20 €, et une copie « 20 € » se range dans le cache, avec une petite étiquette « 10 min » ; (2) Alice écrit 25 € : la flèche frappe la base, qui passe à 25 €, le cache garde 20 € ; (3) la lecture de Bob part après le passage de la base à 25 €, frappe le cache et revient avec 20 €, en rouge ; une seconde lecture de Bob, plus tard, revient encore avec 20 €. Image décisive : 25 € à gauche, 20 € à droite, Bob tient 20 €. Deux vérités pour une même donnée.
- **Solution** : le même schéma. Alice écrit 25 € en base, **puis** la copie « 20 € » est barrée et s'efface du cache (l'ordre se voit : la base d'abord). La lecture de Bob trouve le cache vide, va à la base, revient avec 25 €, en vert, et une copie « 25 € » se range. L'étiquette « 10 min » reste : la durée de vie sert de filet.
- **À retenir** : la séquence écrire en base, puis effacer la copie, une dernière fois, sans texte ajouté.

Réserves du dossier tenues : on ne promet jamais « plus jamais périmé » (on dira « la copie suit ») ; l'ordre est toujours la base d'abord, puis l'effacement ; pas de citation de Phil Karlton dans ce pitch (voir les points à trancher) ; « durée de vie » à l'oral, « TTL » seulement à l'écran ; ni *hit*, ni *miss*, ni Redis à l'oral.

## Première réplique de l'élève

1. **Retenue** : « M'sieur, quand la base change, le cache suit, non ? » (9 mots, environ 2,7 s). C'est l'idée fausse du dossier mot pour mot, mise en question, sur le même moule que les deux vidéos précédentes ; et « suit » prépare la chute, où la taupe montre ce qu'il faut faire pour que la copie suive vraiment.
2. Affirmation fausse : « Le cache se met à jour tout seul avec la base ! »
3. « M'sieur, c'est pas la base qui prévient le cache ? »

## Dialogue

Pitch et réplique d'ouverture validés, avec : pas de code Laravel à l'écran, pas de Karlton, « durée de vie » dite une seule fois, au mécanisme. Les balises de jeu sont dans `dialogue.json` seulement.

| Beat | Voix | Image |
|---|---|---|
| Idée fausse (0–2,7 s) | Élève : « M'sieur, quand la base change, le cache suit, non ? » | La taupe sur la feuille, « Cache » écrit en haut. |
| Mécanisme (3,2–22,7 s) | Taupe : « Eh non : le cache n'est qu'une copie, la base ne le prévient pas. Un prix de 20 euros est gardé en cache. Alice le passe à 25 euros en base. Bob voit toujours 20 euros… jusqu'à ce que la durée de vie de la copie expire. » | Écran partagé : la base à gauche (côté Alice), à droite la colonne « Cache (serveur) ». Le cache est vide ; la lecture va à la base, revient avec 20 €, et une copie « 20 € » se range dans le cache, étiquette « 10 min ». La flèche d'Alice frappe la base, qui passe à 25 € ; le cache garde 20 €. Après ce passage à 25 €, la lecture de Bob frappe le cache et revient avec 20 €, en rouge : 25 € à gauche, 20 € à droite. Une seconde lecture de Bob, plus tard, revient encore avec 20 €. L'étiquette « 10 min » se marque sur « durée de vie ». |
| Relance (23,2–24,4 s) | Élève : « Et on fait comment ? » | La taupe écoute ; le schéma revient à zéro (base et cache à 20 €). |
| Solution (24,8–36,6 s) | Taupe : « Le code qui passe le prix à 25 euros en base efface aussi la copie, juste après. Bob trouve le cache vide, relit la base : 25 euros. » | Même schéma : la flèche d'Alice frappe la base, qui passe à 25 € ; puis la copie « 20 € » est barrée et s'efface du cache. La lecture de Bob trouve le cache vide, va à la base, revient avec 25 €, en vert ; une copie « 25 € » se range, l'étiquette « 10 min » reste. |
| À retenir (37,0–41,8 s) | Taupe : « La base d'abord, puis on efface la copie : là, elle suit. » | La séquence une dernière fois : la base passe à 25 €, puis la copie s'efface. |

**Estimation** : 96 mots (élève 13, taupe 83). Élève 13 ÷ 3,3 = 3,9 s ; taupe 83 ÷ 2,3 = 36,1 s ; 4 blancs × 0,45 s = 1,8 s. Total : environ 41,8 s, dans les bornes de 38 à 42 s.
