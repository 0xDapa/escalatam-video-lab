#!/usr/bin/env bash
# Render every Remotion reel silent (picture only), then the soundtrack is muxed by tools/finish.sh
set -e
cd "$(dirname "$0")/../reels"
OUT=/workspace/escalatam/videos/renders/parts
for id in ${@:-BrasaReel EscalatamReel LuaReel MiradorReel BravaReel}; do
  npx remotion render $id $OUT/${id}_silent.mp4 --codec=h264 --crf=16 --concurrency=4 --log=error
  echo "rendered $id"
done
