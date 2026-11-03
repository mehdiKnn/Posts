# Le cache : dossier

Thématique backend, mascotte la taupe. Suite possible de `race-condition` et `deadlock` : on peut garder Alice et Bob.

## Le cadrage retenu

**Le cache applicatif côté serveur, en *cache-aside*.** Le code garde dans un stockage rapide (mémoire, Redis, Memcached) le résultat d'une lecture coûteuse, puis le relit au lieu de refaire la lecture. Le sujet porte sur le TTL, l'invalidation et les données périmées. Pourquoi ce cadrage :

- **C'est le cache que le dev backend écrit lui-même** : `Cache::remember(...)` en Laravel. Le bug des données périmées vient donc de son code, et c'est son code qui le corrige.
- **Le cache HTTP du navigateur est écarté.** Il est piloté par des en-têtes (`Cache-Control`), côté client, et c'est un autre mécanisme et un autre public.
- **Le cache CPU est écarté.** C'est du matériel, et le dev web n'agit pas dessus.
- **Une seule idée tient en 40 s** : une copie ne suit pas l'original.

## Le concept

- **Exact** : un cache applicatif est une copie du résultat d'une lecture coûteuse (requête SQL, appel d'API, calcul), gardée dans un stockage rapide et resservie tant qu'elle est jugée valide. Ce n'est pas la source de vérité : rien ne la garde cohérente avec la base. Le code doit la faire expirer (TTL) ou l'invalider quand la donnée change, sinon elle sert une valeur périmée.
- **Simple** : on garde la réponse sous la main pour ne pas retourner la chercher. Mais si l'original change, la copie, elle, ne bouge pas.

## Trois idées fausses (de la plus répandue à la moins)

1. **« Quand la base change, le cache suit. »** C'est l'ouverture. Faux : le cache est une copie à part, la base ne le prévient pas. Microsoft l'écrit : un changement en base « n'apparaît pas dans le cache tant que l'élément n'est pas rechargé ». AWS parle de *stale data* : il n'y a « aucune mise à jour du cache quand la donnée change en base ».
2. **« Avec un TTL, le problème est réglé. »** Seulement en partie. Le TTL borne la durée pendant laquelle la valeur peut rester périmée, mais il ne l'empêche pas. Selon AWS, il « ne garantit pas qu'une valeur ne soit pas périmée », il l'empêche « de l'être trop ». Et il y a un arbitrage : un TTL trop court fait relire la base sans cesse, un TTL trop long garde la valeur périmée longtemps (Microsoft).
3. **« Mettre en cache rend forcément plus rapide. »** Non. Un *miss* coûte plus cher que l'absence de cache, car il fait trois allers-retours : lire le cache, lire la base, écrire le cache (AWS). Si la donnée est rarement relue, ou si la plupart des requêtes ratent le cache, le surcoût l'emporte (Microsoft).

## Le mécanisme

Exemple : le prix d'un produit, mis en cache 10 minutes (détaillé plus bas).

1. **Premier affichage** : le cache est vide (*miss*). Le code lit la base, qui renvoie 20 €, range une copie avec un TTL de 10 min et répond.
2. **Affichages suivants** : le cache répond (*hit*), vite, et la base n'est pas sollicitée.
3. **Alice passe le prix à 25 € en base.** Le cache n'en sait rien et garde 20 €.
4. **Bob affiche le produit** et voit 20 €. Il le verra jusqu'à ce que le TTL expire, ou jusqu'à ce que le code invalide la copie.

**L'instant où tout bascule** : l'étape 4, en écran partagé. À gauche, la base dit 25 € ; à droite, le cache dit 20 €. La lecture de Bob frappe le cache après que la base est passée à 25 € : il reçoit 20 €, et la copie reste périmée tant que sa durée de vie n'est pas écoulée. Ce sont deux vérités pour une même donnée.

**La solution retenue : invalider à l'écriture.** Le code qui modifie le prix met d'abord la base à jour, puis supprime la clé du cache. La lecture suivante fait un *miss* et recharge 25 €. Le TTL reste en place, comme filet de sécurité pour les écritures qu'on n'aurait pas prévues. C'est le schéma *cache-aside* de Microsoft (« écrire en base, puis invalider l'élément dans le cache »).

## Exemple canonique

**Le prix d'un produit, changé par Alice, lu par Bob.** Pourquoi il est juste :

- il ne contient que le concept : une donnée, une copie, une écriture qui ne passe pas par la copie ;
- l'écart se lit d'un coup d'œil (20 € contre 25 €) et la conséquence est concrète, sans être catastrophique ;
- c'est une donnée lue souvent et modifiée rarement, donc un vrai cas d'usage du cache (Microsoft : le cache convient aux données « relativement statiques » ou lues fréquemment) ;
- la solution s'y lit d'elle-même : on efface la copie quand on change le prix.

Si du code aide (4 lignes au plus, Laravel) :

