"""Motion QA: stills lie, measure motion.
- freezedetect (ffmpeg, -60 dB, 0.5 s) -> every freeze not listed as intentional is a bug
- change-per-second graph (mean abs diff of grey frames at 1/4 res), printed + saved as PNG
- contact sheet every 1 s
- ffprobe: codec, profile, pix_fmt, fps, duration, size; ebur128 loudness of the FINAL file
usage: python3 motion_qa.py video.mp4 [--allow 25.0-31.0]
"""
import sys, subprocess, json, re, os, numpy as np
v = sys.argv[1]; allow = []
if '--allow' in sys.argv:
    for r in sys.argv[sys.argv.index('--allow')+1].split(','):
        a, b = r.split('-'); allow.append((float(a), float(b)))
base = os.path.splitext(v)[0]
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', v], capture_output=True, text=True).stdout)
vs = [s for s in pr['streams'] if s['codec_type'] == 'video'][0]; as_ = [s for s in pr['streams'] if s['codec_type'] == 'audio']
W, H = int(vs['width']), int(vs['height']); fps = eval(vs['r_frame_rate']); dur = float(pr['format']['duration'])
fz = subprocess.run(['ffmpeg', '-i', v, '-vf', 'freezedetect=n=-60dB:d=0.5', '-map', '0:v:0', '-f', 'null', '-'], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'freeze_start: ([\d.]+)', fz)]; ends = [float(x) for x in re.findall(r'freeze_end: ([\d.]+)', fz)]
freezes = list(zip(starts, ends + [dur]*(len(starts)-len(ends))))
bad = [f for f in freezes if not any(a <= f[0] and f[1] <= b + 0.05 for a, b in allow)]
# motion graph
w, h = W//4, H//4
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', v, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
prev = None; ch = []
while True:
    b = p.stdout.read(w*h)
    if len(b) < w*h: break
    g = np.frombuffer(b, np.uint8).astype(np.float32)
    if prev is not None: ch.append(np.abs(g-prev).mean())
    prev = g
ch = np.array(ch); per_s = [float(ch[int(i*fps):int((i+1)*fps)].mean()) for i in range(int(len(ch)/fps))]
still_frames = int((ch < 0.05).sum())
loud = subprocess.run(['ffmpeg', '-i', v, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr if as_ else ''
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', loud); TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', loud)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-vf', f"fps=1,scale={360 if W < H else 480}:-1,tile=6x{int(np.ceil(dur/6))}", '-frames:v', '1', base + '_contact.png'])
try:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    fig = plt.figure(figsize=(9, 2.4)); t = np.arange(len(ch))/fps; plt.plot(t, ch, lw=.8, color='#1c1c1c')
    for a, b in freezes: plt.axvspan(a, b, color='#e4572e' if (a, b) in bad else '#9ad', alpha=.35)
    plt.xlabel('s'); plt.ylabel('cambio/frame'); plt.title(os.path.basename(v)); plt.tight_layout(); plt.savefig(base + '_motion.png', dpi=110)
except Exception as e: print('no plot', e)
rep = {'file': os.path.basename(v), 'size_mb': round(os.path.getsize(v)/1e6, 2), 'w': W, 'h': H, 'fps': fps, 'duration_s': round(dur, 2),
       'vcodec': vs['codec_name'], 'profile': vs.get('profile'), 'pix_fmt': vs['pix_fmt'], 'acodec': as_[0]['codec_name'] if as_ else None,
       'faststart': None, 'freezes': [(round(a, 2), round(b, 2)) for a, b in freezes], 'unplanned_freezes': [(round(a, 2), round(b, 2)) for a, b in bad],
       'min_change_per_s': round(min(per_s), 3), 'still_frames(<0.05)': still_frames, 'loudness_LUFS': float(I[-1]) if I else None, 'true_peak_dBFS': float(TP[-1]) if TP else None,
       'change_per_s': [round(x, 2) for x in per_s]}
with open(v, 'rb') as fh: head = fh.read(4096)
rep['faststart'] = head.find(b'moov') != -1 and (head.find(b'mdat') == -1 or head.find(b'moov') < head.find(b'mdat'))
json.dump(rep, open(base + '_qa.json', 'w'), indent=1)
print(json.dumps({k: rep[k] for k in rep if k != 'change_per_s'}))
