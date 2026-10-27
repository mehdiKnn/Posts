# Planning de publication

Une vidéo produite donne trois publications le même jour : TikTok, Reels Instagram et YouTube Shorts. Le rythme de publication fixe donc la production. Chaque semaine, on produit les vidéos de la semaine suivante.

Une vidéo par jour dès le 2 novembre. Deux thèmes alternent : un jour le back, avec la taupe, le lendemain le front, avec le caméléon.

Horizon : un trimestre, du 2 novembre 2026 au 24 janvier 2027. À revoir à la revue de S12.

## Le rythme

- **Une par jour dès le 2 novembre** : 7 vidéos par semaine. La première semaine est tout en back : le stock de départ la couvre exactement, et aucune vidéo front n'est encore produite.
- **Fêtes, S8 et S9** : 5 vidéos par semaine, sans vidéo les 24, 25, 31 décembre et 1er janvier, et aucune production la semaine de Noël. Le stock est fait d'avance.
- **Si la production décroche** : on ne sort pas une vidéo bâclée pour tenir le créneau. La semaine suivante passe à 5 vidéos, le temps de reconstituer le stock.
- **Bilan du rythme** : à la revue du 27 décembre, on regarde si la médiane des vues par vidéo progresse de novembre à décembre et si la production a tenu. Si les deux tiennent, on garde une par jour, et on peut viser plus. Sinon, on revient à 5 par semaine dès S10, et la production suit.
- **Créneau** : 18 h 30, heure de Paris, sur les trois plateformes, programmé d'avance depuis l'outil de chacune (TikTok Studio, Instagram, YouTube Studio). Au bout de quatre semaines, on lit dans les statistiques les heures où l'audience est active, et on cale le créneau dessus.
- **Pourquoi pas 3 par jour** : le conseil vient de TikTok, vers 2021 (1 à 4 par jour), repris par des blogs sans source officielle. Chaque vidéo est diffusée pour elle-même, donc le volume ne pénalise pas le compte. Mais à 21 vidéos par semaine, le sujet, l'idée fausse et les contrôles humains (planche, écoute) seraient bâclés, et une vidéo bâclée est moins diffusée. Le bilan du 27 décembre dit si on peut monter.

## Back et front

- **Alternance stricte dès le 9 novembre** : une vidéo front, puis une vidéo back, week-ends et fêtes compris. La première semaine reste en back, parce que tout le stock de départ est en back.
- **La mascotte du front** : le caméléon, dev front branché un peu hipster, validé le 26 octobre avec sa planche et sa voix (casting de [charte.md](.claude/skills/video-courte/charte.md)). S1 produit les 5 premières vidéos front, publiées dès le 9 novembre. L'élève reste le même.
- **Les piliers** : chaque thème a les siens. Deux vidéos d'un même thème qui se suivent ne sont jamais du même pilier.
  - Back : Bases de données, API et réseau, Sécurité, Concurrence et perf, plus un joker, Équipe et archi.
  - Front : JavaScript, CSS, Navigateur (réseau, cache, sécurité côté navigateur), Accessibilité et HTML.
