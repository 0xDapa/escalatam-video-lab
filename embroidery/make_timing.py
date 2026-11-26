# timing.json = master clock for film A ("Puntada a puntada"). Everything (camera, needle, sound) reads from it.
import json
FPS=30; BPM=120; BEAT=60/BPM
stops=[]
for i in range(10):
    a=0.5+2.0*i
    stops.append({"i":i,"arrive":a,"leave":a+0.9,"dips":[round(a+0.15,3),round(a+0.6,3)]})
T={"fps":FPS,"bpm":BPM,"beat":BEAT,"width":1080,"height":1350,
   "duration":31.0,"frames":int(31.0*FPS),
   "stops":stops,
   "reveal":{"start":19.4,"rise_end":22.6,"glow_start":21.6,"glow_end":23.9,"end":25.0},
   "endcard":{"start":25.0,"title":25.25,"subtitle":25.6,"underline":[25.9,26.6],"list_start":26.4,"list_stagger":0.07,"banner":27.6,"end":31.0}}
json.dump(T,open("timing.json","w"),indent=1)
print(T["frames"])
