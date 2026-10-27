# Charte

Une seule charte pour toutes les vidéos : la source de vérité des choix visuels et des voix. Les champs « à définir » se fixent avec l'utilisateur, à l'étape 1.

- **Univers** : scolaire, une feuille à petits carreaux qui remplit seule tout l'écran. Maquette validée, qui sert de référence : `charte/univers.png`. La mascotte et les objets du schéma y sont collés comme des autocollants : contour blanc épais et ombre douce ([visuels.md](visuels.md)).
- **Mascottes** : en 2D, une par thématique (concurrence, bases de données, sécurité…). Chacune a un persona distinct, renforcé par des stéréotypes assumés et une personnalité unique (par exemple, pour les bases de données, un archiviste maniaque qui range tout). Elle tient une baguette quand elle parle.
- **Style des mascottes** : la référence d'ambiance est l'animation 2D de Laink et Terracid (Wankil Studio). Traits recherchés : trait épais un peu brut, aplats de couleurs franches, expressions exagérées, ton décalé. Validé sur la planche de la taupe (`mascottes/taupe/planche.png`), qui sert de référence de style pour toute nouvelle mascotte.
- **Couleurs** (palette « Feutres », les couleurs des feutres de l'école) :

  | Rôle | Couleur |
  |---|---|
  | Feuille | `#FBFBF8` |
  | Quadrillage : carreaux de 54 px, 20 sur la largeur | `#A9C7E8` |
  | Encre : texte et contours | `#1C1C21` |
  | Principal | `#2356D8` (bleu) |
  | Ce qui casse | `#E2372C` (rouge) |
  | Ce qui marche | `#1E9C57` (vert) |
  | Contour des autocollants | `#FFFFFF` (blanc) |

- **Polices** : Handlee pour ce qui est écrit sur la feuille, JetBrains Mono pour le code (Google Fonts toutes les deux). Handlee n'a qu'une graisse : la hiérarchie passe par la taille et la couleur.
- **Voix de l'élève** : `3nT3AnggTZEbUmlaPicL` (« Élève », créée par Voice Design). Hors champ, innocente et naïve, la même dans toutes les vidéos. Vitesse : x1,0 ; débit : 3,3 mots/s. Échantillon (v4) : `charte/voix-eleve/echantillon.mp3`.
- **Voix des mascottes** : une par mascotte, assortie à son persona, notée au casting.

## Casting

Une ligne par mascotte créée ; on la réutilise à chaque vidéo de sa thématique. Chaque mascotte a ses propres réglages, sans rien de commun avec les autres ; sa clé (`taupe`, `cameleon`) les relie dans le code : `MASCOTTE` du gabarit, `voix.py`, `verifier.mjs`, `mascottes/prep.py`, `sons/fin-<clé>.mp3`.

| Thématique | Mascotte (clé) | Persona | Voix | Planche |
|---|---|---|---|---|
| Backend (concurrence, API, serveurs) | La taupe, sans nom pour l'instant (`taupe`) | Vieil ingénieur backend qui vit sous terre, comme le backend, invisible des utilisateurs. Myope (grosses lunettes rondes), cernes ; sweat gris, casque autour du cou, badge, mug XXL, chaussettes dans des claquettes. Papi chaleureux et bienveillant, conteur à la Père Castor : il raconte chaque concept comme une histoire ; vit dans le terminal. | `JU5Y5gbUK29NVNaEewvw` (« Taupe papi », créée par Voice Design : grand-père parisien de 70 ans, conteur à la Père Castor). Vitesse : x1,0 ; débit : 2,3 mots/s, mesuré en production (vidéo RACI). Balises : `[warmly]`, `[chuckles]`. Échantillon (v4, balises) : `mascottes/taupe/voix/echantillon.mp3`. Voix de fin : `sons/fin-taupe.mp3` | `mascottes/taupe/planche.png` (projet SeamUI « mascottes ») |
| Frontend (JavaScript, CSS, navigateur, accessibilité et HTML) | Le caméléon, sans nom pour l'instant (`cameleon`) | Dev front d'une trentaine d'années, branché, un peu hipster : comme le front, il change de couleur et s'adapte à chaque écran. Bonnet moutarde sur un chignon, grosses lunettes noires, moustache en guidon, flanelle sur t-shirt blanc, jean retroussé, sneakers blanches, tote bag `</>`, matcha latte glacé. Enthousiaste et énergique, un peu snob, maniaque du pixel : il a testé tous les frameworks avant tout le monde, et parle avec les mains. | `lxxgkTXQMN7g00AHMeTC` (« Caméléon front », créée par Voice Design : trentenaire parisien à la voix aiguë, un peu nasale et chantante, qui traîne les fins de phrase). Vitesse : x1,0 ; débit : 2,6 mots/s, mesuré sur un clip v4 avec balises, à recaler sur sa première vidéo. Balises : `[excited]`, `[laughs]`. Échantillon (v4, balises) : `mascottes/cameleon/voix/echantillon.mp3`. Voix de fin : `sons/fin-cameleon.mp3` | `mascottes/cameleon/planche.png` (projet SeamUI « mascottes ») |
