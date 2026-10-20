#!/usr/bin/env python3
"""Prépare les poses d'une mascotte pour l'animation, à partir de sa planche de référence.

  python3 prep.py      (depuis le dossier de la mascotte : planches → poses/ → sprites/)

1. Découpe chaque pose de DECOUPES dans sa planche, fond blanc retiré, retournée si besoin → poses/<pose>.png
2. Colle le visage bouche ouverte sur la pose bouche fermée → poses/pointe-ouverte.png
3. Met toutes les poses à la même échelle, pieds sur la même ligne → sprites/
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Pose : (planche, boîte dans la planche, retourner). « parle » quand la mascotte parle, « neutre » quand l'élève parle.
DECOUPES = {
    "neutre": ("planche.png", (391, 66, 728, 590), True),     # trois-quarts avec le mug, bouche fermée, tournée vers la droite
    "pointe": ("planche.png", (1061, 46, 1521, 581), False),  # baguette levée, bouche ouverte
    # Le même bâton levé, bouche ouverte et bouche fermée, à alterner quand la mascotte parle.
    "pointe-ouverte": ("planche-baton.png", (934, 89, 1260, 533), False),
    "pointe-fermee": ("planche-baton.png", (1188, 73, 1531, 533), False),
}


def charge(f):
    return np.array(Image.open(f).convert("RGBA")).astype(int)


def relie(masque, graines):
    """Pixels de `masque` reliés à une graine."""
    h, w = masque.shape
    vu = graines & masque
    file = deque(zip(*np.nonzero(vu)))
    while file:
        cy, cx = file.popleft()
        for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
            if 0 <= ny < h and 0 <= nx < w and masque[ny, nx] and not vu[ny, nx]:
                vu[ny, nx] = True
                file.append((ny, nx))
    return vu


def mesures(a):
    """Haut de la tête, bas des pieds, centre du corps (les traits fins comme la baguette sont ignorés)."""
    larg = (a[..., 3] > 200).sum(1)
    lignes = np.nonzero(larg > 70)[0]
    haut, bas = lignes[0], lignes[-1]
    h = bas - haut
    bande = a[int(haut + 0.74 * h):int(haut + 0.80 * h), :, 3] > 200
    return haut, bas, np.median(np.nonzero(bande)[1])


def decouper():
    Path("poses").mkdir(exist_ok=True)
    for pose, (planche, (x0, y0, x1, y1), retourner) in DECOUPES.items():
        a = charge(planche)[y0 - 10:y1 + 10, x0 - 10:x1 + 10].copy()
        # Fond : le blanc relié au bord de la découpe (les blancs intérieurs, cernés de noir, restent).
        blanc = a[..., :3].min(-1) > 235
        bord = np.zeros_like(blanc)
        bord[0, :] = bord[-1, :] = bord[:, 0] = bord[:, -1] = True
        fond = relie(blanc, bord)
        # Un morceau de figure voisine pris dans la boîte touche le bord de la découpe : il part avec le fond.
        fond |= relie(~fond, bord)
        a[..., 3][fond] = 0
        # Contour adouci : les pixels clairs au bord du fond deviennent semi-transparents.
        lum = a[..., :3].mean(-1)
        voisin = np.array(Image.fromarray((fond * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0
        frange = voisin & ~fond & (lum > 180)
        a[..., 3][frange] = np.clip((255 - lum[frange]) * 255 / 75, 0, 255)
        im = Image.fromarray(a.astype("uint8"))
        if retourner:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        im.save(f"poses/{pose}.png")


def bouche():
    """Pose « pointe-ouverte » : la pose bouche fermée, avec le visage de la bouche ouverte collé dessus.

    Les deux dessins de la planche ne coïncident pas (tête plus à droite, cheveux, épaules) : en les alternant,
    tout bougerait. On garde le corps, le casque et les cheveux de la bouche fermée, et on ne remplace que le visage,
    le long d'une couture fermée qui passe là où les deux images se ressemblent.
    """
    F, O = charge("poses/pointe-fermee.png"), charge("poses/pointe-ouverte.png")
    h, w = F.shape[:2]

    # Tête ouverte calée sur la tête fermée : silhouette du crâne, au-dessus du casque.
    def iou(dx, dy):
        a, b = F[40:150, 50:210, 3] > 128, O[40 - dy:150 - dy, 50 - dx:210 - dx, 3] > 128
        return (a & b).sum() / (a | b).sum()
    dx, dy = max(((dx, dy) for dx in range(-30, 5) for dy in range(35)), key=lambda d: iou(*d))
    toile = Image.new("RGBA", (w, h))
    toile.paste(Image.fromarray(O.astype("uint8")), (dx, dy))
    O = np.array(toile).astype(int)

    sur_blanc = lambda a: a[..., :3] * a[..., 3:] / 255 + 255 * (1 - a[..., 3:] / 255)
    BF, BO = sur_blanc(F), sur_blanc(O)
    diff = np.abs(BF - BO).max(-1)
    diff = np.array(Image.fromarray(diff.astype("uint8")).filter(ImageFilter.MaxFilter(3)))  # frôler un trait coûte aussi
    # La couture reste sous les cheveux, à gauche de la main et du bâton, au-dessus de la poitrine.
    zone = Image.new("L", (w, h))
    ImageDraw.Draw(zone).polygon([(10, 78), (236, 78), (236, 110), (216, 135), (216, 260), (10, 260)], fill=255)
    cout = np.where(np.array(zone) > 0, diff + 2.0, 1e6)  # +2 : à différence égale, le contour le plus court

    # Coût en coordonnées polaires autour de la tête : C[angle, rayon].
    cx, cy, N = 138, 138, 720
    ang = np.linspace(0, 2 * np.pi, N, endpoint=False)
    rad = np.arange(25, 200)
    X = np.round(cx + np.cos(ang)[:, None] * rad).astype(int)
    Y = np.round(cy + np.sin(ang)[:, None] * rad).astype(int)
    dedans = (X >= 0) & (X < w) & (Y >= 0) & (Y < h)
    C = np.where(dedans, cout[Y.clip(0, h - 1), X.clip(0, w - 1)], 1e6)

    def contour(r0):
        """Contour le moins coûteux qui part du rayon r0 et y revient, le rayon variant de 2 px au plus par pas."""
        n = len(rad)
        acc = np.full(n, np.inf)
        acc[r0] = C[0, r0]
        retour = np.zeros((N, n), int)
        for i in range(1, N):
            m, arg = np.full(n, np.inf), np.zeros(n, int)
            for k in range(-2, 3):
                dec = np.roll(acc, k)
                if k > 0:
                    dec[:k] = np.inf
                if k < 0:
                    dec[k:] = np.inf
                mieux = dec < m
                m[mieux], arg[mieux] = dec[mieux], (np.arange(n) - k)[mieux]
            acc, retour[i] = m + C[i], arg
        j = min(range(max(0, r0 - 2), min(n, r0 + 3)), key=lambda j: acc[j])
        total, chemin = acc[j], [j]
        for i in range(N - 1, 0, -1):
            j = retour[i, j]
            chemin.append(j)
        return total, rad[chemin[::-1]]

    _, rayons = min((contour(r0) for r0 in range(0, len(rad), 3)), key=lambda t: t[0])
    masque = Image.new("L", (w, h))
    ImageDraw.Draw(masque).polygon([(cx + np.cos(a) * r, cy + np.sin(a) * r) for a, r in zip(ang, rayons)], fill=255)
    M = np.array(masque.filter(ImageFilter.GaussianBlur(1.5)))[..., None] / 255
    a = O * M + F * (1 - M)
    # Là où les deux images sont claires (fond, liseré du contour), on garde la fermée : pas de points gris.
    clair = (BF.mean(-1) > 190) & (BO.mean(-1) > 190)
    a[clair] = F[clair]
    Image.fromarray(a.astype("uint8")).save("poses/pointe-ouverte.png")


def sprites():
    """Même échelle et pieds sur la même ligne pour toutes les poses, sur une toile commune."""
    ref = mesures(charge("poses/neutre.png"))
    hauteur = ref[1] - ref[0]
    W, H = 2 * hauteur, round(1.3 * hauteur)
    pieds, cx0 = round(1.22 * hauteur), round(0.4 * W)
    Path("sprites").mkdir(exist_ok=True)
    for pose in DECOUPES:
        a = charge(f"poses/{pose}.png")
        # La bouche ouverte se place exactement comme la fermée : seul le visage diffère.
        haut, bas, cx = mesures(charge("poses/pointe-fermee.png") if pose == "pointe-ouverte" else a)
        k = hauteur / (bas - haut)
        im = Image.fromarray(a.astype("uint8"))
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        toile = Image.new("RGBA", (W, H))
        toile.alpha_composite(im, (round(cx0 - cx * k), round(pieds - bas * k)))
        toile.save(f"sprites/{pose}.png")


if __name__ == "__main__":
    decouper()
    bouche()
    sprites()
    print("sprites :", ", ".join(sorted(p.stem for p in Path("sprites").glob("*.png"))))
