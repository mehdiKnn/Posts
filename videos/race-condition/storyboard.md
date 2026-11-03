# Race condition : storyboard

Mascotte : la taupe (Backend). Dispositif : collision en écran partagé, réutilisé pour la solution. Exemple unique : la dernière place de concert. Pas de code : il réexpliquerait le même mécanisme sous une autre forme.

DA Manar Studio ([da-manar.md](../../.claude/skills/video-courte/da-manar.md)) : papier à pois, titre en Bricolage Grotesque 800 souligné d'un pinceau miel, écrans et sous-titres en DM Sans. Rôles des couleurs : miel = action et mise en lumière (clics, flèches à filet d'encre, attente, aplat sous « verrou ») ; rouge brique = ce qui casse (le choc, le double) ; forêt = la réussite (coches, cadenas, flèche d'achat d'Alice, carte « complet » en crème). Le bâton de la taupe est fixe : c'est l'élément dont parle la voix qui se signale, d'une pulsation unique.

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
| Question | 0–3 s | Réplique 1 | Papier à pois plein écran. « Race condition » écrit en haut, souligné au pinceau miel. La taupe en bas à gauche, l'air las. | « Race condition » |
| Mécanisme | 3–21 s | Réplique 2 | Le schéma se trace au trait : deux téléphones en écran partagé (Alice à gauche, Bob à droite), le billet au centre. Sur « cliquent », les deux doigts tapent. Sur « voient une place », les deux écrans affichent « 1 place » en même temps. Sur « achètent », deux flèches miel foncent sur le billet : collision (choc rouge brique), le seul tremblement d'écran de la vidéo. Sur « vérifie », une coche forêt sur chaque écran. Sur « l'autre s'est glissé », la flèche de Bob pulse. Sur « deux billets », le billet se dédouble, le double en rouge brique. Sur « Voilà une race condition », le choc pulse. Sur « qui passe en premier », les deux flèches pulsent ensemble. | « 1 place » sur les deux écrans |
| Relance | 21–23 s | Réplique 3 | La taupe écoute, bouche fermée, et le schéma revient à zéro. | aucun |
| Solution | 23–30 s | Réplique 4 | Même schéma, remis à zéro : un cadenas forêt se ferme sur le billet. Sur « un seul geste », le cadenas pulse. La flèche forêt d'Alice va au billet ; l'attente de Bob est un court trait miel en pointillés, qui sort de son téléphone et s'arrête net. Puis l'écran de Bob passe à « complet », carte forêt, texte crème. Le billet reste unique. | « complet » |
| À retenir | 30–32 s | Réplique 5 | Sur « Donnée partagée », le billet pulse ; sur « accès simultané », la flèche d'Alice et l'attente de Bob pulsent ensemble. « verrou » s'écrit sous le schéma, au bout du bâton, en Bricolage Grotesque, puis un aplat de pinceau miel passe dessous. Fin tenue 1,5 s. | « verrou » |

## Checklist sur le papier

- [x] 30 à 45 s, et environ 85 mots (borne basse du débit de la taupe)
- [x] Ouvre sur la question de l'élève ; la taupe est sur la feuille
- [x] Chaque beat apporte une info nouvelle ; la situation n'est racontée qu'une fois
- [x] Le mécanisme tient en un moment clé (la collision), et la solution réutilise le même schéma
- [x] Un seul exemple (le concert), aucune anecdote superposée
- [x] Pas de code
- [x] Texte limité au sujet, à « 1 place », « complet » et « verrou » ; chacun entre une fois et reste immobile
- [x] Aucun effet de distorsion sur le texte
- [x] Papier à pois, DA Manar Studio (Bricolage Grotesque, DM Sans, miel, rouge brique, forêt), la taupe
- [x] Voix validées à l'écoute (taupe x1,1, élève x1,0)

## Visuels prévus

- **Tracés au trait en SVG** (gratuits, nets, animables trait par trait) : les téléphones, le billet, les flèches, le cadenas, le soulignement.
- **La taupe** : deux poses découpées dans sa planche de référence. Avec le bâton quand elle parle, bouche fermée et sans bâton quand l'élève parle ; aucune image générée pour cette vidéo.