- **Ce qui change de camp** : les sujets qui se jouent dans le navigateur passent au front (CORS, XSS, la validation des formulaires, la clé d'API dans le code du site, HTTPS, le CDN).

## Combien produire

Règle : en fin de semaine, les vidéos de la semaine suivante sont prêtes (rendu final validé, voix écoutée), plus **1 vidéo de sécurité par thème** pour absorber une vidéo ratée.

| Semaine | Dates | Publiées (back + front) | À produire (back + front) | Prêtes en fin de semaine |
|---|---|---|---|---|
| S0 | 26 oct. – 1er nov. | 0 | 1 (1 + 0), plus 4 retouches back, et la mascotte du front | 8 |
| S1 | 2 – 8 nov. | 7 (7 + 0) | 8 (3 + 5) | 9 |
| S2 | 9 – 15 nov. | 7 (3 + 4) | 7 (4 + 3) | 9 |
| S3 | 16 – 22 nov. | 7 (4 + 3) | 7 (3 + 4) | 9 |
| S4 | 23 – 29 nov. | 7 (3 + 4) | 7 (4 + 3) | 9 |
| S5 | 30 nov. – 6 déc. | 7 (4 + 3) | 8 (4 + 4) | 10 |
| S6 | 7 – 13 déc. | 7 (3 + 4) | 8 (4 + 4) | 11 |
| S7 | 14 – 20 déc. | 7 (4 + 3) | 8 (4 + 4) | 12 |
| S8 | 21 – 27 déc. | 5 (2 + 3) | 0 (Noël) | 7 |
| S9 | 28 déc. – 3 janv. | 5 (3 + 2) | 7 (3 + 4) | 9 |
| S10 | 4 – 10 janv. | 7 (3 + 4) | 7 (4 + 3) | 9 |
| S11 | 11 – 17 janv. | 7 (4 + 3) | 7 (3 + 4) | 9 |
| S12 | 18 – 24 janv. | 7 (3 + 4) | 7 (4 + 3) | 9 |
| **Total** | | **80 (43 + 37)** | **82 (41 + 41), plus 4 retouches** | |

Les deux premières semaines sont les plus chargées, et sans marge. Cette semaine : 4 retouches, le salage (la vidéo de sécurité de S1). En S1 : 8 vidéos, dont les 5 premières du front, pendant qu'on publie tous les jours. Ensuite 7 par semaine, et 8 en décembre pour faire d'avance le stock des fêtes.

Le stock de départ compte 7 vidéos, toutes en back. Trois sont prêtes : hachage, index, cache. Quatre sont à reprendre cette semaine. Idempotence (retours du 20/10) et RACI (le retour bloquant du storyboard) sont à finir. Race condition et deadlock sont à refaire depuis le script, parce qu'elles ouvrent sur « c'est quoi… ? » au lieu d'une idée fausse ([script.md](.claude/skills/video-courte/script.md)). `race-condition-v2` et `test-sous-titres` sont des essais, pas des vidéos. Le front part de zéro.

Si le rythme change, la production suit :

| Rythme | Vidéos par mois | À produire par semaine | Temps humain par semaine | Images OpenAI par mois |
|---|---|---|---|---|
| 5 par semaine | 22 | 5 | environ 5 h | 4 à 9 $ |
| **1 par jour (le plan)** | **30** | **7** | **environ 6 h 20** | **6 à 12 $** |
| 3 par jour | 91 | 21 | environ 15 h 40 | 18 à 36 $ |

Le temps humain est une estimation, à recaler après S1 : 40 min par vidéo (planche, écoute, contrôle, une retouche, publication sur les trois plateformes), plus 1 h 40 fixe par semaine (la revue, 30 min, et les commentaires, 10 min par jour). Les semaines à 8 vidéos (S1 et décembre) font environ 7 h. Chaque vidéo prend aussi environ 35 min de mode AFK, sans surveillance. Côté ElevenLabs, une vidéo par jour fait environ 27 000 caractères de voix par mois : à comparer au quota du plan de l'équipe.

## Calendrier, du 2 novembre au 3 janvier

On lance avec le hachage : « crypter les mots de passe » est une erreur que font même ceux qui ne codent pas, donc c'est l'accroche qui parle au public le plus large. Le front ouvre le 9 novembre avec 0,1 + 0,2 : un résultat faux que chacun peut vérifier dans sa console.

Le back de S2 et S3 suit le stock : le salage après le hachage, l'index à l'écriture après l'index, réessayer après l'idempotence, le cache qui expire après le cache. En décembre, les sessions suivent la montée en charge. On relie chaque suite à sa vidéo : en « vidéo associée » sur YouTube, et « La suite : … » en commentaire épinglé sur TikTok et Instagram.

Dès S5, une vidéo à produire est prête la veille de sa semaine ; celles des fêtes, avant la pause de Noël.

| Date | Thème | Vidéo | Pilier | État |
|---|---|---|---|---|
| lun. 2 nov. | Back | Hachage des mots de passe | Sécurité | prête · vidéo de lancement |
| mar. 3 nov. | Back | Race condition | Concurrence et perf | à refaire en S0 |
| mer. 4 nov. | Back | Index de base de données | Bases de données | prête |
| jeu. 5 nov. | Back | Cache | Concurrence et perf | prête · cache ou cache-focus |
| ven. 6 nov. | Back | Idempotence | API et réseau | à finir en S0 |
| sam. 7 nov. | Back | Deadlock | Concurrence et perf | à refaire en S0 |
| dim. 8 nov. | Back | RACI | Équipe et archi | à finir en S0 |
| lun. 9 nov. | Front | 0,1 + 0,2 | JavaScript | à produire · 1re vidéo front · S1 |
| mar. 10 nov. | Back | Le salage | Sécurité | à produire · suite du hachage · S0 |
| mer. 11 nov. | Front | Spécificité CSS | CSS | à produire en S1 |
| jeu. 12 nov. | Back | Index à l'écriture | Bases de données | à produire · suite de l'index · S1 |
| ven. 13 nov. | Front | CORS | Navigateur | à produire en S1 |
| sam. 14 nov. | Back | Réessayer sans tout casser | API et réseau | à produire · suite de l'idempotence · S1 |
| dim. 15 nov. | Front | Div cliquable | Accessibilité et HTML | à produire en S1 |
| lun. 16 nov. | Back | Cache qui expire | Concurrence et perf | à produire · suite du cache · S1 |
| mar. 17 nov. | Front | Tableau en const | JavaScript | à produire en S1 |
| mer. 18 nov. | Back | JWT | Sécurité | à produire en S2 |
| jeu. 19 nov. | Front | z-index | CSS | à produire en S2 |
| ven. 20 nov. | Back | Transaction | Bases de données | à produire en S2 |
| sam. 21 nov. | Front | Valider côté navigateur | Navigateur | à produire en S2 |
| dim. 22 nov. | Back | Webhook | API et réseau | à produire en S2 |
| lun. 23 nov. | Front | Texte alternatif | Accessibilité et HTML | à produire en S2 |
| mar. 24 nov. | Back | Asynchrone et parallèle | Concurrence et perf | à produire en S2 |
| mer. 25 nov. | Front | Copie d'objet | JavaScript | à produire en S3 |
| jeu. 26 nov. | Back | Injection SQL | Sécurité | à produire en S3 |
| ven. 27 nov. | Front | Box model | CSS | à produire en S3 |
| sam. 28 nov. | Back | Requêtes N+1 | Bases de données | à produire en S3 |
| dim. 29 nov. | Front | XSS | Navigateur | à produire en S3 |
| lun. 30 nov. | Back | Timeout | API et réseau | à produire · prête le 29 nov. |
| mar. 1er déc. | Front | Placeholder et label | Accessibilité et HTML | à produire · prête le 29 nov. |
| mer. 2 déc. | Back | Montée en charge | Concurrence et perf | à produire · prête le 29 nov. |
| jeu. 3 déc. | Front | setTimeout à 0 | JavaScript | à produire · prête le 29 nov. |
| ven. 4 déc. | Back | Microservices | Équipe et archi | à produire · prête le 29 nov. |
| sam. 5 déc. | Front | Opacité zéro | CSS | à produire · prête le 29 nov. |
| dim. 6 déc. | Back | Sessions et répartiteur | API et réseau | à produire · suite de la montée en charge · prête le 29 nov. |
| lun. 7 déc. | Front | Cache du navigateur | Navigateur | à produire · prête le 6 déc. |
| mar. 8 déc. | Back | Secret dans Git | Sécurité | à produire · prête le 6 déc. |
| mer. 9 déc. | Front | Tailles en px | Accessibilité et HTML | à produire · prête le 6 déc. |
| jeu. 10 déc. | Back | NULL | Bases de données | à produire · prête le 6 déc. |
| ven. 11 déc. | Front | fetch et catch | JavaScript | à produire · prête le 6 déc. |
| sam. 12 déc. | Back | File de messages | Concurrence et perf | à produire · prête le 6 déc. |
| dim. 13 déc. | Front | Animer en CSS | CSS | à produire · prête le 6 déc. |
| lun. 14 déc. | Back | GET ou POST | API et réseau | à produire · prête le 13 déc. |
| mar. 15 déc. | Front | Clé d'API dans le front | Navigateur | à produire · prête le 13 déc. |
| mer. 16 déc. | Back | CSRF | Sécurité | à produire · prête le 13 déc. |
| jeu. 17 déc. | Front | Contraste | Accessibilité et HTML | à produire · prête le 13 déc. |
| ven. 18 déc. | Back | Réplication | Bases de données | à produire · prête le 13 déc. |
| sam. 19 déc. | Front | == et === | JavaScript | à produire · prête le 13 déc. |
| dim. 20 déc. | Back | Verrou optimiste | Concurrence et perf | à produire · prête le 13 déc. |
| lun. 21 déc. | Front | Flexbox et Grid | CSS | à produire · prête le 20 déc. |
| mar. 22 déc. | Back | Versionner une API | API et réseau | à produire · prête le 20 déc. |
| mer. 23 déc. | Front | Script bloquant | Navigateur | à produire · prête le 20 déc. |
| sam. 26 déc. | Back | Tout logger | Sécurité | à produire · prête le 20 déc. |
| dim. 27 déc. | Front | ARIA partout | Accessibilité et HTML | à produire · prête le 20 déc. |
| lun. 28 déc. | Back | Pagination | Bases de données | à produire · prête le 20 déc. |
| mar. 29 déc. | Front | État React | JavaScript | à produire · prête le 20 déc. |
| mer. 30 déc. | Back | Couverture de tests | Équipe et archi | à produire · prête le 20 déc. |
| sam. 2 janv. | Front | HTTPS | Navigateur | à produire · prête le 20 déc. |
| dim. 3 janv. | Back | Clé étrangère | Bases de données | à produire · prête le 20 déc. |

Janvier (S10 à S12, 21 vidéos : 10 back, 11 front) se remplit aux revues de décembre, d'abord avec la réserve ci-dessous, puis avec les questions posées en commentaire et la suite des vidéos qui marchent.

## Sujets

Le planning ne donne que le sujet. L'idée fausse que l'élève avance en ouverture se détermine dans le workflow, au script, selon les règles de [script.md](.claude/skills/video-courte/script.md).

### Back

| Prévu | Sujet | Pilier |
|---|---|---|
| 10 nov. | Le salage | Sécurité |
| 12 nov. | Index à l'écriture | Bases de données |
| 14 nov. | Réessayer sans tout casser | API et réseau |
| 16 nov. | Cache qui expire | Concurrence et perf |
| 18 nov. | JWT | Sécurité |
| 20 nov. | Transaction | Bases de données |
| 22 nov. | Webhook | API et réseau |
| 24 nov. | Asynchrone et parallèle | Concurrence et perf |
| 26 nov. | Injection SQL | Sécurité |
| 28 nov. | Requêtes N+1 | Bases de données |
| 30 nov. | Timeout | API et réseau |
| 2 déc. | Montée en charge | Concurrence et perf |
| 4 déc. | Microservices | Équipe et archi |
| 6 déc. | Sessions et répartiteur | API et réseau |
| 8 déc. | Secret dans Git | Sécurité |
| 10 déc. | NULL | Bases de données |
| 12 déc. | File de messages | Concurrence et perf |
| 14 déc. | GET ou POST | API et réseau |
| 16 déc. | CSRF | Sécurité |
| 18 déc. | Réplication | Bases de données |
| 20 déc. | Verrou optimiste | Concurrence et perf |
| 22 déc. | Versionner une API | API et réseau |
| 26 déc. | Tout logger | Sécurité |
| 28 déc. | Pagination | Bases de données |
| 30 déc. | Couverture de tests | Équipe et archi |
| 3 janv. | Clé étrangère | Bases de données |
| réserve | Migration sans coupure | Bases de données |
| réserve | Pool de connexions | Bases de données |
| réserve | Dates en UTC | Bases de données |
| réserve | Limite de requêtes | API et réseau |
| réserve | DNS | API et réseau |
| réserve | Ramasse-miettes | Concurrence et perf |
| réserve | Déployer et livrer | Équipe et archi |

### Front

| Prévu | Sujet | Pilier |
|---|---|---|
| 9 nov. | 0,1 + 0,2 | JavaScript |
| 11 nov. | Spécificité CSS | CSS |
| 13 nov. | CORS | Navigateur |
| 15 nov. | Div cliquable | Accessibilité et HTML |
| 17 nov. | Tableau en const | JavaScript |
| 19 nov. | z-index | CSS |
| 21 nov. | Valider côté navigateur | Navigateur |
| 23 nov. | Texte alternatif | Accessibilité et HTML |
| 25 nov. | Copie d'objet | JavaScript |
| 27 nov. | Box model | CSS |
| 29 nov. | XSS | Navigateur |
| 1er déc. | Placeholder et label | Accessibilité et HTML |
| 3 déc. | setTimeout à 0 | JavaScript |
| 5 déc. | Opacité zéro | CSS |
| 7 déc. | Cache du navigateur | Navigateur |
| 9 déc. | Tailles en px | Accessibilité et HTML |
| 11 déc. | fetch et catch | JavaScript |
| 13 déc. | Animer en CSS | CSS |
| 15 déc. | Clé d'API dans le front | Navigateur |
| 17 déc. | Contraste | Accessibilité et HTML |
| 19 déc. | == et === | JavaScript |
| 21 déc. | Flexbox et Grid | CSS |
| 23 déc. | Script bloquant | Navigateur |
| 27 déc. | ARIA partout | Accessibilité et HTML |
| 29 déc. | État React | JavaScript |
| 2 janv. | HTTPS | Navigateur |
| réserve | CDN | Navigateur |
| réserve | Latence et débit | Navigateur |
| réserve | Images hors écran | Navigateur |
| réserve | Jeton dans le localStorage | Navigateur |
| réserve | Police web | Navigateur |
| réserve | Recherche à chaque touche | JavaScript |
| réserve | this | JavaScript |
| réserve | Rendu côté serveur | JavaScript |
| réserve | 100vh | CSS |
| réserve | Contour du focus | Accessibilité et HTML |

La liste doit toujours couvrir deux semaines d'avance, soit 7 sujets par thème. Elle se remplit à la revue, à partir de trois sources : la section « Laissé hors champ » de chaque `script.md`, les questions posées en commentaire, et la suite des deux vidéos du mois qui ont le plus de partages et d'enregistrements.

## Publier une vidéo

- **Le fichier** : `videos/<sujet>/video.mp4`, envoyé tel quel sur chaque plateforme. On ne reprend jamais une vidéo téléchargée d'une autre plateforme : Instagram freine les vidéos qui portent le filigrane d'un concurrent.
- **Pas de sous-titres automatiques** : la vidéo a déjà les siens, ils feraient doublon.
- **La couverture** : l'image du moment clé, prise dans la vidéo. Le schéma est au centre, donc il reste lisible dans la grille du profil, qui recadre.
- **TikTok** : la légende reprend la question de l'élève avec les mots qu'on taperait dans la recherche, puis 3 à 5 hashtags.
- **Instagram** : la première ligne est la question, la deuxième dit ce qu'on va comprendre, la dernière demande l'avis du spectateur. 5 hashtags au plus, la limite d'Instagram depuis décembre 2025.
- **YouTube** : un titre avec le mot qu'on chercherait, sans dévoiler la réponse, et une playlist par pilier. La recherche compte pour les Shorts éducatifs.
- **Hashtags** : 3 fixes, `#backend` ou `#frontend` selon le thème, puis `#developpeur #apprendreacoder`, plus 2 du sujet.
- **Épingler** : à la revue de S3, épingler les 3 meilleures vidéos sur TikTok et Instagram, en mêlant back et front.

Exemple, le hachage :

- TikTok : « On chiffre les mots de passe ? Pas du tout, et voici pourquoi. #motdepasse #cybersecurite #backend #developpeur #apprendreacoder »
- Instagram : « On chiffre les mots de passe, non ? / Ce que fait vraiment le site quand tu te connectes, en 40 s. / Tu l'aurais dit comment, toi ? » avec `#motdepasse #cybersecurite #backend #developpeur #apprendreacoder`
- YouTube : « Mot de passe : pourquoi on ne le chiffre pas », playlist Sécurité.

Après la publication, on répond à chaque commentaire le soir même et le lendemain. Une question en commentaire est un sujet candidat. À partir de S5, si une question colle au format, sa vidéo prend le prochain créneau de son thème. Sur TikTok, on la publie en réponse au commentaire, et la réplique de l'élève est la question telle quelle.

## La revue du dimanche

30 minutes, chaque dimanche :

1. Relever dans le journal les chiffres des vidéos de la semaine précédente, chacune à J+7 au moins.
2. Appliquer les règles ci-dessous.
3. Valider les sujets de la semaine qui vient, puis programmer les publications de la semaine suivante.

Les règles :

- **Pas de seuil absolu**. Les moyennes publiques viennent de vendeurs d'outils. À partir de 8 vidéos, chaque vidéo se compare à la médiane du compte.
- **L'accroche est faible** (beaucoup de spectateurs partent dans les 3 premières secondes) : c'est l'idée fausse qui pèche ; on la retravaille dans script.md.
- **La rétention chute au même beat sur plusieurs vidéos** : c'est le rythme ; on corrige animation.md.
- **Les deux vidéos du mois les plus partagées et enregistrées** : leur suite passe en tête des sujets.
- **Back contre front** : au bilan du 27 décembre, on compare aussi la médiane de chaque thème. Si l'un décroche nettement, on change la proportion (deux back pour un front, ou l'inverse).
- **Ne pas juger avant J+7**. Les Shorts seraient surtout recommandés pendant leur premier mois (observation de stratèges, non confirmée par YouTube).
- **Ce qu'on apprend sur la portée** quand elle tire contre la pédagogie s'écrit dans les Arbitrages de [sources.md](.claude/skills/video-courte/sources.md).

