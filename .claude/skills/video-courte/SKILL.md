---
name: video-courte
description: Graphe de production et règles d'une vidéo courte verticale qui vulgarise un concept (Reel Instagram, YouTube Short, TikTok). À utiliser pour lancer ou reprendre une vidéo, écrire son script ou sa voix off, faire son storyboard, créer une mascotte, générer ses visuels, l'animer ou l'exporter.
---

# Vidéo courte explicative

Une vidéo = **une idée, racontée une fois, montrée en images**. Chaque règle des guides en découle ; en cas de doute, tranche avec cette phrase. La recherche qui les fonde : [sources.md](sources.md).

## Le graphe de production

La session principale orchestre ; un agent (`.claude/agents/`) produit le livrable de chaque nœud ; l'utilisateur valide chaque nœud avant le suivant.

```
sujet → script ⇄ → storyboard ⇄ → autocollants ⇄ → voix ⇄ → animation ⇄ → rendu final ⇄ → publié
        scenariste  storyboarder  illustrateur      voix.py   animateur     monteur
```

- **Un nœud** : lancer son agent avec le dossier `videos/<sujet>/` et les retours en cours, montrer à l'utilisateur ce qu'il rend (le fichier, la planche à ouvrir, la vidéo), puis attendre sa réponse. Validé : nœud suivant. Retour : renvoyé au même agent par SendMessage, qui garde ainsi son contexte, jusqu'à validation.
- **Un retour sur un nœud amont** (une réplique à changer pendant l'animation) repart de ce nœud ; chaque nœud en aval se rejoue ensuite et se revalide, dans l'ordre script, storyboard, autocollants, voix, animation, rendu final.
- **Le suivi** : `videos/<sujet>/etapes.md`, créé au lancement, avec une case par nœud, cochée à la validation, et les retours reçus en une ligne chacun. Une session qui reprend une vidéo lit ce fichier en premier.
- **La session principale** garde la charte et la voix, et ne lance l'illustrateur qu'après avoir annoncé le coût de la planche : ces nœuds facturent ou demandent l'écoute de l'utilisateur.
- Du moins cher au plus cher : une génération payante (voix complète, images, vidéo) attend la validation du nœud précédent. Un blocage s'annonce à l'utilisateur dès le deuxième essai raté, avec des options.

## Le mode AFK

L'utilisateur donne le sujet ; le workflow `video-courte-afk` (`.claude/workflows/`) produit la vidéo sans lui, sauf la validation de la planche d'autocollants : à chaque nœud, un agent critique vérifie le livrable contre les règles du skill, chiffres de `verifier.mjs` à l'appui, et renvoie ses retours bloquants au producteur, jusqu'à 2 révisions, puis le nœud suivant démarre. Les retours mineurs, invisibles à l'écran, ne relancent rien : ils vont dans `etapes.md`.

- Il s'arrête une fois, après le storyboard : l'utilisateur valide la planche d'autocollants, qui fixe le style à l'écran.
  - Lancement : `Workflow({name: 'video-courte-afk', args: {sujet: 'Le deadlock', slug: 'deadlock'}})`. Il rend la planche à montrer (`videos/<sujet>/autocollants/planche.png`).
  - Un retour sur la planche : le même appel avec `planche: '<le retour>'`, qui ne refait que la planche.
  - La planche validée : le même appel avec `planche: 'validee'`, qui reprend à la voix et va jusqu'à la vidéo.
- Il s'applique à une thématique dont la mascotte et les voix existent. Ses dépenses : la planche (une image GPT Image, environ 0,20 $) et la voix ElevenLabs.
- En fin de course, `videos/<sujet>/etapes.md` liste les nœuds validés par critique, les retours encore ouverts, les retours mineurs et ce que l'utilisateur vérifie lui-même : l'écoute de la voix sur la vidéo et les anglicismes nouveaux. Ses retours reprennent ensuite dans le graphe interactif, au nœud concerné.

## Étapes

1. **Charte et mascotte** — session principale, une fois par thématique. Guides : [charte.md](charte.md), [visuels.md](visuels.md) (La mascotte), [voix.md](voix.md) (Choisir une voix). Fixer avec l'utilisateur chaque champ « à définir » dont cette vidéo a besoin ; une thématique nouvelle reçoit sa mascotte, ajoutée au casting. Terminé quand plus rien n'est « à définir » pour cette vidéo et que la mascotte de la thématique est au casting.
2. **Script** — agent `scenariste`. Le pitch d'abord, puis le dialogue : `script.md`, `dialogue.json`. Terminé quand l'utilisateur valide le dialogue.
3. **Storyboard** — agent `storyboarder` : `storyboard.md`. Terminé quand la [checklist](#checklist) passe sur le papier et que l'utilisateur valide.
4. **Autocollants** — agent `illustrateur`, une fois le coût annoncé (une image GPT Image, environ 0,20 $) : `autocollants/planche.png`, puis une image par objet. Guide : [visuels.md](visuels.md) (Les autocollants du schéma). Terminé quand l'utilisateur valide la planche.
5. **Voix** — session principale. Guide : [voix.md](voix.md) (Prononcer les anglicismes, Générer, Vérifier) : les anglicismes nouveaux à faire écouter, puis `python3 voix.py videos/<sujet>`. Terminé quand l'utilisateur valide à l'écoute.
6. **Animation** — agent `animateur` : `index.html`, `captures.png`, `sequences/`. Terminé quand l'utilisateur valide les captures et les séquences.
7. **Rendu final** — agent `monteur` : `video.mp4`, `controle.png`. Terminé quand la checklist passe sur les images extraites et que l'utilisateur valide la vidéo.

## Checklist

À passer sur le storyboard (étape 3), puis sur les images de la vidéo finale (étape 7) :

- [ ] Durée et nombre de mots dans les bornes de [script.md](script.md)
- [ ] Ouvre en 3 s au plus sur l'idée fausse de l'élève, que la mascotte réfute ; la mascotte de la thématique est sur la feuille
- [ ] Chaque beat apporte une info nouvelle ; chaque chose est racontée une seule fois
- [ ] Le mécanisme tient en un moment clé, avec un seul dispositif, réutilisé pour la solution
- [ ] L'image suit la voix : chaque action dite se voit en mouvement, sur son mot, puis s'efface ; pas de schéma figé pendant une explication
- [ ] Un seul mouvement à la fois (sauf la collision), assez lent pour être vu ; seul bouge ce qui sert le concept
- [ ] Un seul exemple ; chaque phrase sert le concept ou cet exemple
- [ ] Code simpliste, 4 lignes au plus
- [ ] À l'écran, seulement le texte nécessaire (le sujet, les valeurs du schéma, le code) ; il reste immobile tant qu'il est à l'écran
- [ ] Les objets du schéma sont les autocollants de la planche validée ; ce qui relie ou change se trace au feutre, sans toucher un autocollant
- [ ] Les sous-titres suivent la voix, deux lignes au plus, sans toucher le schéma ni la mascotte
- [ ] Le schéma remplit sa zone ; tout tient dans les zones sûres ([animation.md](animation.md))
- [ ] Chaque texte est net à chaque image
- [ ] Univers, couleurs et mascotte conformes à la charte
- [ ] La vidéo finit sur la carte de fin commune (« Like », « Abonne-toi », dits par la mascotte)
- [ ] Voix natives, validées à l'écoute
