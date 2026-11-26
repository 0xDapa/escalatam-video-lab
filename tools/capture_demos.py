# Deterministic "screen recording" of a demo: mobile viewport, scroll position is a pure function of the frame,
# one screenshot per frame. (Real-time screen recording drops frames on a CPU box; this never does.)
# usage: python3 capture_demos.py scroll <demo-folder> <frames> <max_scroll_vh> | heroes <id,id,...>
import sys, asyncio, os, math
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:8766/'; OUT=os.path.join(os.path.dirname(__file__),'..','reels','public','caps')
def ease(u): # smootherstep with a 15% hold at both ends
    u=min(1,max(0,(u-0.12)/0.76)); return u*u*u*(u*(u*6-15)+10)
async def main():
    mode=sys.argv[1]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--hide-scrollbars'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='no-preference')
        pg=await ctx.new_page()
        if mode=='scroll':
            demo,n,vh=sys.argv[2],int(sys.argv[3]),float(sys.argv[4])
            od=os.path.join(OUT,demo);os.makedirs(od,exist_ok=True)
            await pg.goto(BASE+demo+'/',wait_until='networkidle');await asyncio.sleep(3)
            maxs=await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
            target=min(maxs,vh*844)
            for i in range(n):
                y=ease(i/(n-1))*target
                await pg.evaluate(f'window.scrollTo(0,{y})');await asyncio.sleep(0.05)
                await pg.screenshot(path=os.path.join(od,f'{i:04d}.jpg'),type='jpeg',quality=82)
            print(demo,'frames',n,'scroll',target,'of',maxs)
        else:
            od=os.path.join(OUT,'heroes');os.makedirs(od,exist_ok=True)
            for demo in sys.argv[2].split(','):
                await pg.goto(BASE+demo+'/',wait_until='networkidle');await asyncio.sleep(3.5)
                await pg.screenshot(path=os.path.join(od,demo[:2]+'.jpg'),type='jpeg',quality=85);print('hero',demo)
        await b.close()
asyncio.run(main())
