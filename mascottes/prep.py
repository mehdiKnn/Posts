#!/usr/bin/env python3
"""Prépare les poses d'une mascotte pour l'animation, à partir de sa planche de référence.

  python3 mascottes/prep.py cameleon      (mascottes/<nom>/ : planches → poses/ → sprites/)

1. Découpe chaque pose de DECOUPES dans sa planche, fond blanc retiré, retournée si besoin → poses/<pose>.png
2. Met les poses à la même échelle, pieds sur la même ligne → sprites/<pose>.png
"""
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from autocollants import charge, detoure  # le détourage commun aux mascottes et aux autocollants

# Les deux poses du gabarit, par mascotte : « neutre » quand l'élève parle, « pointe » quand la mascotte parle (bâton
# levé ; la bouche reste fermée, la mascotte saute sur les syllabes). Pose : (planche, boîte dans la planche, retourner).
# Un morceau de figure voisine pris dans une boîte touche son bord : il part au détourage.
DECOUPES = {
    "taupe": {
        "neutre": ("planche.png", (391, 66, 728, 590), True),  # trois-quarts avec le mug, retournée vers la droite
        "pointe": ("planche-baton.png", (1188, 73, 1531, 533), False),
    },
    "cameleon": {
        "neutre": ("planche.png", (399, 164, 736, 770), False),  # trois-quarts avec le matcha
        "pointe": ("planche.png", (1140, 160, 1531, 775), False),
    },
}


def mesures(a):
    """Haut de la tête, bas des pieds, centre du corps (les traits fins comme la baguette sont ignorés)."""
    larg = (a[..., 3] > 200).sum(1)
    lignes = np.nonzero(larg > 70)[0]
    haut, bas = lignes[0], lignes[-1]
    h = bas - haut
    bande = a[int(haut + 0.74 * h):int(haut + 0.80 * h), :, 3] > 200
    return haut, bas, np.median(np.nonzero(bande)[1])


def decouper(decoupes):
    Path("poses").mkdir(exist_ok=True)
    for pose, (planche, (x0, y0, x1, y1), retourner) in decoupes.items():
        a = detoure(charge(planche)[y0 - 10:y1 + 10, x0 - 10:x1 + 10].copy())
        im = Image.fromarray(a.astype("uint8"))
        if retourner:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        im.save(f"poses/{pose}.png")


def sprites(decoupes):
    """Même échelle et pieds sur la même ligne pour toutes les poses, sur une toile commune."""
    ref = mesures(charge("poses/neutre.png"))
    hauteur = ref[1] - ref[0]
    W, H = 2 * hauteur, round(1.3 * hauteur)
    pieds, cx0 = round(1.22 * hauteur), round(0.4 * W)
    Path("sprites").mkdir(exist_ok=True)
    for pose in decoupes:
        a = charge(f"poses/{pose}.png")
        haut, bas, cx = mesures(a)
        k = hauteur / (bas - haut)
        im = Image.fromarray(a.astype("uint8"))
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        toile = Image.new("RGBA", (W, H))
        toile.alpha_composite(im, (round(cx0 - cx * k), round(pieds - bas * k)))
        toile.save(f"sprites/{pose}.png")


if __name__ == "__main__":
    nom = sys.argv[1]
    os.chdir(Path(__file__).parent / nom)
    decouper(DECOUPES[nom])
    sprites(DECOUPES[nom])
    print(f"{nom} :", ", ".join(sorted(p.stem for p in Path("sprites").glob("*.png"))))
