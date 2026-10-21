#!/usr/bin/env python3
"""Découpe la planche d'autocollants d'une vidéo en une image par objet, fond blanc retiré.

  python3 autocollants.py videos/race-condition telephone billet cadenas-ouvert cadenas-ferme

Lit videos/<sujet>/autocollants/planche.png, y trouve les objets (séparés par du blanc, de gauche à droite, puis de haut
en bas), et écrit autocollants/<nom>.png pour chacun, dans l'ordre des noms. Les états d'un même objet portent le même
préfixe avant le dernier tiret (cadenas-ouvert, cadenas-ferme) : ils partagent un cadre, calés sur leur base, pour se
remplacer sans bouger. Le contour blanc et l'ombre ne sont pas dans l'image : le filtre #autocollant du gabarit les pose.

Le détourage sert aussi aux poses des mascottes (mascottes/<nom>/prep.py).
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

MARGE = 10  # px de blanc gardés autour de chaque objet avant le détourage
ECART = 12  # px de blanc au moins entre deux objets de la planche


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


def detoure(a):
    """Rend transparent le fond d'une découpe : le blanc relié à son bord (les blancs intérieurs, cernés de noir, restent)."""
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
    return a


def bandes(profil):
    """Intervalles non vides d'un profil, séparés par ECART px vides au moins."""
    i = np.nonzero(profil)[0]
    if not len(i):
        return []
    coupes = np.nonzero(np.diff(i) > ECART)[0]
    return list(zip(np.r_[i[0], i[coupes + 1]], np.r_[i[coupes], i[-1]] + 1))


def cadres(encre, x0=0, y0=0):
    """Un cadre par objet : la planche se coupe le long des bandes blanches, en colonnes puis en lignes."""
    cols, lignes = bandes(encre.any(0)), bandes(encre.any(1))
    if len(cols) == 1 and len(lignes) == 1:
        (a, b), (c, d) = cols[0], lignes[0]
        return [(x0 + a, y0 + c, x0 + b, y0 + d)]
    if len(cols) > 1:
        return [r for a, b in cols for r in cadres(encre[:, a:b], x0 + a, y0)]
    return [r for c, d in lignes for r in cadres(encre[c:d], x0, y0 + c)]


def serre(a):
    ys, xs = np.nonzero(a[..., 3] > 0)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def cale(etats):
    """Les états d'un objet sur un même cadre : même bas, centrés sur leur base (le tiers du bas de la figure)."""
    H, W = sum(a.shape[0] for a in etats), sum(a.shape[1] for a in etats)
    toiles = []
    for a in etats:
        ys, xs = np.nonzero(a[..., 3] > 0)
        bas, base = ys.max(), xs[ys > ys.max() - (ys.max() - ys.min()) / 3].mean()
        t = np.zeros((2 * H, 2 * W, 4), int)
        dy, dx = H - bas, W - round(base)
        t[dy:dy + a.shape[0], dx:dx + a.shape[1]] = a
        toiles.append(t)
    ys, xs = np.nonzero(np.maximum.reduce([t[..., 3] for t in toiles]) > 0)
    return [t[ys.min():ys.max() + 1, xs.min():xs.max() + 1] for t in toiles]


def main(dossier, noms):
    P = charge(f"{dossier}/autocollants/planche.png")
    h, w = P.shape[:2]
    encre = P[..., :3].min(-1) <= 235
    boites = [b for b in cadres(encre) if encre[b[1]:b[3], b[0]:b[2]].sum() > 500]  # les poussières ne comptent pas
    if len(boites) != len(noms):
        sys.exit(f"{len(boites)} objets sur la planche, {len(noms)} noms donnés : {noms}")
    images = {}
    for nom, (x0, y0, x1, y1) in zip(noms, boites):
        a = P[max(0, y0 - MARGE):min(h, y1 + MARGE), max(0, x0 - MARGE):min(w, x1 + MARGE)].copy()
        images[nom] = serre(detoure(a))
    familles = {}
    for nom in noms:
        familles.setdefault(nom.rsplit("-", 1)[0] if "-" in nom else nom, []).append(nom)
    for membres in familles.values():
        if len(membres) > 1:
            for nom, a in zip(membres, cale([images[n] for n in membres])):
                images[nom] = a
    for nom in noms:
        Image.fromarray(images[nom].astype("uint8")).save(f"{dossier}/autocollants/{nom}.png")
        print(f"{nom}.png : {images[nom].shape[1]} × {images[nom].shape[0]}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
