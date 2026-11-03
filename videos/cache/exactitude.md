# Le cache : exactitude

Verdict de l'expert sur `dialogue.json` et `script.md`, contre `dossier.md` et ses sources (page Microsoft *Cache-Aside* relue, version de décembre 2025).

## Bloquant

1. **Réplique 4 : « Quand Alice change le prix en base, le code efface la copie juste après. » Trompeur.**
   La phrase se lit comme une cause : la base change, puis le code réagit. Elle contredit « la base ne le prévient pas » (réplique 2) et laisse croire que le code détecte les changements de la base, donc que les écritures faites hors de ce code (SQL à la main, un autre service) sont couvertes. La règle n'est vraie que si l'écriture et l'effacement se font dans le même code.
   Correction : « Le code qui passe le prix à 25 euros en base efface aussi la copie, juste après. Bob trouve le cache vide, relit la base : 25 euros. »
   La chute « La base d'abord, puis on efface la copie : là, elle suit. » peut rester.

2. **Schéma, beat Mécanisme : « la lecture de Bob frappe le cache au même instant ». Trompeur.**
   La simultanéité laisse croire que Bob voit 20 € parce qu'il lit pile au moment où Alice écrit (amalgame avec la race condition). En réalité la copie reste périmée pendant toute sa durée de vie.
   Correction : la lecture de Bob part après le passage de la base à 25 €, et non en même temps. Retirer « au même instant » du pitch et du dossier. Si le temps le permet, une seconde lecture de Bob, plus tard, revient encore avec 20 €.

## Mineur (simplifications acceptables)

- Réplique 2, « la base ne le prévient pas » : exact par défaut (cache-aside) ; des mécanismes de notification existent mais sont à construire.
- Réplique 2, « jusqu'à ce que la durée de vie expire » : la copie peut aussi disparaître plus tôt (éviction). Omission autorisée par le dossier.
- Réplique 4, « juste après » : entre l'écriture et l'effacement, une lecture peut encore servir 20 € (Microsoft, « Staleness after writes »).
- Chute, « là, elle suit » : une course reste possible (un lecteur rate le cache avant l'écriture, lit 20 €, le range après l'effacement ; Nishtala et al., « Scaling Memcache at Facebook », NSDI 2013, parlent de *stale sets* et de *leases*). « Suit » ne promet pas l'absence de valeur périmée : acceptable.
- Chute : la voix ne dit pas que la durée de vie reste en filet ; l'étiquette « 10 min » le montre.
- Colonne de droite : l'intituler « Cache (serveur) » plutôt que de la rattacher à Bob (le cache est partagé, côté serveur).

## À vérifier dans l'animation

- Le compte à rebours « 10 min » part du rangement de la copie, pas de l'écriture d'Alice.
- Solution : la base passe à 25 € avant que la copie soit barrée ; la lecture de Bob part après l'effacement.
- Solution : la nouvelle copie « 25 € » est rangée par la lecture de Bob, pas par l'écriture d'Alice (sinon, write-through).

## Vérifié sans réserve

- Idée fausse de l'élève, exemple du prix, mécanisme, ordre de la solution, « on efface » plutôt que « on met à jour ».
- Aucun piège du dossier : pas de « jamais périmé », pas de Karlton, pas d'ordre inversé, ni hit, ni miss, ni Redis à l'oral.
