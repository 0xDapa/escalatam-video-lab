#!/usr/bin/env bash
# finish.sh <silent.mp4> <timing.json> <film|reel> <mood> <out.mp4>
# soundtrack from the same timing file -> two-pass loudnorm (-14 LUFS, -2 dBTP) -> H.264 High yuv420p + AAC, faststart.
# Loudness is checked again on the FINAL file by motion_qa.py (AAC raises the peak).
set -e
SIL=$1; TJ=$2; KIND=$3; MOOD=$4; OUT=$5
D="$(cd "$(dirname "$0")/.." && pwd)"
WAV=/tmp/$(basename "$OUT" .mp4).wav
python3 "$D/audio/synth.py" $KIND "$TJ" "$WAV" $MOOD
M=$(ffmpeg -hide_banner -i "$WAV" -af loudnorm=I=-14:TP=-3.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=-14:TP=-3.2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -v error -y -i "$SIL" -i "$WAV" -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -profile:v high -preset slow -crf 19 -maxrate 14M -bufsize 28M -vf "scale=out_range=tv,format=yuv420p" -color_range tv -r 30 \
  -af "$AF" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo "finished $OUT"
