#!/usr/bin/env python3
"""Génère le dialogue d'une vidéo : <dossier>/dialogue.json → <dossier>/voix.mp3 + <dossier>/voix-align.js

Chaque réplique est générée seule (ElevenLabs v4, horodatage par caractère), accélérée à la vitesse
de sa voix, puis les répliques sont mises bout à bout avec un blanc entre elles.
Usage : python3 voix.py videos/race-condition
"""
import base64
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

# Valeurs de la charte (.claude/skills/video-courte/charte.md) : identifiant ElevenLabs, vitesse.
VOIX = {"taupe": ("JU5Y5gbUK29NVNaEewvw", 1.0), "eleve": ("3nT3AnggTZEbUmlaPicL", 1.0)}
BLANC = 0.45  # secondes de silence entre deux répliques
RATE = 44100


def run(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def replique(texte, voix_id, vitesse, tmp, i):
    d = json.loads(run("elevenlabs", "text-to-speech", "convert_with_timestamps", "--voice-id", voix_id,
                       "--model-id", "eleven_v4", "--language-code", "fr", "--output-format", "mp3_44100_128",
                       "--text", texte, "--format", "json", "--no-extract"))
    mp3, wav = tmp / f"{i}.mp3", tmp / f"{i}.wav"
    mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    run("ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-filter:a", f"atempo={vitesse}",
        "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", "-fflags", "+bitexact", "-flags:a", "+bitexact", str(wav))
    with wave.open(str(wav)) as w:
        pcm = w.readframes(w.getnframes())
    a = d["alignment"]
    return pcm, a["characters"], [t / vitesse for t in a["character_start_times_seconds"]]


def main(dossier):
    dossier = Path(dossier)
    repliques = json.loads((dossier / "dialogue.json").read_text())["repliques"]
    pcm, text, t, segments = b"", [], [], []
    with tempfile.TemporaryDirectory() as tmp:
        for i, r in enumerate(repliques):
            voix_id, vitesse = VOIX[r["qui"]]
            if i:
                pcm += b"\0\0" * int(BLANC * RATE)
            debut = len(pcm) / 2 / RATE
            son, chars, starts = replique(r["texte"], voix_id, vitesse, Path(tmp), i)
            if text:
                text.append(" ")
                t.append(debut)
            de = len(text)
            text += chars
            t += [debut + s for s in starts]
            pcm += son
            fin = len(pcm) / 2 / RATE
            segments.append({"qui": r["qui"], "debut": round(debut, 3), "fin": round(fin, 3), "de": de, "a": len(text)})
            print(f"{i + 1}. {r['qui']:5} {debut:6.2f} → {fin:6.2f} s")
        wav = Path(tmp) / "voix.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(RATE)
            w.writeframes(pcm)
        run("ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(dossier / "voix.mp3"))
    fin = len(pcm) / 2 / RATE
    align = {"text": "".join(text), "t": [round(x, 3) for x in t], "end": round(fin, 3), "repliques": segments}
    (dossier / "voix-align.js").write_text("window.ALIGN = " + json.dumps(align, ensure_ascii=False))
    print(f"total : {fin:.2f} s, {len(''.join(r['texte'] for r in repliques).split())} mots (balises comprises)")


if __name__ == "__main__":
    main(sys.argv[1])
