# -*- coding: utf-8 -*-
"""Replace procedural dchibi with SF sprite sheet drawing; embed gfx."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from gen_sprites import build_sheet, sheet_to_gfx  # noqa: E402

GEN = ROOT / "tools" / "gen_cart.py"

NEW_DCHIBI = r'''
-- SF-style chibi sprites from sheet (20x28 frames)
-- broner y0: idle idle2 jab punch upper hit; super 0,28
-- deen y56: same layout; super 0,84
function pose_xy(fid,anim,af)
 local row=fid==1 and 0 or 56
 local frame=0
 if anim=="idle" then
  frame=flr(t()/16)%2
 elseif anim=="jab" or anim=="flinch" then frame=2
 elseif anim=="cross" or anim=="parry" then frame=3
 elseif anim=="upper" then frame=4
 elseif anim=="hit" or anim=="stumble" or anim=="crumple" then frame=5
 elseif anim=="special" or anim=="super" or anim=="finisher" then
  return 0,row+28
 end
 if anim=="jab" and af and af>=3 and af<6 then frame=3 end
 if anim=="cross" and af and af>=4 and af<8 then frame=3 end
 if (anim=="special" or anim=="super") and af and af>=8 then
  return 0,row+28
 end
 return (frame%6)*20,row+flr(frame/6)*28
end

function dchibi(fid,x,y,b)
 local anim=b and b.anim or "idle"
 local af=b and b.af or 0
 local face=b and b.face or 1
 local sx,sy=pose_xy(fid,anim,af)
 local flip=face<0
 sspr(sx,sy,20,28,x,y,20,28,flip)
 if b and b.atier and b.atier>=3 and anim!="idle" and anim!="hit" and anim!="flinch" and anim!="crumple" and anim!="stumble" then
  if af and af>=4 and af<=12 then
   local ix=face>0 and x+18 or x+2
   circfill(ix,y+14,2+b.atier%2,7)
   pset(ix,y+14,10)
  end
 end
end
'''


def main():
    t = GEN.read_text(encoding="utf-8")
    pat = re.compile(r"function dchibi\(fid,x,y,b\).*?\n(?=function dwell)", re.S)
    m = pat.search(t)
    if not m:
        raise SystemExit("dchibi block not found in gen_cart.py")
    t = pat.sub(NEW_DCHIBI.strip() + "\n\n", t)

    # Fix main to embed sprites
    if "sheet_to_gfx(build_sheet())" not in t:
        t = t.replace(
            'gfx = ("0" * 128 + "\\n") * 128',
            "from gen_sprites import build_sheet, sheet_to_gfx\n    gfx = sheet_to_gfx(build_sheet())",
        )
        if "sheet_to_gfx(build_sheet())" not in t:
            # alternate quoting
            t = t.replace(
                "gfx = (\"0\" * 128 + \"\\n\") * 128",
                "from gen_sprites import build_sheet, sheet_to_gfx\n    gfx = sheet_to_gfx(build_sheet())",
            )

    GEN.write_text(t, encoding="utf-8")
    print("patched", GEN)

    # regenerate cart now
    import gen_cart

    gen_cart.main()
    print("sprites embedded")


if __name__ == "__main__":
    main()
