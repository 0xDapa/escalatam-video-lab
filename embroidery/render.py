# Deterministic frame capture: headless Chromium calls renderAt(i/fps) and screenshots each frame -> ffmpeg.
# usage: python3 render.py URL out.mp4 [start_frame end_frame] [--stills t1,t2]
import sys, json, subprocess, asyncio
from playwright.async_api import async_playwright
async def main():
    url, out = sys.argv[1], sys.argv[2]
    T = json.load(open('timing.json')) if len(sys.argv)<6 else None
    fps=30; W,H=1080,1350
    stills=None
    args=[a for a in sys.argv[3:] if not a.startswith('--')]
    if '--stills' in sys.argv: stills=[float(x) for x in sys.argv[sys.argv.index('--stills')+1].split(',')]
    a0,a1=(int(args[0]),int(args[1])) if len(args)>=2 and not stills else (0,None)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':W,'height':H})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto(url)
        try: await pg.wait_for_function('window.__ready===true',timeout=240000)
        except Exception as e: print('NOT READY',errs); raise
        dur=await pg.evaluate('fetch("timing.json").then(r=>r.json()).then(j=>j.duration)')
        if stills:
            for t in stills:
                await pg.evaluate(f'renderAt({t})');await pg.screenshot(path=f'{out}_{t:05.2f}.jpg',type='jpeg',quality=90)
        else:
            n=a1 if a1 is not None else int(dur*fps)
            ff=subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-framerate',str(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
            for i in range(a0,n):   # frames a0..n-1, never frame N
                await pg.evaluate(f'renderAt({i/fps})')
                ff.stdin.write(await pg.screenshot(type='jpeg',quality=94))
                if i%50==0: print('frame',i,flush=True)
            ff.stdin.close();ff.wait()
        if errs: print('PAGE ERRORS:',errs[:5])
        await b.close()
asyncio.run(main())
