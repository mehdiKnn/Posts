# Script et storyboard

## Le format : un cours sur la feuille

La mascotte de la thématique fait cours sur une feuille à petits carreaux qui remplit l'écran, où le sujet est écrit ; une voix d'élève, hors champ, l'interpelle.

- **Durée** : 30 à 45 s. Le nombre de mots en découle : durée × débit des voix, noté dans la [charte](charte.md). Avec la taupe (2,3 mots/s), environ 70 à 100 mots.
- **Beats**, 5 au plus :
  1. **Idée fausse** (3 s au plus) : l'élève avance, en question, l'idée fausse qu'on se fait du sujet (« M'sieur, il suffit pas de… ? »). La mascotte est sur la feuille, le sujet y est écrit.
  2. **Mécanisme** : la mascotte réfute l'idée fausse dès ses premiers mots, et le schéma se dessine sur la feuille, comme tracé au feutre : il montre le mécanisme, et pourquoi l'idée fausse ne tient pas.
  3. **Relance**, facultative : l'élève pose la question qui mène à la solution (« Et on fait comment ? »).
  4. **Solution** : le même schéma, modifié.
  5. **À retenir** : la mascotte énonce la règle, et le schéma la montre une dernière fois, sans texte ajouté.

## Règles

- **L'idée fausse d'abord.** L'élève énonce l'erreur que ferait un dev débutant, plausible et précise ; la mascotte la réfute, puis explique. Une vidéo qui réfute une idée fausse, ou qui suit un dialogue, fait mieux apprendre qu'un exposé clair, qui peut même conforter l'erreur ([sources](sources.md)). Cette réplique est l'accroche : elle se dit en 3 s au plus, sans préambule.
- **L'accroche se choisit.** Le scénariste écrit trois formulations de la première réplique de l'élève (une question, une affirmation fausse, un « M'sieur, c'est pas… ? »), dit en une ligne laquelle il retient et pourquoi, et garde les deux autres dans `script.md` : si la vidéo ne retient pas, on ressort la suivante. Les trois partent de l'idée fausse du dossier.
- **La fin boucle.** La règle finale se dit, puis la feuille se vide et la signature s'écrit : la dernière image est la feuille vide de la première, la vidéo reprend sans à-coup.
- **Une info, une fois.** Chaque beat apporte du nouveau, et chaque chose se raconte une seule fois, sous une seule forme.
- **Le moment clé.** Le mécanisme tient en une image décisive : l'instant où tout bascule. Une séquence, quand elle est indispensable, tient en 3 étapes au plus, montrées en une seule passe.
- **L'image suit la voix.** À chaque instant, l'image montre ce que dit la phrase. Une action dite (un paiement, une requête, un envoi) se voit comme un mouvement, sur le mot qui la dit ; ce mouvement est éphémère : il apparaît, fait son trajet, puis s'efface. Seul l'état durable reste à l'écran (un verrou tenu, une donnée écrite). Un objet apparaît quand la voix le nomme.
- **La forme suit le fond.** Le schéma utilise un seul dispositif, choisi selon la nature du concept, et la solution modifie ce même schéma :

  | Le concept est… | Dispositif |
  |---|---|
  | un conflit, de la simultanéité (concurrence, verrou, cache incohérent) | collision : deux actions frappent le même objet au même instant, en écran partagé |
  | une comparaison (A contre B, avant/après) | écran partagé |
  | une transformation (compilation, sérialisation) | un objet qui se transforme |
  | un ordre de grandeur (complexité, latence) | échelle, zoom, course |
  | une cause et ses effets (cascade, effet de bord) | réaction en chaîne |
  | une structure (arbre, graphe, couches) | schéma qui se construit |

- **Rester théorique.** Un seul exemple, qui illustre le concept lui-même, filé du début à la fin. Chaque phrase sert le concept ou cet exemple, dans le cadre du cours.
- **Du code** quand il aide : un exemple simpliste, 4 lignes au plus, des noms parlants, un seul passage.
- **Le texte à l'écran** de chaque beat se décide avec [texte.md](texte.md).

## Exemple : la race condition

Environ 38 s et 85 mots, un seul dispositif (la collision en écran partagé). L'ouverture est réécrite selon la règle de l'idée fausse ; la vidéo publiée ouvrait sur « c'est quoi une race condition ? ».

| Beat | Voix | Image |
|---|---|---|
| Idée fausse (0–3 s) | Élève : « M'sieur, le site vend la dernière place au premier qui clique, non ? » | La taupe sur la feuille, « Race condition » écrit en haut. |
| Mécanisme (3–18 s) | Mascotte : « Pas forcément. Il reste une place de concert. Alice et Bob cliquent en même temps. Les deux lisent "1 place", les deux achètent : deux billets vendus. Le résultat dépend de qui passe en premier. » | Le schéma se dessine : un écran partagé Alice / Bob, les deux achats percutent le même billet, qui se dédouble. |
| Relance (18–21 s) | Élève : « Et on fait comment ? » | La taupe écoute, bouche fermée ; le schéma revient à zéro. |
| Solution (21–33 s) | Mascotte : « On pose un verrou : un seul achat à la fois. Bob attend qu'Alice ait fini, et il voit "complet". » | Même schéma : un verrou se ferme côté Alice, Bob patiente, son écran passe à « complet ». |
| À retenir (33–38 s) | Mascotte : « Donnée partagée, accès simultané : verrou. » | Le verrou se referme une dernière fois côté Alice. |
