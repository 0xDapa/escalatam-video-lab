"""Code-only soundtrack (0 samples, 0 copyrighted music). The score is the clock: every sound is read from the
same timing JSON the picture uses, and each hit lands 1 frame (33 ms at 30 fps) after its picture event.
usage: python3 synth.py film  ../embroidery/timing.json  out.wav
       python3 synth.py reel  ../reels/src/timing/brasa.json out.wav [mood]
"""
import sys, json, numpy as np, wave
SR = 48000
def mtof(n): return 440.0 * 2 ** ((n - 69) / 12)
def env(n, a=0.002, d=0.4):
    t = np.arange(n) / SR; e = np.minimum(1, t / a) * np.exp(-t / d); return e
def marimba(f, dur=1.2, v=0.5):
    n = int(SR * dur); t = np.arange(n) / SR
    y = (np.sin(2*np.pi*f*t)*np.exp(-t/0.45) + 0.35*np.sin(2*np.pi*f*3.93*t)*np.exp(-t/0.08) + 0.12*np.sin(2*np.pi*f*9.24*t)*np.exp(-t/0.025))
    return v * y * np.minimum(1, t/0.0015)
def pluck(f, dur=0.9, v=0.5, bright=0.5, seed=1):  # Karplus-Strong pizzicato
    n = int(SR*dur); p = max(2, int(SR/f)); rs = np.random.RandomState(seed)
    buf = rs.uniform(-1, 1, p); out = np.zeros(n); k = 0.996 - 0.006*(1-bright)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = k*0.5*(buf[i % p] + buf[(i+1) % p])
    return v * out * env(n, 0.001, dur*0.35)
def kick(v=0.8):
    n = int(SR*0.35); t = np.arange(n)/SR; f = 45 + 110*np.exp(-t/0.03)
    return v*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/0.12)
def noise(dur, v, hp=True, seed=2, decay=0.05):
    n = int(SR*dur); rs = np.random.RandomState(seed); x = rs.uniform(-1, 1, n)
    if hp: x = np.diff(np.concatenate([[0], x]))
    return v*x*env(n, 0.001, decay)
def whoosh(v=0.35, dur=0.6, seed=3):
    n = int(SR*dur); rs = np.random.RandomState(seed); x = rs.uniform(-1, 1, n); t = np.arange(n)/SR
    # moving one-pole lowpass -> airy sweep
    y = np.zeros(n); a = 0.0
    for i in range(n):
        c = 0.02 + 0.25*np.sin(np.pi*t[i]/dur)**2; a += c*(x[i]-a); y[i] = a
    return v*y*np.sin(np.pi*t/dur)**1.5*3
def bell(f, v=0.35, dur=2.5):
    n = int(SR*dur); t = np.arange(n)/SR; m = np.sin(2*np.pi*f*1.4*t)*2.0*np.exp(-t/0.6)
    return v*np.sin(2*np.pi*f*t + m)*np.exp(-t/0.9)*np.minimum(1, t/0.002)
def thump(v=0.7):
    k = kick(v)*0.8; n = noise(0.08, 0.15, True, 5, 0.02); k[:len(n)] += n; return k
def impact(v=0.8): return np.concatenate([kick(v), np.zeros(1)])[:int(SR*0.35)] + np.pad(noise(0.25, 0.5, True, 7, 0.06), (0, int(SR*0.35)-int(SR*0.25)))
def reverb(x, mix=0.18):
    y = x.copy()
    for d, g in [(1557, .78), (1617, .76), (1491, .77), (1422, .75), (2111, .7)]:
        b = np.zeros_like(x); 
        for s in range(d, len(x), d): pass
        # comb via recursive slices (fast enough for < 40 s)
        c = np.zeros(len(x)+d)
        for i0 in range(0, len(x), d):
            seg = x[i0:i0+d] + g*c[i0:i0+d][:len(x[i0:i0+d])]
            c[i0+d:i0+d+len(seg)] = seg
        y += mix*0.2*c[d:d+len(x)]
    return y
class Mix:
    def __init__(s, dur): s.L = np.zeros(int(SR*(dur+3))); s.R = s.L.copy()
    def add(s, t, sig, pan=0.0):
        i = int(t*SR); 
        if i < 0: return
        j = min(len(s.L), i+len(sig)); sig = sig[:j-i]
        s.L[i:j] += sig*np.sqrt(0.5*(1-pan)); s.R[i:j] += sig*np.sqrt(0.5*(1+pan))
    def write(s, path, dur):
        n = int(SR*dur); L = reverb(s.L[:n]); R = reverb(s.R[:n])
        fade = int(SR*0.4); L[-fade:] *= np.linspace(1, 0, fade); R[-fade:] *= np.linspace(1, 0, fade)
        m = max(np.abs(L).max(), np.abs(R).max(), 1e-6); L, R = L/m, R/m
        # gentle master saturation: lowers the crest factor so -14 LUFS fits under -2 dBTP
        L, R = np.tanh(2.2*L)/np.tanh(2.2)*0.8, np.tanh(2.2*R)/np.tanh(2.2)*0.8
        st = (np.stack([L, R], 1)*32767).astype('<i2')
        w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()

