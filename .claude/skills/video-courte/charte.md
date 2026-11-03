# Charte

Une seule charte pour toutes les vidéos : la source de vérité des choix visuels et des voix. Les champs « à définir » se fixent avec l'utilisateur, à l'étape 1. La direction artistique (univers, couleurs, polices, trait) est celle de Manar Studio : [da-manar.md](da-manar.md).

- **Univers** : la DA Manar Studio, un papier à pois qui remplit tout l'écran ([da-manar.md](da-manar.md)). Référence construite : `videos/cache/index.html`.
- **Mascottes** : en 2D, une par thématique (concurrence, bases de données, sécurité…). Chacune a un persona distinct, renforcé par des stéréotypes assumés et une personnalité unique (par exemple, pour les bases de données, un archiviste maniaque qui range tout). Elle tient une baguette quand elle parle.
- **Style des mascottes** : la référence d'ambiance est l'animation 2D de Laink et Terracid (Wankil Studio). Traits recherchés : trait épais un peu brut, aplats de couleurs franches, expressions exagérées, ton décalé. Validé sur la planche de la taupe (`mascottes/taupe/planche.png`), qui sert de référence de style pour toute nouvelle mascotte.
- **Couleurs** : les jetons Manar et leurs rôles (encre, action, erreur, réussite, lumière) sont dans [da-manar.md](da-manar.md) et `lib/manar.css`.
- **Polices** : Bricolage Grotesque (titres), DM Sans (texte, schéma, sous-titres), Caveat (annotations), JetBrains Mono pour le code (Google Fonts). Détail dans [da-manar.md](da-manar.md).
- **Voix de l'élève** : `3nT3AnggTZEbUmlaPicL` (« Élève », créée par Voice Design). Hors champ, innocente et naïve, la même dans toutes les vidéos. Vitesse : x1,0 ; débit : 3,3 mots/s. Échantillon (v4) : `charte/voix-eleve/echantillon.mp3`.
- **Voix des mascottes** : une par mascotte, assortie à son persona, notée au casting.

## Casting

Une ligne par mascotte créée ; on la réutilise à chaque vidéo de sa thématique.

| Thématique | Mascotte | Persona | Voix (id) | Planche |
|---|---|---|---|---|
| Backend (concurrence, API, serveurs) | La taupe (sans nom pour l'instant) | Vieil ingénieur backend qui vit sous terre, comme le backend, invisible des utilisateurs. Myope (grosses lunettes rondes), cernes ; sweat gris, casque autour du cou, badge, mug XXL, chaussettes dans des claquettes. Papi chaleureux et bienveillant, conteur à la Père Castor : il raconte chaque concept comme une histoire ; vit dans le terminal. | `JU5Y5gbUK29NVNaEewvw` (« Taupe papi », créée par Voice Design : grand-père parisien de 70 ans, conteur à la Père Castor). Vitesse : x1,0 ; débit : 2,3 mots/s, mesuré en production (vidéo RACI). Échantillon (v4, balises) : `mascottes/taupe/voix/echantillon.mp3` | `mascottes/taupe/planche.png` (projet SeamUI « mascottes ») |
