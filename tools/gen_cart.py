# -*- coding: utf-8 -*-
"""Generate ring-rush.p8 — SPF2T-style dual-board puzzle fighter."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "ring-rush.p8"

LUA = r'''
-- ring rush | spf2t-style | trap gym
private_names=true
cols,rows,cell=6,12,6
w1x,w1y,w2x,w2y=1,18,91,18
killcol=3
gpal={8,11,12,10}
gdk={2,3,1,4}
ghi={14,3,13,9}
grav0=26
shake,parts,fx,hitstop=0,{},{},0

function isempty(v) return not v or v==0 end
function isnorm(v) return v and v>=1 and v<=4 end
function iscrash(v) return v and v>=5 and v<=8 end
function ispow(v) return v and v>=41 and v<=44 end
function isctr(v) return v and v>=16 and v<=39 end
function colof(v)
 if isempty(v) then return 0 end
 if v<=4 then return v end
 if v<=8 then return v-4 end
 if v>=41 then return v-40 end
 if isctr(v) then return ((v-16)%4)+1 end
 return 0
end
function mkn(c) return c end
function mkc(c) return c+4 end
function mkp(c) return c+40 end
function mkt(c,t) return 16+(c-1)+mid(0,t,5)*4 end
function ctt(v) return flr((v-16)/4) end

fighters={
 {
  id="gold",
  name=private_names and "adrien broner" or "gold problem",
  short=private_names and "broner" or "gold",
  tag=private_names and "the problem" or "neon gold",
  quote="still undefeated, baby.",
  pat={1,3,1,3,1,3,4,2,4,2,4,2},
  sk=15,gl=14,tr=10,sh=0,ac=10,style=0
 },
 {
  id="crash",
  name=private_names and "deen the great" or "great crashout",
  short=private_names and "deen" or "crash",
  tag=private_names and "crashout king" or "full send",
  quote="full send. no brakes.",
  pat={1,2,3,4,1,2,3,4,1,2,3,4,2,1,4,3,2,1,4,3,2,1,4,3},
  sk=4,gl=8,tr=9,sh=0,ac=8,style=1
 }
}

function new_grid()
 local g={}
 for x=0,cols-1 do
  g[x]={}
  for y=0,rows-1 do g[x][y]=0 end
 end
 return g
end
function gget(g,x,y)
 if x<0 or x>=cols or y<0 or y>=rows then return -1 end
 return g[x][y]
end
function gset(g,x,y,v)
 if x>=0 and x<cols and y>=0 and y<rows then g[x][y]=v end
end

function new_board(fid)
 return {
  g=new_grid(),fid=fid or 1,piece=nil,nx=nil,
  drop_n=0,pat_i=0,pend_in=0,grav=0,score=0,
  flash={},chain=0,resolving=false,dead=false,
  anim="idle",af=0,atier=0,combo_txt=nil,combo_t=0,face=1
 }
end

function rndc() return 1+flr(rnd(4)) end
function make_pair(b)
 b.drop_n+=1
 if b.drop_n%25==0 then return {99,rndc()} end
 local a=rnd()<0.32 and mkc(rndc()) or mkn(rndc())
 local c=rnd()<0.32 and mkc(rndc()) or mkn(rndc())
 return {a,c}
end

function tick_ctrs(b)
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=b.g[x][y]
   if isctr(v) then
    local t,c=ctt(v),colof(v)
    b.g[x][y]=t<=0 and mkn(c) or mkt(c,t-1)
   end
  end
 end
end

function grav(g)
 for x=0,cols-1 do
  local w=rows-1
  for y=rows-1,0,-1 do
   local v=g[x][y]
   if not isempty(v) then
    if y!=w then g[x][w]=v g[x][y]=0 end
    w-=1
   end
  end
  for y=w,0,-1 do g[x][y]=0 end
 end
end

function fuse(g)
 for c=1,4 do
  for y=0,rows-2 do
   for x=0,cols-2 do
    local mw=cols-x
    for yy=y,rows-1 do
     local rm=0
     for xx=x,cols-1 do
      local v=g[xx][yy]
      if not ((isnorm(v) or ispow(v)) and colof(v)==c) then break end
      rm=xx-x+1
     end
     mw=yy==y and rm or min(mw,rm)
     if mw<2 then break end
     if yy-y+1>=2 then
      for fy=y,yy do
       for fx=x,x+mw-1 do
        if isnorm(g[fx][fy]) then g[fx][fy]=mkp(c) end
       end
      end
     end
    end
   end
  end
 end
end

function drop_ctr(b,n)
 if n<=0 then return end
 local f,g=fighters[b.fid],b.g
 local p,i=0,0
 while p<n do
  local c=f.pat[(b.pat_i%#f.pat)+1]
  b.pat_i+=1
  local st=i%cols
  local ok=false
  for o=0,cols-1 do
   local x=(st+o)%cols
   if isempty(g[x][0]) then
    g[x][0]=mkt(c,5)
    p+=1
    ok=true
    break
   end
  end
  if not ok then break end
  i+=1
 end
 grav(g)
 fuse(g)
end

function spawn(b)
 if not b.nx then b.nx=make_pair(b) end
 local v=b.nx
 b.nx=make_pair(b)
 tick_ctrs(b)
 if b.pend_in>0 then
  drop_ctr(b,b.pend_in)
  b.pend_in=0
  sfx(5)
 end
 if not isempty(gget(b.g,killcol,0)) or not isempty(gget(b.g,killcol,1)) then
  b.dead=true
  b.piece=nil
  return
 end
 -- y=1 so vertical pair sits fully on board (a at y0, b at y1)
 b.piece={a=v[1],b=v[2],x=killcol,y=1,rot=0}
 b.grav=0
end

function pcells(p)
 local ox,oy=0,-1
 if p.rot==1 then ox,oy=1,0 end
 if p.rot==2 then ox,oy=0,1 end
 if p.rot==3 then ox,oy=-1,0 end
 return p.x+ox,p.y+oy,p.x,p.y
end

function pok(g,p,nx,ny,nr)
 local t={x=nx,y=ny,rot=nr}
 local x1,y1,x2,y2=pcells(t)
 if x1<0 or x1>=cols or y1<0 or y1>=rows then return false end
 if x2<0 or x2>=cols or y2<0 or y2>=rows then return false end
 if not isempty(gget(g,x1,y1)) then return false end
 if not isempty(gget(g,x2,y2)) then return false end
 return true
end

function tmove(b,dx,dy)
 local p=b.piece
 if not p then return false end
 if pok(b.g,p,p.x+dx,p.y+dy,p.rot) then
  p.x+=dx p.y+=dy
  return true
 end
 return false
end

function trot(b)
 local p=b.piece
 if not p then return false end
 local nr=(p.rot+1)%4
 if pok(b.g,p,p.x,p.y,nr) then p.rot=nr sfx(4) return true end
 for _,k in pairs({{-1,0},{1,0},{0,-1},{0,1}}) do
  if pok(b.g,p,p.x+k[1],p.y+k[2],nr) then
   p.x+=k[1] p.y+=k[2] p.rot=nr sfx(4)
   return true
  end
 end
 return false
end

function burst(px,py,c,n)
 for i=1,n or 8 do
  add(parts,{x=px,y=py,dx=rnd(3)-1.5,dy=rnd(3)-2,life=10+flr(rnd(8)),c=c or 7})
 end
end

function lock(b)
 local p=b.piece
 if not p then return end
 local x1,y1,x2,y2=pcells(p)
 if p.a==99 or p.b==99 then
  local partner=p.a==99 and p.b or p.a
  local dc=colof(partner)
  if dc==0 then dc=rndc() end
  if p.a!=99 then gset(b.g,x1,y1,p.a) end
  if p.b!=99 then gset(b.g,x2,y2,p.b) end
  b._dia=dc
 else
  gset(b.g,x1,y1,p.a)
  gset(b.g,x2,y2,p.b)
  b._dia=nil
 end
 b.piece=nil
 b.resolving=true
 b.chain=0
 sfx(6)
end

function flood(g,sx,sy,c,seen)
 local st,cells={{sx,sy}},{}
 while #st>0 do
  local n=st[#st]
  st[#st]=nil
  local x,y=n[1],n[2]
  local k=x+y*cols
  if not seen[k] then
   local v=gget(g,x,y)
   if v!=-1 and (isnorm(v) or ispow(v)) and colof(v)==c then
    seen[k]=true
    add(cells,{x,y,v})
    add(st,{x+1,y}) add(st,{x-1,y})
    add(st,{x,y+1}) add(st,{x,y-1})
   end
  end
 end
 return cells
end

function resolve_step(b)
 local g,cl,pw,flash,seen=b.g,0,0,{},{}
 if b._dia then
  local dc=b._dia
  b._dia=nil
  for x=0,cols-1 do
   for y=0,rows-1 do
    local v=g[x][y]
    if not isempty(v) and colof(v)==dc then
     if ispow(v) then pw+=1 end
     g[x][y]=0
     cl+=1
     add(flash,{x,y})
     burst(x*cell+3,y*cell+3,gpal[dc],6)
    end
   end
  end
  b.flash=flash
  b.chain+=1
  return cl,pw,true
 end
 local crashes={}
 for x=0,cols-1 do
  for y=0,rows-1 do
   if iscrash(g[x][y]) then add(crashes,{x,y,colof(g[x][y])}) end
  end
 end
 if #crashes==0 then return 0,0,false end
 local tc={}
 for cr in all(crashes) do
  local cx,cy,c=cr[1],cr[2],cr[3]
  tc[cx+cy*cols]={cx,cy,g[cx][cy]}
  for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
   for ce in all(flood(g,cx+d[1],cy+d[2],c,seen)) do
    tc[ce[1]+ce[2]*cols]=ce
   end
  end
 end
 for k,ce in pairs(tc) do
  local x,y,c=ce[1],ce[2],colof(ce[3])
  for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
   local nx,ny=x+d[1],y+d[2]
   local v=gget(g,nx,ny)
   if isctr(v) and colof(v)==c then tc[nx+ny*cols]={nx,ny,v} end
  end
 end
 for k,ce in pairs(tc) do
  local x,y,v=ce[1],ce[2],ce[3]
  if ispow(v) then pw+=1 end
  local c=colof(v)
  g[x][y]=0
  cl+=1
  add(flash,{x,y})
  burst(x*cell+3,y*cell+3,gpal[c] or 7,5)
 end
 b.flash=flash
 if cl>0 then b.chain+=1 end
 return cl,pw,cl>0
end

function atk_amt(cl,pw,ch,dia)
 local a=max(0,cl+pw-2)+max(0,ch-1)*2
 if dia then a=flr(a*0.6) end
 return a
end

function set_attack(b,tier)
 b.atier=tier
 if tier<=1 then b.anim="jab"
 elseif tier==2 then b.anim="cross"
 elseif tier==3 then b.anim="upper"
 elseif tier==4 then b.anim="special"
 else b.anim="super" end
 b.af=0
end

function set_hurt(b,tier)
 if tier<=1 then b.anim="flinch"
 elseif tier<=3 then b.anim="hit"
 elseif tier<=4 then b.anim="stumble"
 else b.anim="crumple" end
 b.af=0
 b.atier=tier
end

function send_atk(atk,a,d,chain)
 if atk<=0 then return end
 if a.pend_in>0 then
  local c=min(atk,a.pend_in)
  a.pend_in-=c
  atk-=c
  if c>0 then a.anim="parry" a.af=0 sfx(8) end
 end
 if atk<=0 then return end
 d.pend_in+=atk
 local tier=1
 if atk>=4 then tier=2 end
 if atk>=8 then tier=3 end
 if atk>=12 or chain>=2 then tier=4 end
 if atk>=19 or chain>=3 then tier=5 end
 set_attack(a,tier)
 set_hurt(d,tier)
 a.combo_txt=atk.."!"
 a.combo_t=36
 hitstop=mid(2,2+tier,8)
 shake=min(8,1+tier)
 sfx(tier>=5 and 9 or 8)
 if chain>1 then sfx(7) end
 local ax=a==p1 and 52 or 76
 local dx=d==p1 and 52 or 76
 add(fx,{k="beam",x=ax,y=70,t=10+tier,e=dx})
 add(fx,{k="impact",x=dx,y=68,t=8,e=tier})
end

function finish_res(b,opp)
 grav(b.g)
 fuse(b.g)
 local total,guard=0,0
 while guard<24 do
  guard+=1
  local dia=b._dia!=nil
  local cl,pw,did=resolve_step(b)
  if not did then break end
  total+=atk_amt(cl,pw,b.chain,dia)
  grav(b.g)
  fuse(b.g)
  if cl>0 then sfx(5) end
 end
 if total>0 then
  send_atk(total,b,opp,b.chain)
  b.score+=total*100+b.chain*50
 end
 b.resolving=false
 b.flash={}
 b.chain=0
 if not b.dead then spawn(b) end
end

function bheight(g)
 local h=0
 for x=0,cols-1 do
  for y=0,rows-1 do
   if not isempty(g[x][y]) then h=max(h,rows-y) break end
  end
 end
 return h
end

function scoreg(g)
 local sc=-bheight(g)*3
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=g[x][y]
   if ispow(v) then sc+=5 end
   if iscrash(v) then
    local c=colof(v)
    for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
     local n=gget(g,x+d[1],y+d[2])
     if (isnorm(n) or ispow(n)) and colof(n)==c then sc+=7 end
    end
   end
  end
 end
 for y=0,5 do
  if not isempty(g[killcol][y]) then sc-=10 end
 end
 return sc
end

function cgrid(g)
 local n=new_grid()
 for x=0,cols-1 do
  for y=0,rows-1 do n[x][y]=g[x][y] end
 end
 return n
end

function cpu_think(b)
 local p=b.piece
 if not p then return end
 local best,bx,br=-9999,p.x,p.rot
 for rot=0,3 do
  for x=0,cols-1 do
   local ty,ok=1,true
   if not pok(b.g,p,x,1,rot) then
    if pok(b.g,p,x,0,rot) then ty=0 else ok=false end
   end
   if ok then
    local y=ty
    while pok(b.g,p,x,y+1,rot) do y+=1 end
    local ng=cgrid(b.g)
    local tmp={a=p.a,b=p.b,x=x,y=y,rot=rot}
    local x1,y1,x2,y2=pcells(tmp)
    if p.a!=99 then gset(ng,x1,y1,p.a) end
    if p.b!=99 then gset(ng,x2,y2,p.b) end
    if p.a==99 then gset(ng,x1,y1,0) end
    if p.b==99 then gset(ng,x2,y2,0) end
    grav(ng)
    fuse(ng)
    local sc=scoreg(ng)+rnd(2)
    if sc>best then best,bx,br=sc,x,rot end
   end
  end
 end
 if p.rot!=br then trot(b) return end
 if p.x<br then tmove(b,1,0) return end
 if p.x>br then tmove(b,-1,0) return end
 while tmove(b,0,1) do end
 lock(b)
end

scene,sel="title",1
p1_fid,p2_fid=1,2
p1,p2,winner=nil,nil,0
das_t,pause,cpu_t=0,false,0

function start_fight()
 p1=new_board(p1_fid)
 p2=new_board(p2_fid)
 p1.face=1
 p2.face=-1
 spawn(p1)
 spawn(p2)
 winner=0
 pause=false
 scene="fight"
 music(0)
end

function upd_board(b,cpu)
 if b.dead or b.resolving then return end
 if not b.piece then
  if not b.dead then spawn(b) end
  return
 end
 if cpu then
  cpu_t+=1
  if cpu_t>=5 then cpu_t=0 cpu_think(b) end
 else
  if btnp(0) then tmove(b,-1,0) das_t=8 end
  if btnp(1) then tmove(b,1,0) das_t=8 end
  if btn(0) or btn(1) then
   local d=btn(0) and -1 or 1
   das_t-=1
   if das_t<=0 then tmove(b,d,0) das_t=2 end
  end
  if btn(3) then tmove(b,0,1) end
  if btnp(4) then trot(b) end
  if btnp(5) then
   while tmove(b,0,1) do end
   lock(b)
   return
  end
 end
 b.grav+=1
 local gf=grav0
 if not cpu and btn(3) then gf=2 end
 if b.grav>=gf then
  b.grav=0
  if not tmove(b,0,1) then lock(b) end
 end
end

function upd_anim(b)
 if b.anim=="idle" then return end
 b.af+=1
 local maxf=12
 if b.anim=="jab" then maxf=10
 elseif b.anim=="cross" then maxf=14
 elseif b.anim=="upper" then maxf=16
 elseif b.anim=="special" then maxf=20
 elseif b.anim=="super" then maxf=28
 elseif b.anim=="parry" then maxf=14
 elseif b.anim=="flinch" then maxf=8
 elseif b.anim=="hit" then maxf=12
 elseif b.anim=="stumble" then maxf=16
 elseif b.anim=="crumple" then maxf=40 end
 if b.af>=maxf then
  if not (b.anim=="crumple" and b.dead) then
   b.anim="idle"
   b.af=0
   b.atier=0
  end
 end
end

-- jewel gems
function jewel(px,py,s,col,dk,hi,kind)
 rectfill(px,py,px+s-1,py+s-1,0)
 rectfill(px+1,py+1,px+s-2,py+s-2,col)
 line(px+1,py+1,px+s-2,py+1,hi)
 line(px+1,py+2,px+s-3,py+2,7)
 line(px+1,py+1,px+1,py+s-2,hi)
 pset(px+2,py+2,7)
 pset(px+3,py+2,7)
 pset(px+2,py+3,hi)
 line(px+2,py+s-2,px+s-2,py+s-2,dk)
 line(px+s-2,py+2,px+s-2,py+s-2,dk)
 pset(px+s-3,py+s-3,dk)
 if kind=="pow" then
  rect(px+1,py+1,px+s-2,py+s-2,7)
  line(px+2,py+2,px+s-3,py+2,10)
 elseif kind=="crash" then
  local cx,cy=px+flr((s-1)/2),py+flr((s-1)/2)
  for i=0,2 do
   pset(cx+i,cy,7) pset(cx-i,cy,7)
   pset(cx,cy+i,7) pset(cx,cy-i,7)
  end
  pset(cx-1,cy-1,hi) pset(cx+1,cy-1,hi)
  pset(cx-1,cy+1,hi) pset(cx+1,cy+1,hi)
  pset(cx,cy,10)
 elseif kind=="ctr" then
  rectfill(px+1,py+1,px+s-2,py+s-2,dk)
  rect(px,py,px+s-1,py+s-1,col)
 end
end

function dgem(px,py,v)
 if isempty(v) then return end
 local s=cell
 if v==99 then
  local cx,cy=px+3,py+3
  for i=0,3 do
   line(cx-i,cy-3+i,cx+i,cy-3+i,7)
   line(cx-i,cy+3-i,cx+i,cy+3-i,12)
  end
  pset(cx,cy,7)
  return
 end
 local c=colof(v)
 local col,dk,hi=gpal[c] or 7,gdk[c] or 5,ghi[c] or 7
 if isctr(v) then
  jewel(px,py,s,col,dk,hi,"ctr")
  print(ctt(v),px+2,py+1,7)
  return
 end
 if ispow(v) then jewel(px,py,s,col,dk,hi,"pow") return end
 if iscrash(v) then jewel(px,py,s,col,dk,hi,"crash") return end
 jewel(px,py,s,col,dk,hi,"norm")
end

function dpow_block(ox,oy,x,y,w,h,c)
 local px,py=ox+x*cell,oy+y*cell
 local bw,bh=w*cell,h*cell
 local col,dk,hi=gpal[c],gdk[c],ghi[c]
 rectfill(px,py,px+bw-1,py+bh-1,0)
 rectfill(px+1,py+1,px+bw-2,py+bh-2,col)
 line(px+1,py+1,px+bw-2,py+1,hi)
 line(px+1,py+2,px+bw-3,py+2,7)
 line(px+1,py+1,px+1,py+bh-2,hi)
 line(px+2,py+bh-2,px+bw-2,py+bh-2,dk)
 line(px+bw-2,py+2,px+bw-2,py+bh-2,dk)
 rect(px+2,py+2,px+bw-3,py+bh-3,7)
 pset(px+3,py+3,7)
 pset(px+bw-4,py+3,10)
end

function find_pow(g)
 local seen,rects={},{}
 for y=0,rows-1 do
  for x=0,cols-1 do
   local k=x+y*cols
   if not seen[k] and ispow(g[x][y]) then
    local c=colof(g[x][y])
    local w=1
    while x+w<cols and ispow(g[x+w][y]) and colof(g[x+w][y])==c and not seen[x+w+y*cols] do w+=1 end
    local h=1
    local ok=true
    while y+h<rows and ok do
     for xx=x,x+w-1 do
      if not (ispow(g[xx][y+h]) and colof(g[xx][y+h])==c and not seen[xx+(y+h)*cols]) then ok=false break end
     end
     if ok then h+=1 end
    end
    if w>=2 and h>=2 then
     add(rects,{x,y,w,h,c})
     for yy=y,y+h-1 do
      for xx=x,x+w-1 do seen[xx+yy*cols]=true end
     end
    else
     seen[k]=true
    end
   end
  end
 end
 return rects,seen
end

function dchibi(fid,x,y,b)
 local f=fighters[fid]
 local anim=b and b.anim or "idle"
 local af=b and b.af or 0
 local face=b and b.face or 1
 local bob=flr(t()/14)%2
 local sk,gl,tr,sh=f.sk,f.gl,f.tr,f.sh
 local gold=f.style==0
 local phase,punch,crouch,lean=0,0,0,0
 if anim=="jab" then
  if af<3 then phase=1 punch=face*2
  elseif af<6 then phase=2 punch=face*7
  else phase=3 punch=face*3 end
 elseif anim=="cross" then
  if af<4 then phase=1 punch=face*3 lean=face
  elseif af<8 then phase=2 punch=face*10 lean=face*2
  else phase=3 punch=face*4 end
 elseif anim=="upper" then
  if af<4 then phase=1 punch=face*2 crouch=2
  elseif af<10 then phase=2 punch=face*6 crouch=-4
  else phase=3 punch=face*2 end
 elseif anim=="special" then
  if af<5 then phase=1 punch=face*4 lean=face*2
  elseif af<12 then phase=2 punch=face*12 lean=face*3
  else phase=3 punch=face*5 end
 elseif anim=="super" then
  if af<8 then phase=1 punch=-face*2
  elseif af<16 then phase=2 punch=face*14 lean=face*4
  else phase=3 punch=face*6 end
 elseif anim=="parry" then
  phase=2 punch=face*4 lean=-face
 elseif anim=="flinch" then
  lean=-face*2 punch=-face
 elseif anim=="hit" then
  lean=-face*3 punch=-face*2
 elseif anim=="stumble" then
  lean=-face*4 crouch=2
 elseif anim=="crumple" then
  crouch=8 lean=-face*2
 end
 local yy=y+crouch
 circfill(x+7,yy+31,7,0)
 rectfill(x+2+lean,yy+27,x+7+lean,yy+31,sh)
 rectfill(x+10+lean,yy+26,x+15+lean,yy+31,sh)
 rectfill(x+3+lean,yy+19,x+7+lean,yy+27,tr)
 rectfill(x+10+lean,yy+18,x+14+lean,yy+26,tr)
 rectfill(x+2+lean,yy+14,x+15+lean,yy+20,tr)
 if gold then
  line(x+3+lean,yy+15,x+14+lean,yy+15,10)
  line(x+3+lean,yy+19,x+14+lean,yy+19,10)
 else
  rectfill(x+7+lean,yy+14,x+10+lean,yy+20,0)
  line(x+3+lean,yy+15,x+14+lean,yy+15,8)
 end
 rectfill(x+4+lean,yy+10,x+13+lean,yy+16,sk)
 if gold then
  for i=0,2 do circ(x+8+lean,yy+12+i,3+i,10) end
  pset(x+8+lean,yy+16,9)
 else
  line(x+5+lean,yy+12,x+12+lean,yy+12,9)
  pset(x+8+lean,yy+13,10)
 end
 local gx1=x+1+punch
 local gx2=x+14+flr(punch/2)
 local gy=yy+12+bob
 if phase==1 then gy+=1 end
 circfill(gx1,gy,5,gl)
 circfill(gx1,gy,4,gold and 14 or 8)
 circfill(gx1,gy,2,7)
 circfill(gx2,gy+1,5,gl)
 circfill(gx2,gy+1,4,gold and 14 or 8)
 circfill(gx2,gy+1,2,7)
 if phase==2 and (anim=="special" or anim=="super" or anim=="cross") then
  for i=0,3 do
   line(gx1-face*(4+i*2),gy-1+i%2,gx1-face*2,gy,gold and 10 or 8)
  end
 end
 rectfill(x+6+lean,yy+8,x+11+lean,yy+11,sk)
 local hx,hy=x+8+lean,yy+4+bob
 if anim=="hit" or anim=="stumble" then hy+=1 hx+=-face end
 circfill(hx,hy,8,0)
 circfill(hx,hy,7,sk)
 if gold then
  circfill(hx,hy-3,6,0)
  rectfill(hx-5,hy-1,hx+5,hy+3,sk)
  line(hx-7,hy,hx-7,hy+3,5)
  line(hx+7,hy,hx+7,hy+3,5)
  line(hx-4,hy-1,hx-1,hy-2,0)
  line(hx+1,hy-2,hx+4,hy-1,0)
  if anim!="hit" and anim!="crumple" then line(hx-1,hy+3,hx+4,hy+2,8) end
  pset(hx-7,hy+1,10) pset(hx+7,hy+1,10)
 else
  for i=-3,3 do
   line(hx+i*2,hy-4,hx+i*2,hy-8-(abs(i)%2),0)
  end
  circfill(hx,hy-3,5,0)
  line(hx-5,hy-1,hx-1,hy-3,0)
  line(hx+1,hy-3,hx+5,hy-1,0)
  if phase==2 and anim!="flinch" then
   rectfill(hx-3,hy+2,hx+3,hy+4,0)
   line(hx-2,hy+3,hx+2,hy+3,7)
  else
   line(hx-2,hy+3,hx+3,hy+3,0)
  end
 end
 if anim=="hit" or anim=="crumple" or anim=="stumble" then
  print("x",hx-4,hy,8)
  print("x",hx+1,hy,8)
 elseif anim=="flinch" then
  line(hx-4,hy+1,hx-1,hy,0)
  line(hx+1,hy,hx+4,hy+1,0)
 else
  rectfill(hx-4,hy,hx-1,hy+2,7)
  rectfill(hx+1,hy,hx+4,hy+2,7)
  pset(hx-3+(face>0 and 1 or 0),hy+1,0)
  pset(hx+2+(face>0 and 1 or 0),hy+1,0)
 end
 if phase==2 and b and b.atier and b.atier>=3 then
  local ix=face>0 and gx1+6 or gx1-6
  circfill(ix,gy,2+b.atier%3,7)
  pset(ix,gy,10)
 end
end

function dwell(b,ox,oy)
 rectfill(ox-3,oy-3,ox+cols*cell+2,oy+rows*cell+2,0)
 rectfill(ox-2,oy-2,ox+cols*cell+1,oy+rows*cell+1,7)
 rectfill(ox-1,oy-1,ox+cols*cell,oy+rows*cell,1)
 local pulse=flr(t()/8)%2==0 and 2 or 1
 rectfill(ox+killcol*cell,oy,ox+killcol*cell+cell-1,oy+rows*cell-1,pulse)
 local rects,seen=find_pow(b.g)
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=b.g[x][y]
   if not isempty(v) then
    if not (ispow(v) and seen[x+y*cols]) then
     dgem(ox+x*cell,oy+y*cell,v)
    end
   else
    pset(ox+x*cell+2,oy+y*cell+2,0)
   end
  end
 end
 for r in all(rects) do
  dpow_block(ox,oy,r[1],r[2],r[3],r[4],r[5])
 end
 for f in all(b.flash) do
  rectfill(ox+f[1]*cell,oy+f[2]*cell,ox+f[1]*cell+5,oy+f[2]*cell+5,7)
  circfill(ox+f[1]*cell+3,oy+f[2]*cell+3,5,10)
 end
 if b.piece and not b.resolving then
  local p=b.piece
  local x1,y1,x2,y2=pcells(p)
  dgem(ox+x1*cell,oy+y1*cell,p.a==99 and 99 or p.a)
  dgem(ox+x2*cell,oy+y2*cell,p.b==99 and 99 or p.b)
  local gy=p.y
  while pok(b.g,p,p.x,gy+1,p.rot) do gy+=1 end
  if gy!=p.y then
   local t={a=p.a,b=p.b,x=p.x,y=gy,rot=p.rot}
   local a1,b1,a2,b2=pcells(t)
   rect(ox+a1*cell,oy+b1*cell,ox+a1*cell+5,oy+b1*cell+5,5)
   rect(ox+a2*cell,oy+b2*cell,ox+a2*cell+5,oy+b2*cell+5,5)
  end
 end
 if b.pend_in>0 then
  rectfill(ox-2,oy-12,ox+cols*cell+1,oy-4,0)
  rect(ox-2,oy-12,ox+cols*cell+1,oy-4,8)
  print("caution "..b.pend_in,ox,oy-10,8)
 end
 if b.combo_t and b.combo_t>0 then
  print(b.combo_txt,ox+8,oy+20,10)
 end
end

function dnext(b,ox,oy,name,col)
 rectfill(ox,oy,ox+20,oy+30,0)
 rect(ox,oy,ox+20,oy+30,7)
 print("next",ox+2,oy+1,col)
 if b and b.nx then
  dgem(ox+7,oy+9,b.nx[1]==99 and 99 or b.nx[1])
  dgem(ox+7,oy+16,b.nx[2]==99 and 99 or b.nx[2])
 end
 rectfill(ox-1,oy+32,ox+21,oy+40,0)
 rect(ox-1,oy+32,ox+21,oy+40,col)
 print(sub(name,1,6),ox,oy+34,col)
end

function dscore(sc,ox,oy,col)
 rectfill(ox,oy,ox+38,oy+15,0)
 rectfill(ox+1,oy+1,ox+37,oy+14,2)
 rect(ox,oy,ox+38,oy+15,col)
 print("score",ox+5,oy+2,col)
 local s=tostr(flr(sc or 0))
 while #s<6 do s="0"..s end
 print(s,ox+5,oy+8,7)
end

function dstage()
 local x0,x1=39,89
 for i=0,8 do
  rectfill(x0,18+i*4,x1,21+i*4,1+(i%2))
 end
 for i=0,5 do
  local c=({8,14,12,10,11,9})[i+1]
  rectfill(x0+3+i*8,30,x0+9+i*8,48,c)
  rectfill(x0+4+i*8,32,x0+6+i*8,34,7)
 end
 rectfill(x0,72,x1,90,5)
 rectfill(x0,72,x1,74,6)
 rectfill(x0+3,76,x1-3,88,2)
 line(x0+3,80,x1-3,80,14)
 line(x0+3,84,x1-3,84,8)
 for i=0,12 do
  circfill(x0+4+i*4,68+sin(i*0.7+t()/40),2,0)
 end
end

function draw_fx()
 for f in all(fx) do
  if f.k=="beam" then
   local t=1-f.t/16
   local x=f.x+(f.e-f.x)*t
   circfill(x,f.y,2,7)
   circfill(x,f.y,1,10)
  elseif f.k=="impact" then
   local r=flr((8-f.t)/2)+f.e
   circ(f.x,f.y,r,7)
   circ(f.x,f.y,max(0,r-2),10)
  end
 end
 for p in all(parts) do
  pset(flr(p.x),flr(p.y),p.c)
 end
end

function draw_fight()
 local sx=shake>0 and rnd(shake*2)-shake or 0
 local sy=shake>0 and rnd(shake*2)-shake or 0
 camera(-sx,-sy)
 cls(0)
 rectfill(0,0,0,127,14)
 rectfill(127,0,127,127,8)
 dstage()
 local f1,f2=fighters[p1.fid],fighters[p2.fid]
 rectfill(42,0,85,15,0)
 rect(42,0,85,15,10)
 print("ring",54,2,10)
 print("rush",56,8,14)
 dnext(p1,18,0,f1.short,14)
 dnext(p2,90,0,f2.short,8)
 rectfill(108,1,125,9,0)
 rect(108,1,125,9,12)
 print("go",113,3,12)
 dwell(p1,w1x,w1y)
 dwell(p2,w2x,w2y)
 dchibi(p1.fid,40,50,p1)
 dchibi(p2.fid,68,50,p2)
 dscore(p1.score,18,102,14)
 rectfill(56,104,71,114,0)
 rect(56,104,71,114,10)
 print("vs",60,107,10)
 dscore(p2.score,74,102,8)
 rectfill(0,121,127,127,0)
 print("z rot  x drop  arrows move",8,122,5)
 if pause then
  rectfill(40,52,88,72,0)
  rect(40,52,88,72,10)
  print("paused",50,60,7)
 end
 camera()
 draw_fx()
 if hitstop>4 then
  for i=0,20 do pset(rnd(128),rnd(128),7) end
 end
end

function draw_title()
 cls(0)
 for i=0,5 do
  for j=0,4 do
   dgem(2+i*6,88+j*6,mkn(1+(i+j)%4))
   dgem(90+i*6,88+j*6,(j==2 and mkc or mkn)(1+(i+j+1)%4))
  end
 end
 rectfill(16,8,111,72,0)
 rect(16,8,111,72,7)
 rect(18,10,109,70,10)
 print("ring rush",44,16,10)
 print("puzzle fighters",30,26,14)
 print("crash  power  counters",22,40,6)
 print("trap gym edition",32,50,5)
 if flr(t()/12)%2==0 then print(">> press z <<",38,60,7) end
 dchibi(1,28,68,{anim="cross",af=6,face=1,atier=2})
 dchibi(2,76,68,{anim="upper",af=8,face=-1,atier=3})
 print(fighters[1].short,22,118,14)
 print(fighters[2].short,80,118,8)
end

function draw_select()
 cls(1)
 rectfill(0,0,127,12,0)
 print("select fighter",34,3,10)
 for i=1,2 do
  local f=fighters[i]
  local x=3+(i-1)*64
  local on=sel==i
  local col=i==1 and 10 or 8
  rectfill(x,16,x+60,106,0)
  rect(x,16,x+60,106,on and col or 5)
  if on then rect(x+1,17,x+59,105,col) end
  for j=1,6 do
   rectfill(x+6+(j-1)*8,22,x+12+(j-1)*8,28,gpal[f.pat[j]])
  end
  dchibi(i,x+18,40,{anim=on and "special" or "idle",af=on and flr(t()/3)%12 or 0,face=1,atier=on and 4 or 0})
  print(f.name,x+3,90,7)
  print(f.tag,x+3,98,on and col or 6)
 end
 print("left/right   z lock in",20,114,6)
end

function draw_result()
 cls(0)
 local wid=winner==1 and p1.fid or p2.fid
 local w=fighters[wid]
 for i=0,30 do
  dgem((i*19+flr(t()*2))%120,(i*11+flr(t()))%60,mkn(1+i%4))
 end
 rectfill(14,18,113,80,0)
 rect(14,18,113,80,7)
 rect(16,20,111,78,10)
 print("k.o.",56,26,8)
 print(w.name,22,40,10)
 print("wins!",52,50,7)
 print('"'..w.quote..'"',12,62,w.ac or 14)
 dchibi(wid,52,78,{anim="super",af=14,face=1,atier=5})
 print("z title",48,118,5)
end

function _init()
 scene="title"
 music(3)
end

function _update()
 if hitstop>0 then
  hitstop-=1
  if hitstop%2==0 then
   if p1 then upd_anim(p1) end
   if p2 then upd_anim(p2) end
  end
  return
 end
 if shake>0 then shake-=0.5 end
 local i=1
 while i<=#parts do
  local p=parts[i]
  p.x+=p.dx
  p.y+=p.dy
  p.dy+=0.15
  p.life-=1
  if p.life<=0 then deli(parts,i) else i+=1 end
 end
 i=1
 while i<=#fx do
  fx[i].t-=1
  if fx[i].t<=0 then deli(fx,i) else i+=1 end
 end
 if p1 then
  upd_anim(p1)
  if p1.combo_t and p1.combo_t>0 then p1.combo_t-=1 end
 end
 if p2 then
  upd_anim(p2)
  if p2.combo_t and p2.combo_t>0 then p2.combo_t-=1 end
 end
 if scene=="title" then
  if btnp(4) or btnp(5) then sfx(4) scene="select" end
 elseif scene=="select" then
  if btnp(0) then sel=1 sfx(4) end
  if btnp(1) then sel=2 sfx(4) end
  if btnp(4) or btnp(5) then
   p1_fid=sel
   p2_fid=sel==1 and 2 or 1
   sfx(9)
   start_fight()
  end
 elseif scene=="fight" then
  if btnp(6) then pause=not pause end
  if pause then return end
  if p1.resolving then finish_res(p1,p2) end
  if p2.resolving then finish_res(p2,p1) end
  if not p1.resolving and not p2.resolving then
   upd_board(p1,false)
   upd_board(p2,true)
  end
  if p1.dead or p2.dead then
   winner=p1.dead and 2 or 1
   if p1.dead then p1.anim="crumple" p1.af=0 end
   if p2.dead then p2.anim="crumple" p2.af=0 end
   scene="result"
   music(-1)
   sfx(9)
  end
 elseif scene=="result" then
  if btnp(4) or btnp(5) then scene="title" music(3) end
 end
end

function _draw()
 if scene=="title" then draw_title()
 elseif scene=="select" then draw_select()
 elseif scene=="fight" then draw_fight()
 elseif scene=="result" then draw_result()
 end
end
'''

def note(p, w, v, e=0):
    return f"{p:02x}{w:x}{v:x}{e:x}"


def sfx_line(notes, speed=12):
    body = "".join(notes)
    body = (body + "00000" * 32)[:160]
    return f"00{speed:02x}0000{body}"


def build_sfx():
    kick = [
        note(12, 0, 5, 5) if i % 8 == 0 else (note(8, 0, 3, 0) if i % 8 == 1 else note(0, 0, 0, 0))
        for i in range(32)
    ]
    hats = []
    for i in range(32):
        if i % 2:
            hats.append(note(40, 6, 3 if i % 4 == 1 else 2, 0))
        else:
            hats.append(note(36, 6, 2, 0) if i % 4 == 0 else note(0, 0, 0, 0))
    bp = [12, 12, 0, 0, 10, 10, 0, 0, 8, 8, 0, 0, 10, 10, 0, 0] * 2
    bass = [note(p, 1, 4, 0) if p else note(0, 0, 0, 0) for p in bp]
    mp = [24, 0, 27, 0, 24, 0, 0, 0, 22, 0, 24, 0, 19, 0, 0, 0, 24, 0, 27, 0, 29, 0, 0, 0, 27, 0, 24, 0, 22, 0, 0, 0]
    mel = [note(p, 4, 3, 2) if p else note(0, 0, 0, 0) for p in mp]
    blip = [note(36, 4, 4, 0), note(40, 4, 3, 0)] + [note(0, 0, 0, 0)] * 30
    boom = [note(10, 0, 5, 5), note(6, 0, 4, 5), note(4, 2, 3, 0)] + [note(0, 0, 0, 0)] * 29
    lock = [note(30, 5, 3, 0), note(24, 5, 2, 0)] + [note(0, 0, 0, 0)] * 30
    chain = [note(28, 4, 3, 0), note(32, 4, 4, 0), note(36, 4, 5, 0), note(40, 4, 4, 0)] + [note(0, 0, 0, 0)] * 28
    punch = [note(20, 0, 4, 0), note(16, 0, 5, 5)] + [note(0, 0, 0, 0)] * 30
    super_ = [note(12, 4, 5, 0), note(16, 4, 5, 0), note(20, 4, 5, 0), note(28, 4, 5, 2), note(36, 4, 4, 2)] + [
        note(0, 0, 0, 0)
    ] * 27
    hit = [note(8, 6, 4, 0), note(4, 6, 3, 0)] + [note(0, 0, 0, 0)] * 30
    lines = [
        sfx_line(kick, 12),
        sfx_line(hats, 12),
        sfx_line(bass, 12),
        sfx_line(mel, 12),
        sfx_line(blip, 8),
        sfx_line(boom, 8),
        sfx_line(lock, 8),
        sfx_line(chain, 8),
        sfx_line(punch, 6),
        sfx_line(super_, 6),
        sfx_line(hit, 6),
    ]
    empty = "00100000" + "0" * 160
    while len(lines) < 64:
        lines.append(empty)
    return "\n".join(lines) + "\n"


def main():
    sfx = build_sfx()
    music_lines = [
        "01 00010203",
        "00 00010203",
        "02 00010203",
        "01 01030000",
        "00 01030000",
        "02 01030000",
    ] + ["00 40414243"] * 58
    gfx = ("0" * 128 + "\n") * 128
    gff = "0" * 256 + "\n"
    mmap = "0" * 256 + "\n"
    cart = (
        "pico-8 cartridge // http://www.pico-8.com\n"
        "version 42\n"
        "__lua__\n"
        + LUA.strip()
        + "\n__gfx__\n"
        + gfx
        + "__gff__\n"
        + gff
        + "__map__\n"
        + mmap
        + "__sfx__\n"
        + sfx
        + "__music__\n"
        + "\n".join(music_lines)
        + "\n"
    )
    OUT.write_text(cart, encoding="utf-8", newline="\n")
    print(f"wrote {OUT} ({len(cart)} bytes)")


if __name__ == "__main__":
    main()