C_MAJ_PENTA = [60, 62, 64, 67, 69, 72, 74, 76]
def bed(mx, dur, bpm, root=50, scale=(0, 3, 5, 7, 10), start=0.0, end=None, density=1.0, seed=4, kickon=True, plucky=True):
    """light percussion + pizzicato bass + marimba ostinato on the beat grid"""
    beat = 60/bpm; end = end or dur; rs = np.random.RandomState(seed); prog = [0, 5, 3, 4]
    nb = int((end-start)/beat)
    for b in range(nb):
        t = start + b*beat; bar = b//4; deg = prog[bar % 4]
        if kickon and b % 2 == 0: mx.add(t, kick(0.32))
        if b % 2 == 1: mx.add(t, noise(0.05, 0.06, True, b, 0.02), 0.3)
        mx.add(t+beat/2, noise(0.03, 0.03, True, b+99, 0.012), -0.3)
        if plucky and b % 4 in (0, 2): mx.add(t, pluck(mtof(root - 12 + scale[deg % 5]), 0.8, 0.45, 0.3, b), -0.1)
        if rs.rand() < 0.55*density:
            n = root + 12 + scale[rs.randint(5)] + 12*rs.randint(2)
            mx.add(t + (beat/2 if rs.rand() < 0.4 else 0), marimba(mtof(n), 0.9, 0.16), rs.uniform(-0.5, 0.5))

def film(T, out):
    fr = 1/T['fps']; dur = T['duration']; mx = Mix(dur)
    rv = T['reveal']; E = T['endcard']
    bed(mx, dur, T['bpm'], root=60, scale=(0, 2, 4, 7, 9), start=0, end=rv['start'], seed=11)
    for i, s in enumerate(T['stops']):
        n = C_MAJ_PENTA[i % 8]
        mx.add(s['arrive']+fr, marimba(mtof(n+12), 1.4, 0.42), 0.15)       # arrival: marimba
        mx.add(s['arrive']+fr, marimba(mtof(n), 1.4, 0.22), -0.15)
        for d in s['dips']: mx.add(d+fr, pluck(mtof(n+24), 0.5, 0.28, 0.9, i), 0.4)   # needle: high pizz
    # reveal: rising arpeggio on 16ths + shaker, then the glow thread chime
    beat = 60/T['bpm']; k = 0
    t = rv['start']
    while t < rv['rise_end']:
        mx.add(t, marimba(mtof(60 + [0, 4, 7, 12, 16, 19, 24][k % 7] + 12*(k//14)), 0.6, 0.18), np.sin(k)*0.5); k += 1; t += beat/4
    mx.add(rv['glow_start']+fr, bell(mtof(84), 0.18, 3.0)); mx.add(rv['glow_start']+fr, bell(mtof(91), 0.12, 3.0))
    bed(mx, dur, T['bpm'], root=60, scale=(0, 2, 4, 7, 9), start=rv['rise_end'], end=E['start'], seed=12, density=0.6)
    # end card: chord on title, one pluck per list item, bell on banner
    for n in (60, 64, 67, 72): mx.add(E['title']+fr, marimba(mtof(n), 2.5, 0.25))
    for i in range(10): mx.add(E['list_start']+i*E['list_stagger']+fr, pluck(mtof(C_MAJ_PENTA[i % 8]+12), 0.6, 0.22, 0.8, 40+i), (i % 2-0.5)*0.6)
    mx.add(E['banner']+fr, bell(mtof(79), 0.3, 3.0))
    bed(mx, dur, T['bpm']/2, root=60, scale=(0, 2, 4, 7, 9), start=E['banner'], end=dur-0.5, seed=13, density=0.5, kickon=False)
    mx.write(out, dur)

MOODS = {  # key, scale, density per reel mood
  'brasa': dict(root=50, scale=(0, 3, 5, 7, 10), density=0.8),
  'calm': dict(root=57, scale=(0, 2, 4, 7, 9), density=0.45, kickon=False),
  'blue': dict(root=55, scale=(0, 2, 4, 7, 11), density=0.6),
  'punch': dict(root=52, scale=(0, 3, 5, 7, 10), density=1.0),
  'paper': dict(root=60, scale=(0, 2, 4, 7, 9), density=0.7),
}
def reel(T, out, mood):
    fr = 1/T['fps']; dur = T['duration']; mx = Mix(dur); m = MOODS[mood]
    bed(mx, dur, T['bpm'], start=T.get('music_start', 0.0), end=dur-0.6, seed=hash(mood) % 100, **m)
    for h in T['hits']:
        t = h['t'] + fr; i = h['i']; n = h.get('n', m['root']+24)
        if i == 'pluck': mx.add(t, pluck(mtof(n), 0.7, 0.35, 0.8, int(n)), 0.2)
        elif i == 'marimba': mx.add(t, marimba(mtof(n), 1.2, 0.35))
        elif i == 'bell': mx.add(t, bell(mtof(n), 0.28, 2.8))
        elif i == 'whoosh': mx.add(t - 0.25, whoosh(0.3))
        elif i == 'thump': mx.add(t, thump(0.6))
        elif i == 'impact': mx.add(t, impact(0.7))
        elif i == 'tick': mx.add(t, noise(0.04, 0.25, True, 9, 0.01))
    mx.write(out, dur)

if __name__ == '__main__':
    kind, src, out = sys.argv[1:4]; T = json.load(open(src))
    film(T, out) if kind == 'film' else reel(T, out, sys.argv[4] if len(sys.argv) > 4 else 'paper')
    print('wrote', out)
