import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve(process.argv[2] || "locked-in-ring.p8");
const outputPath = path.resolve(process.argv[3] || "tmp/balance.p8");
let cart = fs.readFileSync(sourcePath, "utf8");

const humanInput = " local pm,pg,pa=human_ctl()";
if (!cart.includes(humanInput)) throw new Error("Human input hook was not found");
cart = cart.replace(humanInput, `${humanInput}\n if bal==1 then pm,pg,pa=ai_ctl(p,o) end`);

const diagnostic = `function diag()
 bal=1
 local aw=0
 local dw=0
 poke(0x5fff,1)
 for i=1,100 do
  sel=i%2+1
  srand(4000+i*23+sel)
  p=mkb(sel,-1,true)
  o=mkb(3-sel,1,true)
  mode=2
  fr=0
  set_round(1)
  while mode!=4 and fr<5000 do
   if mode==2 then fight_tick() else upd_corner() end
  end
  if res.w==1 and sel==1 or res.w==2 and sel==2 then aw+=1 else dw+=1 end
 end
 bal=0
 title_mode()
 poke(0x5ff8,aw)
 poke(0x5ff9,dw)
 poke(0x5ffa,100)
 poke(0x5ffb,1)
end

`;
if (!cart.includes("function gpio()")) throw new Error("GPIO hook was not found");
cart = cart.replace("function gpio()", `${diagnostic}function gpio()`);

const titleUpdate = " if mode==0 then upd_title()";
if (!cart.includes(titleUpdate)) throw new Error("Title update hook was not found");
cart = cart.replace(titleUpdate, ` if mode==0 and peek(0x5ffc)==1 then\n  poke(0x5ffc,0) diag() return\n end\n${titleUpdate}`);

const drawStart = cart.indexOf("function btxt(");
const dataStart = cart.indexOf("__gfx__");
if (drawStart < 0 || dataStart < 0 || drawStart >= dataStart) throw new Error("Drawing section was not found");
cart = `${cart.slice(0, drawStart)}function _draw()\n gpio()\nend\n\n${cart.slice(dataStart)}`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, cart, "utf8");
console.log(`Generated balance cart: ${outputPath}`);