## Journal

Une ligne par vidéo, relevée à J+7. Les vues s'écrivent dans l'ordre TikTok / Instagram / YouTube. L'accroche est la part de spectateurs encore là à 3 s ; la rétention, la part moyenne de la vidéo regardée.

| Date | Thème | Vidéo | Vues TT / IG / YT | Accroche | Rétention | Partages + enregistrements pour 1 000 vues | Abonnés gagnés |
|---|---|---|---|---|---|---|---|

## Semaine 0, du 26 octobre au 1er novembre

- [ ] Créer les trois comptes, sous le même nom, avec la photo de profil choisie dans `charte/profil/` et une bio d'une phrase : ce qu'on apprend (le back et le front), et le rythme.
- [x] Créer la mascotte du front avec la charte : persona, planche, voix, ligne au casting. C'est le caméléon (`cameleon`).
- [ ] Choisir entre `videos/cache` et `videos/cache-focus`.
- [ ] Finir idempotence et RACI ; refaire race condition et deadlock depuis le script.
- [ ] Produire le salage, la vidéo de sécurité de S1.
- [ ] Écrire les textes des 7 vidéos de S1 et les programmer.
- [ ] Valider les sujets de S2 et S3. En S1 : produire les 5 premières vidéos front et 3 vidéos back.

