"""finish.py <silent.mp4> <timing.json> <film|reel> <mood> <out.mp4>
Code-only soundtrack from the same timing file, mastered to -14 LUFS / <= -2 dBTP MEASURED ON THE AAC FILE
(AAC raises peaks, so we encode, measure, correct gain/limiter, and repeat), then muxed:
H.264 High, yuv420p (tv range), 30 fps, CRF 19 capped 14 Mb/s, AAC 192k 48 kHz, +faststart."""
import sys, subprocess, re, os
sil, tj, kind, mood, out = sys.argv[1:6]
D = os.path.dirname(os.path.abspath(__file__)); wav = f"/tmp/{os.path.basename(out)[:-4]}.wav"; m4a = wav[:-4] + '.m4a'
subprocess.run(['python3', os.path.join(D, '..', 'audio', 'synth.py'), kind, tj, wav, mood], check=True, capture_output=True)
def meas(f):
    e = subprocess.run(['ffmpeg', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', e)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e)[-1])
I0, _ = meas(wav); gain = -14 - I0; lim = -4.5
for it in range(4):
    af = f"volume={gain:.2f}dB,alimiter=limit={10**(lim/20):.4f}:level=false:attack=2:release=80"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', m4a], check=True)
    I, TP = meas(m4a)
    if abs(I + 14) <= 0.5 and TP <= -2.0: break
    gain += (-14 - I); lim -= max(0, TP + 2.0) + 0.3 if TP > -2.0 else 0
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sil, '-i', m4a, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
    '-crf', '19', '-maxrate', '14M', '-bufsize', '28M', '-vf', 'scale=out_range=tv,format=yuv420p', '-color_range', 'tv', '-r', '30', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', out], check=True)
print(f'finished {out}  audio I={I} LUFS TP={TP} dBTP (iter {it+1})')
