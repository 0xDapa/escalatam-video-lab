import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { loadAll } from "./lib/fonts";
import { BrasaReel } from "./reels/Brasa";
import { EscalatamReel } from "./reels/Escalatam";
import { LuaReel } from "./reels/Lua";
import { MiradorReel } from "./reels/Mirador";
import { BravaReel } from "./reels/Brava";

const h = delayRender("fonts");
loadAll().then(() => continueRender(h));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BrasaReel" component={BrasaReel} durationInFrames={600} fps={30} width={1080} height={1920} />
    <Composition id="EscalatamReel" component={EscalatamReel} durationInFrames={720} fps={30} width={1080} height={1920} />
    <Composition id="LuaReel" component={LuaReel} durationInFrames={540} fps={30} width={1080} height={1350} />
    <Composition id="MiradorReel" component={MiradorReel} durationInFrames={540} fps={30} width={1080} height={1350} />
    <Composition id="BravaReel" component={BravaReel} durationInFrames={450} fps={30} width={1080} height={1920} />
  </>
);