## Sources

Des guides de marketing et des blogs, pas des études : comme pour les règles de la vidéo ([sources.md](.claude/skills/video-courte/sources.md)), on les prend pour des hypothèses de départ, que le journal confirme ou dément.

- Limite de 5 hashtags sur Instagram, annoncée en décembre 2025 : [Ruche Pollen](https://ruche-pollen.com/blog-social-media/instagram-limite-les-hashtags-a-5-maximum-ce-qui-change-pour-les-marques), [Later](https://later.com/blog/instagram-hashtags/amp).
- 3 à 5 vidéos par semaine sur TikTok, chaque vidéo classée pour elle-même, la recherche par mots-clés : [Megadigital](https://megadigital.ai/en/blog/how-often-should-you-post-on-tiktok/), [HeyOrca](https://www.heyorca.com/blog/how-tiktoks-algorithm-actually-works-2026), [SocialBu](https://socialbu.com/blog/tiktok-algorithm/).
- Le conseil des 1 à 4 vidéos par jour, attribué à TikTok sans source officielle : [JoinBrands](https://joinbrands.com/blog/how-often-to-post-on-tiktok), [Shortimize](https://shortimize.com/blog/how-often-to-post-on-tiktok).
- Shorts : poids de la recherche pour l'éducatif, de la fraîcheur, et du taux de spectateurs qui balayent : [TunePocket](https://www.tunepocket.com/youtube-shorts-algorithm-update-focus-on-freshness-and-search/), [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/), [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/).
