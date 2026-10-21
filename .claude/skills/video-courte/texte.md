# Texte à l'écran

S'applique au storyboard (quel texte apparaît) et à l'animation (comment il apparaît).

- Le message passe par la voix et l'animation ; le texte se limite à ce que le spectateur doit lire : le sujet écrit sur la feuille, les valeurs que porte le schéma (un montant, une lettre), le code. Pas de mot-clé de conclusion : la règle se dit à la voix et se voit dans le schéma.
- Le texte se pose sobrement : une seule entrée (fondu, ou écrit sur la feuille), puis il reste immobile tant qu'il doit être lu. Le mouvement vient de la mascotte et du schéma.
- Le texte est net à chaque image ; les effets s'appliquent aux objets du schéma.
- 48 px au moins en 1080×1920, contraste fort, dans les zones sûres définies dans [animation.md](animation.md).

## Sous-titres

La voix est sous-titrée, incrustée dans l'image : beaucoup regardent sans le son, et c'est la seule façon de suivre pour qui n'entend pas. C'est un choix assumé contre le principe de redondance ([sources](sources.md)) : les sous-titres restent à l'écart du schéma, qui porte l'explication, et ne remplacent aucun texte de la feuille.

- Le gabarit les construit seul depuis `voix-align.js`, balises de jeu retirées : rien à prévoir au storyboard, rien à écrire à l'animation.
- Phrase par phrase, deux lignes au plus : une phrase de plus de 33 signes se coupe en deux, après une virgule si possible, sinon au milieu. Chaque morceau s'affiche de son premier mot au suivant, change d'un coup, sans animation, et s'éteint entre deux répliques.
- Handlee 76 px, couleur feuille sur une bande encre : on ne les confond pas avec ce qui est écrit sur la feuille. Leur place : [animation.md](animation.md).
