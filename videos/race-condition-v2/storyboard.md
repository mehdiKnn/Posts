# Race condition : storyboard

Mascotte : la taupe (Backend). Dispositif : collision en écran partagé, réutilisé pour la solution. Exemple unique : la dernière place de concert. Pas de code : il réexpliquerait le même mécanisme sous une autre forme.

Estimation : 84 mots (élève 10, taupe 74), environ 32 s avec les blancs entre répliques et 1,5 s de fin.

## Dialogue

Les balises entre crochets vont à la voix, jamais à l'écran.

1. **Élève** : M'sieur… c'est quoi, une race condition ?
2. **Taupe** : [sighs] Il reste une place de concert. Alice et Bob cliquent en même temps. Les deux voient « une place »… les deux achètent. Le site vérifie, puis il vend : entre les deux, l'autre s'est glissé. Deux billets, une seule place. [deadpan] Voilà une race condition : le résultat dépend de qui passe en premier.
3. **Élève** : Et… on fait comment ?
4. **Taupe** : On pose un verrou : vérifier et vendre deviennent un seul geste. Alice achète, Bob attend… [deadpan] et il voit « complet ».
5. **Taupe** : Donnée partagée, accès simultané… verrou.

## Beats

| Beat | Temps | Voix | Image | Texte à l'écran |
|---|---|---|---|---|
| Question | 0–3 s | Réplique 1 | Feuille à carreaux plein écran. « Race condition » écrit en haut, souligné en bleu. La taupe en bas à gauche, l'air las. | « Race condition » |
| Mécanisme | 3–21 s | Réplique 2 | Le schéma se trace au feutre : deux téléphones en écran partagé (Alice à gauche, Bob à droite), le billet au centre. Sur « cliquent », les deux doigts tapent. Sur « voient une place », les deux écrans affichent « 1 place » en même temps. Sur « achètent », deux flèches bleues foncent sur le billet : collision, le seul tremblement d'écran de la vidéo. Sur « deux billets », le billet se dédouble, le double en rouge. Sur « qui passe en premier », la baguette pointe les deux flèches. | « 1 place » sur les deux écrans |
| Relance | 21–23 s | Réplique 3 | La taupe écoute, bouche fermée, et le schéma revient à zéro. | aucun |
| Solution | 23–30 s | Réplique 4 | Même schéma, remis à zéro : un cadenas vert se ferme sur le billet côté Alice. La flèche de Bob s'arrête net, en pointillés, et attend. Puis l'écran de Bob passe à « complet », en vert. Le billet reste unique. | « complet » |
| À retenir | 30–32 s | Réplique 5 | « verrou » s'écrit sous le schéma, surligné en jaune ; la baguette tape dessus. Fin tenue 1,5 s. | « verrou » |

## Checklist sur le papier

- [x] 30 à 45 s, et environ 85 mots (borne basse du débit de la taupe)
- [x] Ouvre sur la question de l'élève ; la taupe est sur la feuille
- [x] Chaque beat apporte une info nouvelle ; la situation n'est racontée qu'une fois
- [x] Le mécanisme tient en un moment clé (la collision), et la solution réutilise le même schéma
- [x] Un seul exemple (le concert), aucune anecdote superposée
- [x] Pas de code
- [x] Texte limité au sujet, à « 1 place », « complet » et « verrou » ; chacun entre une fois et reste immobile
- [x] Aucun effet de distorsion sur le texte
- [x] Feuille à carreaux, palette Feutres, Handlee, la taupe
- [x] Voix validées à l'écoute (taupe x1,1, élève x1,0)

## Visuels prévus

- **Tracés au feutre en SVG** (gratuits, nets, animables trait par trait) : les téléphones, le billet, les flèches, le cadenas, le soulignement.
- **La taupe** : deux poses découpées dans sa planche de référence. Avec le bâton quand elle parle, bouche fermée et sans bâton quand l'élève parle ; aucune image générée pour cette vidéo.
