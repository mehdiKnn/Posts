# Voix

## Choisir une voix

- Une voix native de la langue du script, avec un accent et une prosodie conçus pour le français. Lire la description de la voix en plus de son label de langue : l'accent décrit est celui qu'on entendra (« Atlanta », label `fr`, est décrite « accent d'Atlanta » et sonne anglaise).
- Pour une mascotte, la voix colle à son persona ; pour l'élève, elle est innocente et naïve.
- Le choix d'une voix revient à l'humain, à l'écoute : Claude prépare 2 ou 3 candidates sur la même phrase test, qui contient les termes anglais du métier (« race condition », « SQL »), et vérifie les mots par transcription. La voix retenue est celle que l'utilisateur a validée à l'écoute, et chaque retouche (timbre, ton, vitesse) se juge de la même façon.
- Si la bibliothèque n'a pas la voix du persona, la créer avec `elevenlabs text-to-voice`, en la décrivant comme une voix française avec l'accent voulu.
- Régler la vitesse à l'écoute, puis mesurer le débit (mots ÷ secondes) sur un clip généré comme en production : modèle v4, balises, vitesse retenue.
- Noter l'identifiant, la vitesse et le débit dans [charte.md](charte.md) : au champ « Voix de l'élève » ou au casting.

## Prononcer les anglicismes

- Les voix disent les termes anglais du métier comme un dev français : un anglais à l'accent français léger (« race condition » ≈ « rèïce condicheune »), et les sigles épelés à la française (API : « a-pé-i », SQL : « ès-cu-èl »).
- Le script garde l'orthographe réelle du terme, et c'est le lexique qui fixe sa prononciation : le texte à l'écran et les repères de synchro restent justes.
- Nouveau terme dans un script : le faire écouter avec chaque voix, dans sa prononciation par défaut et avec un ou deux alias (une graphie à prononcer). L'utilisateur choisit à l'oreille, et le choix est noté au lexique ci-dessous.
- Un terme qui a besoin d'un alias passe par un seul dictionnaire de prononciation ElevenLabs pour toutes les vidéos, en règles « alias » (`elevenlabs pronunciation-dictionaries`) ; les règles phonétiques (IPA) sont réservées à certains modèles anglais. Identifiant du dictionnaire : à créer au premier alias, puis à noter ici.

| Terme | Prononciation validée |
|---|---|
| race condition | par défaut, sans alias |

## Générer

- `python3 voix.py videos/<sujet>` (dans le dossier du projet) lit `dialogue.json`, une entrée par réplique (`qui`, `texte`). Il génère chaque réplique seule avec horodatage (modèle `eleven_v4`), l'accélère à la vitesse de sa voix, puis les met bout à bout avec 0,45 s de blanc. Il écrit `voix.mp3` et `voix-align.js` : le texte, l'horodatage par caractère, et les plages de chaque réplique (qui parle, et quand). Les identifiants et vitesses y sont recopiés de la charte, et les débits dans `verifier.mjs` : à mettre à jour avec elle.
- Vitesse : le modèle v4 n'a pas de réglage de vitesse, alors `voix.py` accélère l'audio après génération, à hauteur de voix inchangée (`atempo`), et divise l'horodatage d'autant. Chaque voix garde ainsi son facteur.
- Balises de jeu : elles vont dans le texte envoyé à la voix, et le texte affiché garde les mots seuls. Elles appuient le persona. Validées pour la taupe : `[warmly]` en ouverture de réplique, `[chuckles]` avant la chute. Les repères `cue()` cherchent les mots du script et restent justes, même si les balises figurent dans l'horodatage.
- Au premier alias du lexique, ajouter le dictionnaire aux appels de `voix.py` (`--pronunciation-dictionary-locators`), et vérifier si l'horodatage suit l'alias ou le texte du script : dans le premier cas, les repères `cue()` cherchent l'alias.
- La longueur du dialogue suit les bornes de [script.md](script.md).

## Vérifier

- L'utilisateur écoute avant qu'on anime : son oreille juge l'accent et le naturel.
- La transcription (`elevenlabs speech-to-text convert`) vérifie que les mots prononcés sont ceux du script.

## Lexique à valider

Les termes qui reviennent dans presque toutes les vidéos de la thématique backend. Aucun n'est validé à l'oreille : à chaque nouveau terme, le faire écouter par défaut et avec un alias, puis noter le choix dans le tableau « Prononcer les anglicismes ». Le dictionnaire ElevenLabs (règles « alias ») se crée au premier alias validé, avec `elevenlabs pronunciation-dictionaries` (vérifier la syntaxe de la commande dans l'aide de l'interface en ligne de commande avant de s'y fier).

| Terme | Alias à essayer | Statut |
|---|---|---|
| cache | « cache » (à la française) ou « cash » | à écouter |
| deadlock | « dèdelok » | à écouter |
| API | « a-pé-i » | à écouter |
| SQL | « ès-cu-èl » | à écouter |
| JWT | « jé-double-vé-té » | à écouter |
| thread | « threde » ou « sred » | à écouter |
| callback | « colbak » | à écouter |
| bug | « beug » | à écouter |
| backend / frontend | « bak-ennde » / « front-ennde » | à écouter |
| token | « tokène » | à écouter |