```php
$prix = Cache::remember('prix:42', 600, fn () => Produit::find(42)->prix);
// quand Alice change le prix :
$produit->update(['prix' => 25]);
Cache::forget('prix:42');
```

À éviter :

- **le stock ou les places restantes** : cela mélange la donnée périmée et la race condition, et cache un stock est une mauvaise pratique ;
- **la métaphore du frigo ou du post-it** : elle ne montre ni la base, ni la clé, ni l'invalidation.

## Ce qu'il ne faut pas affirmer

- **« Avec l'invalidation, le cache n'est plus jamais périmé. »** Trop fort. Microsoft : *cache-aside* « ne garantit pas la cohérence ». Une écriture faite par un autre processus, qui ne passe pas par ce code, n'invalide rien. Il existe aussi une course connue : un lecteur qui a raté le cache juste avant l'écriture peut y remettre l'ancienne valeur après l'effacement. Je ne l'ai vue que dans des sources secondaires, donc ne pas la détailler. Dire plutôt : « la copie suit ».
- **Inverser l'ordre.** On écrit en base d'abord, puis on efface le cache. L'inverse ouvre une fenêtre où un lecteur recharge l'ancienne valeur dans le cache (Microsoft, en note).
- **« Le TTL vide le cache quand il est plein. »** C'est confondre deux choses : l'expiration (TTL, une question de temps) et l'éviction (cache plein, souvent selon LRU, une question de place).
- **« Il faut mettre à jour le cache. »** C'est discuté plutôt que faux. *Cache-aside* efface la clé (Microsoft). *Write-through* écrit la nouvelle valeur dans le cache en même temps que la base, et ses données sont « jamais périmées » selon AWS, au prix d'écritures plus lentes et d'un cache rempli de données jamais lues. Ce sont deux stratégies légitimes. En 40 s, on garde « on efface ».
- **Attribuer avec certitude la citation de Phil Karlton** (« deux choses difficiles : l'invalidation du cache et nommer les choses »). Martin Fowler dit n'avoir trouvé aucune source satisfaisante ; la plus ancienne trace qu'il cite (Tim Bray) la fait remonter à 1996-97, de mémoire. Si on la cite, dire « on prête à Phil Karlton ».
- **On peut sacrifier sans mentir** :
  - les mots *hit* et *miss* (on peut dire « le cache répond » / « le cache est vide ») ;
  - *write-through*, l'éviction, le *stampede* (beaucoup de *miss* simultanés quand une clé populaire expire) et `Cache::flexible` (*stale-while-revalidate*) ;
  - le nom du stockage (Redis ou autre) ;
  - la course résiduelle ci-dessus, tant qu'on ne promet pas « jamais périmé ».

## Vocabulaire

| Terme | À garder | Prononciation courante |
|---|---|---|
| cache | oui, c'est le sujet (mot français) | « kache » |
| TTL (*time to live*) | oui, à l'écran ; à l'oral, « durée de vie » est plus clair | « ti-ti-elle » |
| invalider / invalidation | oui, le mot du métier, en français | en français |
| *hit* / *miss* | facultatif | « hite » / « misse » |
| périmé (*stale*) | « périmé » à l'oral ; *stale* seulement en sous-titre | *stale* : « stèle » |
| Redis | seulement si on nomme le stockage | « rédisse » (à faire écouter, cf. `voix.md`) |
| *cache-aside* | non, pas à l'oral | « kache-assaïde » |

## Sources

- [Microsoft, Azure Architecture Center, *Cache-Aside pattern*](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) établit plusieurs points :
  - le mécanisme en trois étapes (lire le cache, *miss*, charger depuis la base puis ranger) ;
  - l'invalidation à l'écriture, et l'ordre (la base d'abord, puis la suppression, sinon la valeur périmée revient) ;
  - l'absence de garantie de cohérence ;
  - l'arbitrage sur la durée d'expiration ;
  - la distinction entre expiration et éviction (LRU) ;
  - les cas où le cache ne convient pas.
- [AWS, ElastiCache, *Caching strategies*](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html) (la page ouverte s'intitule « Caching strategies for Memcached ») établit plusieurs points :
  - le *lazy loading*, avec *hit* et *miss* ;
  - le coût d'un *miss* (trois allers-retours) ;
  - le *stale data*, faute de mise à jour du cache quand la base change ;
  - le *write-through*, avec ses avantages et ses coûts ;
  - le TTL, qui « ne garantit pas » qu'une valeur ne soit pas périmée mais l'empêche « de l'être trop ».
- [Laravel 13, *Cache*](https://laravel.com/docs/13.x/cache) établit l'API du code d'exemple :
  - `Cache::remember` (si la clé manque, la closure est exécutée et son résultat rangé avec le TTL donné en secondes) ;
  - `Cache::forget` (supprime la clé) ;
  - `Cache::flexible` (*stale-while-revalidate*), à ne pas montrer.
- Pour la citation seulement : [Martin Fowler, *TwoHardThings*](https://martinfowler.com/bliki/TwoHardThings.html), qui attribue la phrase à Phil Karlton sans source primaire.
