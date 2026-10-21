#!/bin/sh
# Bruitages des gestes de l'animation (ElevenLabs), partagés par toutes les vidéos : sh sons/generer.sh, depuis le projet.
# Un fichier par geste qui fait avancer l'histoire (animation.md) ; render.mjs les mixe sous la voix.
cd "$(dirname "$0")"  # un appel à la fois : en parallèle, les rafraîchissements de session se gênent
son() {  # nom, durée, description
  elevenlabs text-to-sound-effects convert --duration-seconds "$2" --prompt-influence 0.6 -q -o "$1.mp3" \
    --text "$3. Close-up foley, dry, no reverb, no music, single sound."
}
son colle 0.5 "A sticker slapped firmly onto a paper notebook page: a short soft paper slap with a tiny peel"
son feutre 0.6 "A soft felt-tip marker gliding across paper in one stroke: a short, low, muffled rub, no squeak, no high pitch"
son claque 0.5 "A short playful cartoon snap, like a cardboard tab snapping into place"
son impact 0.7 "A punchy cartoon impact thump with a small cardboard crash, short"

# Le feutre généré crisse (presque toute son énergie au-dessus de 4 kHz) : ses aigus se coupent.
ffmpeg -y -loglevel error -i feutre.mp3 -af "lowpass=f=1800,lowpass=f=1800" grave.mp3 && mv grave.mp3 feutre.mp3

# Même niveau moyen pour tous (-26 dB), sans dépasser 0 dB en crête : render.mjs règle ensuite l'ensemble sous la voix.
for f in *.mp3; do
  gain=$(ffmpeg -hide_banner -i "$f" -af volumedetect -f null - 2>&1 | awk '/mean_volume/{m=$5} /max_volume/{p=$5} END{g=-26-m; if (p+g>0) g=-p; print g}')
  ffmpeg -y -loglevel error -i "$f" -af "volume=${gain}dB" "egal-$f" && mv "egal-$f" "$f"
done

# La voix off de la carte de fin, une par mascotte, générée par voix.py comme les répliques (sans égalisation : c'est une voix).
# « Like » et « abonne » y tombent à 0,40 et 1,12 s : carteDeFin() du gabarit s'y cale.
d=$(mktemp -d) && echo '{"repliques":[{"qui":"taupe","texte":"[warmly] Like, et abonne-toi !"}]}' > "$d/dialogue.json" \
  && python3 ../voix.py "$d" && cp "$d/voix.mp3" fin-taupe.mp3 && rm -r "$d"
