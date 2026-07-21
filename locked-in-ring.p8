pico-8 cartridge // http://www.pico-8.com
version 42
__lua__
defs={
 {ab="ab",nm="a.b. problem",rl="power",art=1,ed=13,tr=2,gl=13,hi=7,sk=4,sm=100,spd=0,dm=0,rg=.92},
 {ab="dg",nm="d. great",rl="speed",art=2,ed=11,tr=3,gl=11,hi=7,sk=4,sm=100,spd=1,dm=.16,rg=1.06},
 {ab="ck",nm="callout king",rl="pressure",art=2,ed=8,tr=8,gl=8,hi=10,sk=4,sm=104,spd=1,dm=.1,rg=1.04},
 {ab="sg",nm="studio guest",rl="wildcard",art=1,ed=12,tr=12,gl=12,hi=6,sk=4,sm=102,spd=1,dm=.08,rg=1.05},
 {ab="lc",nm="legend coach",rl="veteran",art=1,ed=10,tr=9,gl=10,hi=7,sk=4,sm=95,spd=0,dm=.04,rg=.96},
 {ab="tl",nm="tall lightwt",rl="outside",art=2,ed=14,tr=14,gl=14,hi=7,sk=4,sm=101,spd=1,dm=.07,rg=1.02}
}

bags={
 {ab="speed",nm="speed bag",rl="rhythm",hp=72,tm=30,sw=1.35,wk=1,col=8},
 {ab="heavy",nm="heavy bag",rl="power",hp=150,tm=40,sw=.72,wk=2,col=2},
 {ab="wreck",nm="wreck bag",rl="switch",hp=220,tm=50,sw=.9,wk=0,col=5}
}

mvs={
 {ln=1,wd=4,re=7,st=3,d=6,gd=4,hy=7,sk=4},
 {ln=1,wd=7,re=11,st=6,d=11,gd=8,hy=11,sk=8},
 {ln=0,wd=5,re=9,st=4,d=7,gd=5,hy=8,sk=10},
 {ln=0,wd=7,re=11,st=6,d=10,gd=7,hy=11,sk=12},
 {ln=1,wd=7,re=12,st=7,d=12,gd=9,hy=13,sk=8},
 [7]={ln=1,wd=6,re=10,st=5,d=9,gd=7,hy=10,sk=7},
 [8]={ln=1,wd=9,re=14,st=8,d=14,gd=11,hy=16,sk=9}
}
rch={29,32,29,23,19,0,25,30}
opt={35,36,34,29,28,0,30,36}
anm={"jab","straight","body jab","body hook","uppercut","feint","lead hook","overhand"}
rr={0,1,0,1,1,0,0,1}
wx={5,-8,3,-5,-5,13,-2,-9}
wy={39,32,25,25,22,34,35,56}
ry={49,48,27,27,51,34,47,45}
cmb={[12]=1,[13]=1,[17]=1,[32]=1,[37]=1,[24]=1,[27]=1,[72]=1,[74]=1,[78]=1,[45]=1,[48]=1}

function z(f,s)
 for k in all(split(s)) do f[k]=0 end
end

function mkb(i,sd,ai)
 local d=defs[i]
 local f={
  id=i,ab=d.ab,sd=-1,sm=d.sm,
  dm=d.dm,rg=d.rg,spd=d.spd,hmul=1
 }
 z(f,"acc,hy,ct,wind,rec,atk,aln,stun,q,fe,link,vx,mv,co,tz,chain,shake,ds,dd,la")
 f.st=f.sm
 return f
end

function clamp(v,a,b)
 if v<a then return a end
 if v>b then return b end
 return v
end

function fast_hook()
 return peek(0x5fff)==1
end

function title_mode()
 mode=0
 cam=0 fl=0
 p=nil
 rescode=0
 stop_beat()
end

function new_run()
 run_n+=1
 srand(2048+run_n*37+sel*101+bag*53)
 p=mkb(sel)
 challenge_init()
end

function start_beat()
 sfx(8,0) sfx(9,1) sfx(10,2)
end

function stop_beat()
 sfx(-1,0) sfx(-1,1) sfx(-1,2)
end

function weak_zone()
 return bags[bag].wk>0 and bags[bag].wk or flr(fr/75)%2+1
end

function challenge_init()
 local d=bags[bag]
 mode=3
 bhm=d.hp bhp=bhm
 rt=fast_hook() and 300 or d.tm*30
 score=0 shots=0 hits=0 clear=0
 ba=0 bv=0 bx=88 bflash=0 br=0
 p.x=43 p.vx=0 p.mv=0 p.st=p.sm
 z(p,"wind,rec,atk,aln,stun,q,fe,link,co,tz,chain,shake,ds,dd")
 bell=18
 ht=0 hs=0 cam=0 fl=0
 tapd=0 tapt=-20 held=0 fresh=0
 rescode=0
 start_beat()
 sfx(0,3)
end

function finish(win)
 mode=4
 rescode=win and 1 or 2
 local par=bhm*14
 grade=not win and "d" or score>par and "s" or score>par*.72 and "a" or "b"
 stop_beat()
 sfx(win and 7 or 6,3)
end

function human_ctl()
 local mv=0
 if btn(1) then mv=1 elseif btn(0) then mv=-1 end
 local dp=mv!=0 and mv!=held and mv or 0
 held=mv fresh=dp
 if dp!=0 then
  if tapd==dp and fr-tapt<9 and p.st>=3 then p.ds=5 p.dd=dp p.st-=3 end
  tapd=dp tapt=fr
 end
 local a=0
 if btnp(4) then a=btn(2) and 6 or btn(3) and 3 or btn(1) and 7 or 1 end
 if btnp(5) then a=btn(2) and 5 or btn(3) and 4 or btn(1) and 8 or 2 end
 return mv,a
end

function begin_atk(f,a)
 if a==6 then
  htxt=anm[a] ht=18
  if f.st<1 then return end
  f.st-=1 f.atk=6 f.aln=1 f.wind=3
  return
 end
 local co=f.link>0 and cmb[f.la*10+a]
 f.co=co and 1 or 0
 htxt=(co and "combo " or "")..anm[a] ht=18
 local m=mvs[a]
 local cost=m.st
 if f.st<cost then
  f.rec=5
  return
 end
 f.st-=cost
 shots+=1
 f.atk=a
 f.aln=m.ln
 if co then
  f.x=min(f.x+2,bx-26)
 end
 if rng<2 then f.vx=-f.sd*(a==2 and .8 or a>3 and .55 or .4) end
 local wd=max(2,m.wd-flr(f.acc*8))
 if rng==2 and a>1 then wd+=1 end
 if f.fe>0 or co then wd=max(2,wd-2) end
 f.wind=wd
end

function miss(t)
 htxt=t ht=18
 p.tz=10 p.link=0 p.la=0 p.co=0
 sfx(3,3)
end

function hit_bag()
 local a=p.atk
 local m=mvs[a]
 if not m then return end
 local gap=bx-p.x
 if gap>rch[a]+9 then
  miss("out of range")
  return
 end
 if bag==1 and m.ln==0 then
  miss("too low")
  return
 end
 local mult=1
 local fin=p.co>0 and (a==5 or a==8) and p.chain>=2
 local sweet=m.ln==weak_zone()
 if p.fe>0 then mult+=.15 p.fe=0 end
 if p.co>0 then mult+=.1 end
 if fin then mult+=.18 end
 mult*=sweet and 1.3 or .78
 mult*=max(.55,1-abs(gap-opt[a])*.07)
 mult*=.8+.2*p.st/p.sm
 local dmg=m.d*(1+p.dm)*mult
 bhp=max(0,bhp-dmg)
 hits+=1
 if fr-p.ct<40 then p.chain+=1 else p.chain=1 end
 p.ct=fr p.la=a
 p.link=(a==5 or a==8) and 0 or 20
 p.hy=min(100,p.hy+m.hy)
 score+=flr(dmg*12)+p.chain*8
 bv+=(m.d*.04+.28)*bags[bag].sw
 bflash=6 hs=fin and 7 or a>1 and 5 or 3
 cam=fin and 8 or a>1 and 4 or 2
 fl=fin and 3 or a>1 and 2 or 1
 htxt=fin and "demolition combo!" or sweet and "sweet spot!" or "glancing"
 ht=22
 sfx(a>1 and 2 or 1,3)
 if bhp<=0 then
  clear=45 score+=flr(rt/3)
  p.link=0 p.vx=-2
 end
end

function step_box(mv,a)
 if p.fe>0 then p.fe-=1 end
 if p.link>0 then p.link-=1 end
 if p.shake>0 then p.shake-=1 end
 if p.tz>0 and p.tz%2==1 then
  if a>0 then p.q=a end
  return 0
 end
 if p.stun>0 then
  p.stun-=1
  return mv
 end
 if p.rec>0 then
  p.rec-=1
  if a>0 and p.rec<=5 then p.q=a end
 else
  if p.q>0 then a=p.q p.q=0 end
  if a>0 and p.wind<=0 then begin_atk(p,a) end
 end
 if p.wind>0 then
  p.wind-=1
  if p.wind==0 then
   if p.atk==6 then
    p.fe=20 p.rec=2 sfx(5,3)
   else
    hit_bag()
    local rec=mvs[p.atk].re
    p.rec=max(3,rec-(p.co>0 and 2 or p.chain>1 and 1 or 0))
   end
  end
 end
 local regen=.25
 if rng==0 then regen+=.18 end
 p.st=min(p.sm,p.st+regen*p.rg)
 return mv
end

function move_box(f,mv,lo,hi)
 local burst=0
 if f.ds>0 and f.wind+f.rec+f.stun==0 then
  burst=f.dd*1.45 f.ds-=1
 else f.ds=0 end
 local pace=mv==-f.sd and 1 or .84
 local t=f.wind+f.rec+f.stun==0 and (mv*pace+burst)*(f.tz>0 and .35 or 1) or 0
 local grip=.3+.24*f.st/f.sm+.04*f.spd
 f.vx+=(t-f.vx)*grip
 if t==0 then f.vx*=.55 end
 if abs(f.vx)<.04 then f.vx=0 end
 local nx=clamp(f.x+f.vx*(.75+.4*f.st/f.sm+.1*f.spd),lo,hi)
 if nx==lo or nx==hi then f.vx*=.25 end
 f.x=nx
 f.mv=abs(f.vx)>.12 and sgn(f.vx) or 0
end

function fight_tick()
 if cam>0 then cam-=1 end
 if fl>0 then fl-=1 end
 if bell>0 then bell-=1 end
 if ht>0 then ht-=1 end
 if bflash>0 then bflash-=1 end
 if br>0 then br-=1 end
 if clear>0 then
  clear-=1
  ba+=bv bv*=.9
  if clear==0 then finish(true) end
  return
 end
 fr+=1
 if p.tz>0 then p.tz-=1 end
 local pm,pa=human_ctl()
 if hs>0 then
  if pa>0 then p.q=pa end
  hs-=1
  return
 end
 if peek(0x5fff)!=2 then rt-=1 end
 bv-=ba*.045 bv*=.965
 ba=clamp(ba+bv,-9,12) bx=88+ba
 move_box(p,pm,18,bx-26)
 rng=bx-p.x>48 and 0 or bx-p.x>34 and 1 or 2
 step_box(pm,pa)
 if bag>1 and br==0 and bv<-.32 and bx-p.x<39 and p.stun==0 then
  p.stun=6 p.st=max(0,p.st-7) p.x=max(18,p.x-4)
  score=max(0,score-50) bv=abs(bv)*.35 br=18
  htxt="return hit!" ht=22 cam=4
  sfx(6,3)
 end
 if rt<=0 then finish(false) end
end

function upd_title()
 if btnp(4) then mode=1 sfx(5,3) end
end

function upd_select()
 if btnp(0) then sel=sel==1 and #defs or sel-1 sfx(5,3) end
 if btnp(1) then sel=sel==#defs and 1 or sel+1 sfx(5,3) end
 if btnp(4) then mode=2 sfx(5,3) end
 if btnp(5) then title_mode() end
end

function upd_bags()
 if btnp(0) then bag=bag==1 and #bags or bag-1 sfx(5,3) end
 if btnp(1) then bag=bag==#bags and 1 or bag+1 sfx(5,3) end
 if btnp(4) then new_run() end
 if btnp(5) then mode=1 end
end

function upd_result()
 if btnp(4) then new_run() end
 if btnp(5) then mode=2 stop_beat() end
end

function gpio()
 local q={
  mode,sel or 0,bag or 0,
  p and flr(p.st) or 0,bhp and flr(bhp) or 0,bhm or 0,rescode or 0,
  p and p.atk or 0,p and p.wind or 0,p and p.rec or 0,p and p.fe or 0,
  p and p.mv+1 or 1,p and flr(p.x) or 0,flr(bx or 0),p and p.chain or 0,
  score or 0,rt or 0,mode==3 and weak_zone() or 0,shots or 0,hits or 0,clear or 0,
  hs or 0,p and p.ds or 0,p and p.stun or 0,p and p.co or 0,p and p.tz or 0
 }
 for i=1,#q do poke(0x5f7f+i,q[i]) end
end

function _init()
 run_n=0
 sel=1
 bag=1
 fr=0
 title_mode()
end

function _update()
 gpio()
 if mode==0 then upd_title()
 elseif mode==1 then upd_select()
 elseif mode==2 then upd_bags()
 elseif mode==3 then fight_tick()
 elseif mode==4 then upd_result() end
end

function btxt(s,x,y,c)
 print(s,x+1,y,1)
 print(s,x,y,c)
end

function panel(x0,y0,x1,y1,edge,fill)
 rectfill(x0,y0,x1,y1,fill)
 rect(x0,y0,x1,y1,edge)
end

function ring_bg()
 cls(0)
 rectfill(0,20,127,73,1)
 for y=24,68,8 do line(0,y,127,y,5) end
 for x=4,124,12 do line(x,20,x,46,5) end
 rectfill(34,21,94,72,0)
 rect(33,20,95,73,5)
 for x=40,90,10 do line(x,22,x,71,1) end
 for x=13,115,51 do
  line(x,20,x,28,5)
  circfill(x,30,3,7)
  line(x-7,33,x+7,33,6)
 end
 rectfill(8,24,20,47,0) rectfill(10,27,18,45,8)
 rectfill(108,24,120,47,0) rectfill(110,27,118,45,4)
 for row=0,1 do
  for i=0,15 do
   local x=-2+i*9+row*4
   local y=55+row*8-(i%3)
   local sk=(i+row)%3==0 and 4 or (i+row)%3==1 and 9 or 15
   circfill(x,y,2,sk)
   rectfill(x-3,y+2,x+3,y+7,row==0 and 1 or 5)
   if (i+row)%4==0 then pset(x+2,y-3,7) end
  end
 end
 rectfill(0,74,127,110,5)
 line(0,76,127,76,6)
 for y=82,106,8 do line(0,y,127,y,6) end
 for x=4,124,15 do line(64,74,x,110,6) end
 rectfill(0,69,127,73,0)
 for x=0,127,16 do line(x,73,x+8,69,10) end
 circ(30,94,7,6) circ(30,94,4,6)
 line(23,94,37,94,6) line(30,87,30,101,6)
end

function ring_front()
 line(0,109,127,109,0)
 rectfill(0,110,127,114,1)
 line(0,110,127,110,7)
 for x=0,127,12 do line(x,114,x+6,110,10) end
end

function portrait(id,x,y,flip)
 local d=defs[id]
 panel(x,y,x+16,y+17,d.ed,1)
 pal(4,d.sk or 4)
 if d.art==1 then pal(2,d.tr) pal(13,d.gl)
 else pal(3,d.tr) pal(11,d.hi) end
 palt(14,true) palt(0,false)
 sspr((d.art-1)*16,64,16,16,x+1,y+1,15,15,flip)
 palt() pal()
end

function meter(x,y,w,v,m,c,rev)
 rectfill(x,y,x+w,y+4,0)
 rect(x,y,x+w,y+4,5)
 local n=flr((w-2)*clamp(v,0,m)/m)
 if rev then rectfill(x+w-n,y+1,x+w-1,y+3,c)
 else rectfill(x+1,y+1,x+n,y+3,c) end
end

function limb(x1,y1,x2,y2,c,h,s)
 local v=abs(x2-x1)>abs(y2-y1)
 local px=v and 0 or 1
 local py=v and 1 or 0
 line(x1-px*2,y1-py*2,x2-px*2,y2-py*2,0)
 line(x1+px*2,y1+py*2,x2+px*2,y2+py*2,0)
 for i=-1,1 do line(x1+px*i,y1+py*i,x2+px*i,y2+py*i,c) end
 line(x1+px,y1+py,x2+px,y2+py,s)
 line(x1-px,y1-py,x2-px,y2-py,h)
 circfill(x1,y1,1,c)
 circfill(x2,y2,1,c)
end

function joint(x1,y1,x2,y2,c,h,s,b)
 local mx=(x1+x2)/2
 local my=(y1+y2)/2+abs(b)
 mx+=b
 limb(x1,y1,mx,my,c,h,s)
 limb(mx,my,x2,y2,c,h,s)
 circfill(mx,my,2,0)
 circfill(mx,my,1,c)
 pset(mx-1,my-1,h)
end

function draw_glove(x,y,r,c,h,d)
 circfill(x,y,r+1,0)
 circfill(x,y,r,c)
 line(x-d*(r-2),y-r+1,x+d,y-r+1,h)
 pset(x+d*2,y-1,h)
 circfill(x-d*(r-1),y+2,1,0)
 pset(x-d*(r-1),y+1,c)
 rectfill(x-d*(r+3),y-2,x-d*(r+1),y+2,0)
 rectfill(x-d*(r+2),y-1,x-d*(r+1),y+1,h)
end

function draw_boxer(id,x,y,dir,guard,wind,rec,atk,down,sl,shake,mv,stun,bl,bi,ds,inside)
 local d=defs[id]
 local dash=ds and ds>0
 local walk=mv and mv~=0 or dash
 local step=walk and flr(fr/(dash and 1 or 2))%4 or 0
 local bob=wind+rec==0 and (walk and step%2 or flr(fr/10)%2) or 0
 local lean=sl>0 and -dir*7 or stun and stun>0 and -dir*(3+min(4,stun)) or 0
 local crouch=sl>0 and 3 or 0
 local rear=rr[atk]==1
 if dash then lean+=mv*3 crouch=1 end
 if inside and wind+rec==0 and sl==0 then
  lean-=dir
  crouch=max(crouch,1)
 end
 if guard>0 then
  lean-=dir*(bl and bl>0 and 4 or 1)
  if guard==2 then crouch=max(crouch,2) end
 end
 if bi and bi>0 then lean-=dir*(1+bi%2) end
 local ext=0
  if rec>0 and atk>0 and atk~=6 then
   local rm=mvs[atk].re
   ext=rec>=rm-2 and 1 or max(.18,(rec-1)/(rm-3))
   lean+=dir*flr(ext*(atk==2 and 7 or atk==8 and 6 or atk==5 and 5 or rear and 4 or 3))
  elseif wind>0 and atk>0 then
   lean-=dir*(atk==2 and 3 or atk==4 and 2 or 1)
   if atk==4 then crouch=2 elseif atk==5 then crouch=4 end
 end
 x+=shake>0 and shake%2*dir or 0
 y+=bob
 local skin=d.sk or 4
 local trunks=d.tr
 local glove=d.gl
 local ghi=d.hi
 rectfill(x-10,y+1,x+10,y+3,0)
 line(x-12,y+2,x+12,y+2,0)
 if down>0 then
  rectfill(x-11,y-5,x+7,y+1,0)
  rectfill(x-9,y-4,x+3,y,trunks)
  limb(x-7,y-1,x-13,y+2,skin,15,5)
  circfill(x+10,y-3,6,0) circfill(x+10,y-3,5,skin)
  circfill(x-13,y+1,3,0) circfill(x-13,y+1,2,glove)
  return
 end
 pal(4,skin)
 if d.art==1 then pal(2,d.tr) pal(13,d.gl)
 else pal(3,d.tr) pal(11,d.hi) end
 palt(14,true) palt(0,false)
 sspr((d.art-1)*40,0,40,32,x-20+lean,y-64+crouch,40,32,dir<0)
 local pivot=rear and atk>1 and wind+rec>0
 local alt=step==2 or pivot
 local lx=alt and 80 or (d.art-1)*40
 local ly=alt and 64+(d.art-1)*32 or step%2==1 and 80 or 32
 sspr(lx,ly,40,32,x-20,y-32,40,32,dir<0)
 palt() pal()
 local ux=x+lean
 local uy=y+crouch
 local sy=uy-43
 local shi=skin==15 and 7 or 9
 local ssh=skin==15 and 9 or 5
 local g1x=ux+dir*1
 local g1y=uy-42
 local g2x=ux+dir*10
 local g2y=uy-35
 if inside and guard==0 and wind+rec==0 then
  g1x=ux-dir*2 g1y=uy-39
  g2x=ux+dir*6 g2y=uy-36
 end
 if guard==0 and wind+rec==0 then g1y-=flr(fr/5)%2 g2y+=flr(fr/5)%2 end
 if guard==1 then
  g1x=ux-dir*4 g1y=uy-35
  g2x=ux+dir*9 g2y=uy-34
 elseif guard==2 then
  g1x=ux-dir g1y=uy-28
  g2x=ux+dir*7 g2y=uy-27
  elseif wind>0 and atk>0 then
   local tx=ux+dir*wx[atk]
   local ty=uy-wy[atk]
  local load=1-wind/(atk==6 and 3 or mvs[atk].wd)
  if rear then
   g1x+=load*(tx-g1x) g1y+=load*(ty-g1y)
  else
   g2x+=load*(tx-g2x) g2y+=load*(ty-g2y)
  end
 elseif rec>0 and atk>0 and atk~=6 then
  local tx=ux+dir*rch[atk]
  local ty=uy-ry[atk]
  if rear then
   g1x+=ext*(tx-g1x) g1y+=ext*(ty-g1y)
  else
   g2x+=ext*(tx-g2x) g2y+=ext*(ty-g2y)
  end
 end
 local b1=-dir*3
 local b2=-dir*3
 if rec>0 and atk>0 and atk~=6 then
  local bend=(atk==4 or atk==7) and -dir*(5+flr(4*ext)) or (atk==5 or atk==8) and dir*(3+flr(3*ext)) or -dir*flr(3*(1-ext))
  if rear then b1=bend else b2=bend end
 elseif wind>0 and atk==5 then b1=dir*6 end
 local s1x=ux-dir*3+(rear and dir*flr(ext*(atk==2 and 5 or atk==8 and 6 or 3)) or 0)
 local s2x=ux+dir*4+(not rear and dir*flr(ext*(atk==7 and 4 or 2)) or -dir*flr(ext*2))
 local s1y=sy-((atk==5 or atk==8) and flr(ext*4) or 0)
 joint(s1x,s1y,g1x,g1y,skin,shi,ssh,b1)
 joint(s2x,sy,g2x,g2y,skin,shi,ssh,b2)
 local px=rear and g1x or g2x
 local py=rear and g1y or g2y
 if ext==1 then
  if atk==5 then
   line(px,py+9,px,py+4,ghi)
   line(px-dir*2,py+7,px-dir*2,py+3,glove)
   else
    line(px-dir*(atk==2 and 13 or 10),py,px-dir*4,py,ghi)
    line(px-dir*9,py+2,px-dir*3,py+2,glove)
   end
  end
 local gr=ext==1 and 4 or 3
 local r1=rear and gr or 3
 local r2=rear and 3 or gr
 draw_glove(g1x,g1y,r1,glove,ghi,dir)
 draw_glove(g2x,g2y,r2,glove,ghi,dir)
end

function bag_icon(k,x,y)
 line(x,y-9,x,y-5,6)
 if k==1 then
  line(x-6,y-6,x+6,y-6,5)
  circfill(x,y,5,0) circfill(x,y,4,8)
  line(x-2,y-2,x+2,y-2,10)
 else
  local w=k==3 and 7 or 6
  rectfill(x-w-1,y-5,x+w+1,y+9,0)
  rectfill(x-w,y-4,x+w,y+8,bags[k].col)
  line(x-w,y-2,x+w,y-2,10)
  line(x-w+2,y+6,x+w-2,y+6,6)
 end
end

function draw_bag()
 local x=flr(bx)
 if clear>0 then
  line(88,20,88,29,6)
  for i=0,8 do
   local dx=(i*17+clear*2)%38-19
   local dy=52+(i*11+45-clear)%45
   rectfill(x+dx,dy,x+dx+2,dy+2,i%2==0 and bags[bag].col or 7)
  end
  circ(x,70,18-clear%5,10)
  return
 end
 line(88,20,x,31,0) line(89,20,x+1,31,6)
 local ratio=bhp/bhm
 if bag==1 then
  line(x-8,32,x+8,32,0) line(x-7,31,x+7,31,6)
  line(x,32,x,47,6)
  circfill(x,53,7,0) circfill(x,53,6,bflash>0 and 10 or 8)
  line(x-3,50,x+3,50,10)
  if ratio<.45 then line(x-4,55,x+2,51,0) end
 else
  local w=bag==3 and 11 or 9
  local bot=bag==3 and 96 or 91
  rectfill(x-w-2,30,x+w+2,bot+2,0)
  rectfill(x-w,32,x+w,bot,bflash>0 and 10 or bags[bag].col)
  line(x-w+2,35,x+w-2,35,7)
  line(x-w,61,x+w,61,0)
  line(x-w+1,63,x+w-1,63,6)
  line(x-w+2,bot-5,x+w-2,bot-5,7)
  if ratio<.7 then
   line(x-5,44,x+1,51,0) line(x+1,51,x-3,58,0)
   rectfill(x+w-2,67,x+w+1,73,0)
  end
  if ratio<.35 then
   circfill(x-2,78,5,0)
   line(x-7,bot,x-3,bot+5,7) line(x+4,bot,x+8,bot+4,7)
  end
 end
 local ty=weak_zone()==1 and 53 or 78
 if fr%12<7 then circ(x,ty,bag==1 and 9 or 13,10) end
 if bflash>0 then
  circ(x,weak_zone()==1 and 53 or 78,16,7)
  line(x-18,65,x-12,65,7) line(x+12,65,x+18,65,7)
 end
end

function draw_f(f)
 if f.ds>0 then
  line(f.x-f.dd*18,83,f.x-f.dd*8,83,5)
  line(f.x-f.dd*15,90,f.x-f.dd*6,90,6)
  line(f.x-f.dd*14,104,f.x-f.dd*7,104,6)
  line(f.x-f.dd*11,106,f.x-f.dd*5,106,5)
  circfill(f.x-f.dd*12,105,1,7)
 end
 local inside=bx-f.x<30
 draw_boxer(f.id,f.x,105,-f.sd,0,f.wind,f.rec,f.atk,0,0,f.shake,f.mv,f.stun,0,0,f.ds,inside)
end

function hud()
 rectfill(0,0,127,20,0)
 line(0,20,127,20,5)
 if not p then return end
 portrait(p.id,0,1)
 panel(110,1,127,18,bags[bag].col,1)
 bag_icon(bag,119,9)
 print(p.ab,18,1,defs[p.id].ed)
 print(bags[bag].ab,88,1,bags[bag].col)
 meter(18,7,36,p.st,p.sm,12,false)
 meter(73,7,36,bhp,bhm,8,true)
 meter(18,13,36,p.hy,100,10,false)
 print(score,75,14,10)
 panel(56,1,71,19,10,1)
 local sec=max(0,flr((rt or 0)/30))
 print(sec<10 and "0"..sec or sec,60,7,7)
 print("sec",58,14,6)
end

function draw_title()
 ring_bg()
 draw_boxer(1,35,105,1,0,0,0,0,0,0,0)
 local ob,ox,oh,om,oc,of=bag,bx,bhp,bhm,clear,bflash
 bag=2 bx=93 bhp=100 bhm=150 clear=0 bflash=0
 draw_bag()
 bag=ob bx=ox bhp=oh bhm=om clear=oc bflash=of
 ring_front()
 rectfill(0,0,127,19,0)
 rectfill(9,2,118,4,8)
 btxt("locked-in bag break",27,7,10)
 print("gym demolition",39,14,6)
 btxt("press o",50,118,7)
end

function draw_select()
 ring_bg()
 btxt("choose your fighter",28,4,7)
 for i=1,#defs do
  local d=defs[i]
  local x=2+(i-1)%3*42
  local y=20+flr((i-1)/3)*34
  panel(x,y,x+39,y+31,sel==i and 10 or d.ed,0)
  portrait(i,x+2,y+3)
  print(d.ab,x+23,y+8,d.ed)
  if i>2 then print("g",x+31,y+15,6) end
  print(d.rl,x+4,y+24,sel==i and 10 or 7)
 end
 local d=defs[sel]
 panel(11,89,116,110,d.ed,0)
 btxt(d.nm,64-#d.nm*2,92,d.ed)
 print("fwd+o hook fwd+x overhand",10,101,10)
 print("up feint/upper down body",18,113,6)
 print("left/right select o bags x back",0,121,7)
end

function draw_bags()
 ring_bg()
 btxt("choose target",38,4,7)
 for i=1,#bags do
  local d=bags[i]
  local x=2+(i-1)*42
  panel(x,27,x+39,83,bag==i and 10 or d.col,0)
  bag_icon(i,x+20,48)
  print(d.ab,x+20-#d.ab*2,63,d.col)
  print(d.rl,x+20-#d.rl*2,70,bag==i and 10 or 7)
  print(d.tm.." sec",x+8,77,6)
 end
 local d=bags[bag]
 panel(12,89,115,109,d.col,0)
 btxt(d.nm,64-#d.nm*2,93,d.col)
 print("hit the flashing zone",24,102,10)
 print("left/right select o start x back",0,119,7)
end

function draw_fight()
 local cx=cam>0 and (cam%2*2-1)*(cam>4 and 2 or 1) or 0
 local cy=cam>4 and (flr(cam/2)%2*2-1) or 0
 camera(cx,cy)
 ring_bg()
 draw_bag()
 draw_f(p)
 ring_front()
 camera()
 if fl>0 then
  local fy=28+fl*3
  line(0,fy,127,fy,7)
  line(8,fy+29,119,fy+29,7)
  if fl>1 then line(0,fy+58,127,fy+58,6) end
 end
 hud()
 if bell>0 then panel(43,43,84,55,10,0) btxt("break it!",47,47,10) end
 if ht==0 then btxt(weak_zone()==1 and "high target" or "body target",4,24,10) end
 if p.chain>1 and fr-p.ct<30 then btxt(p.chain.." hit",95,27,10) end
 if ht>0 then btxt(htxt,64-#htxt*2,24,10) end
 if clear>0 then btxt("destroyed!",46,53,10) end
end

function draw_result()
 ring_bg()
 ring_front()
 draw_boxer(p.id,31,105,1,0,0,0,0,0,0,0)
 local win=rescode==1
 panel(24,27,119,83,win and 11 or 8,0)
 btxt(win and "bag cleared" or "time up",42,32,win and 11 or 8)
 print(bags[bag].nm,46,44,bags[bag].col)
 btxt("grade "..grade,49,54,10)
 print("score "..score,46,65,7)
 local acc=flr(100*hits/max(1,shots))
 print("accuracy "..acc.."%",42,74,6)
 print("o retry   x targets",29,116,7)
end

function _draw()
 gpio()
 if mode==0 then draw_title()
 elseif mode==1 then draw_select()
 elseif mode==2 then draw_bags()
 elseif mode==3 then draw_fight()
 elseif mode==4 then draw_result() end
end
__gfx__
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeee0000eeeeeeeeeeeeeeeeeeeeeeeeeeee000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeee05550550eeeeeeeeeeeeeeeeeeeeeeee00005555000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeee005005000eeeeeeeeeeeeeeeeeeeeee00055000005555400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeee00000000050eeeeeeeeeeeeeeeeeeeee065000e00004445550eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee000444444000eeeeeeeeeeeeeeeeeeeee000eee0000444444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee000444000000eeeeeeeeeeeeeeeeeeeeeeeee000504444000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee09f444447040eeeeeeeeeeeeeeeeeeeeeee0005509f444447040eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee099444444449eeeeeeeeeeeeeeeeeeeeee000500099444444449eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee094444494444eeeeeeeeeeeeeeeeeeeeee06500ee99444494444eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeee99444449490eeeeeeeeeeeeeeeeeeeeee000eee000444449440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeee0444444445eeeeeeeeeeeeeeeeeeeeeeeeeee0005044444445eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeee0054444440eeeeeeeeeeeeeeeeeeeeeeeeee00050044444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeee000444400eeeeeeeeeeeeeeeeeeeeeeeee00550000444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeee0006440000eeeeeeeeeeeeeeeeeeeeeeee0600ee000444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeee00000000600eeeeeeeeeeeeeeeeeeeeeeee000ee00500000900eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeee00000000500900eeeeeeeeeeeeeeeeeeeeeeeeee00005004449000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeee0000000000049000eeeeeeeeeeeeeeeeeeeeeeee0000500444090000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeee0011110000004000000eeeeeeeeeeeeeeeeeeefe0044406000000004400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee000111110000000055100eeeeeeeeeeeeeeeeeee099444400000000099f400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee0155115555011111115100eeeeeeeeeeeeeeeeee0449944404449999444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee0011555111011111161500eeeeeeeeeeeeeeeeee0444499404994444444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee000161111110111111111500eeeeeeeeeeeeeeee044440000000000000444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee001111111110111111111100eeeeeeeeeeeeeeee004444444044444444444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0000111111110111111111000eeeeeeeeeeeeeee0000444444044444444444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee000111111110111111111000eeeeeeeeeeeeeeee000444994044449994444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00011555111011115551000eeeeeeeeeeeeeeeee00044444994499444444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00011111555015551111000eeeeeeeeeeeeeeeee00044444404444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0001111111101111111000eeeeeeeeeeeeeeeeee0004944440444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000000000000000000000eeeeeeeeeeeeeeeeee0004444440444494440000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0002227222622222200eeeeeeeeeeeeeeeeeeeee000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00011111555015551111000eeeeeeeeeeeeeeeee00044444404444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0001111111101111111000eeeeeeeeeeeeeeeeee0004944440444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000000000000000000000eeeeeeeeeeeeeeeeee0004444440444494440000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0002227222622222200eeeeeeeeeeeeeeeeeeeee000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0002227222622222200eeeeeeeeeeeeeeeeeeeee000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0072222222222222700eeeeeeeeeeeeeeeeeeeee00a33333333333333a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d222222222225700eeeeeeeeeeeeeeeeeeeee00aa3333333333335300eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220022222500eeeeeeeeeeeeeeeeeeeeee00aa333300333335a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220022225700eeeeeeeeeeeeeeeeeeeeee00aa333300333335000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220e02257000eeeeeeeeeeeeeeeeeeeeee00aa33330e03335a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22200e0225700eeeeeeeeeeeeeeeeeeeeeee00aa33300e0335a000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000d0000ee0d0000eeeeeeeeeeeeeeeeeeeeeee0000b0000ee0b00000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000d0000ee0d0000eeeeeeeeeeeeeeeeeeeeeee0000b0000ee0b00000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000000e0ee0000000eeeeeeeeeeeeeeeeeeeeee0000000e0ee0000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0444940eeeeeee44940eeeeeeeeeeeeeeeeeeeee0444940eeeeeee449440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0444900eeeeeee04940eeeeeeeeeeeeeeeeeeeee0444900eeeeeee044940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeee0444490eeeeeeeee04940eeeeeeeeeeeeeeeeeee0444900eeeeeeeee044940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeee0444900eeeeeeeee00490eeeeeeeeeeeeeeeeee04449000eeeeeeeee004940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeee0444490eeeeeeeeeee04449eeeeeeeeeeeeeeee04444900eeeeeeeeeee004449eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee00445440eeeeeeeeeee00544eeeeeeeeeeeeeee00445440eeeeeeeeeeeee04544eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee00445440eeeeeeeeeee00544eeeeeeeeeeeeeee00445440eeeeeeeeeeeee04544eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee0444400eeeeeeeeeeeee04440eeeeeeeeeeeeee0444400eeeeeeeeeeeeeee04440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee044440eeeeeeeeeeeeee04446666eeeeeeeeeee044440eeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee0666660400eeeeeeeeeeeeeee04067660eeeeee0000000400eeeeeeeeeeeeeeeee004000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee067666000eeeeeeeeeeeeeeeee0066660eeeeee00a000000eeeeeeeeeeeeeeeeeee0000a000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee06666600eeeeeeeeeeeeeeeeeee000000eeeeee00000000eeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
e000000000eeeeeeeeeeeeeeeeeeee022222deeee000000000eeeeeeeeeeeeeeeeeeee000000a0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
e0022222d00eeeeeeeeeeeeeeeeeee02222220eee000000a000eeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
e0022222d00eeeeeeeeeeeeeeeeeee02222220eee000000a000eeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
e0022222200eeeeeeeeeeeeeeeeeee02222220eee0000000000eeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
e0000000000eeeeeeeeeeeeeeeeeee00000000eee0000000000eeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeee00000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00dddddddd222222200eeeeeeeeeeeeeeeeee
eeeee055055eeeeee00055000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0022222222dddddddd0eeeeeeeeeeeeeeeeee
eeeee0050050eeee005500555550eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0022222222222222000eeeeeeeeeeeeeeeeee
eeee004400000ee0000000044400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0022222222222222000eeeeeeeeeeeeeeeeee
eee0044444440ee0600e004444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee002222222222222000eeeeeeeeeeeeeeeeeee
eee0044400000ee000e0004440000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee002000220220000000eeeeeeeeeeeeeeeeeee
eee09f4444700eeeee0059f444700eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00044400000444000eeeeeeeeeeeeeeeeeeee
eee0994444449eeee000099444449eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00444440e0444440eeeeeeeeeeeeeeeeeeeee
eee0004444450eee0000099444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeee
eee000044440eeee0600e00444450eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440e044444440eeeeeeeeeeeeeeeeeee
eeee00500000eeee000ee0004440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
eee110000050eeeeeee400000004eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
eee1110060411eeeeee4000044444eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04944440eeee04449440eeeeeeeeeeeeeeeeee
ee111144444111eeee440604444444eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04494440eeeeee04449440eeeeeeeeeeeeeeeee
eeeeee44444eeeeeeeee0004444eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04944440eeeeee044490000eeeeeeeeeeeeeeee
eeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeee04494440eeeeeeee044094400eeeeeeeeeeeeeee
eeeeeeeeeee00dddddddd222222200eeeeeeeeeeeeeeeeeeeee00aaaaaaaa333333300eeeeeeeeeeeeeeeeee00904440eeeeeeeee04099400eeeeeeeeeeeeeee
eeeeeeeeeee0022222222dddddddd0eeeeeeeeeeeeeeeeeeeee0033333333aaaaaaaa0eeeeeeeeeeeeeeeee00494040eeeeeeeeeee0049400eeeeeeeeeeeeeee
eeeeeeeeeee0022222222222222200eeeeeeeeeeeeeeeeeeeee0033333333333333300eeeeeeeeeeeeeeeee00944040eeeeeeeeeeee0009440eeeeeeeeeeeeee
eeeeeeeeeee0022222222222222200eeeeeeeeeeeeeeeeeeeee0033333333333333300eeeeeeeeeeeeeeeee00944040eeeeeeeeeeee0009440eeeeeeeeeeeeee
eeeeeeeeeee0022222222222222000eeeeeeeeeeeeeeeeeeeee0033333333333333000eeeeeeeeeeeeeeeee0094400eeeeeeeeeeeeee044440eeeeeeeeeeeeee
eeeeeeeeeee0020002222200022000eeeeeeeeeeeeeeeeeeeee0030003333300033000eeeeeeeeeeeeeeeee040000eeeeeeeeeeeeeeee00666660eeeeeeeeeee
eeeeeeeeeee000444020004440000eeeeeeeeeeeeeeeeeeeeee000444030004440000eeeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee00666660eeeeeeeeeee
eeeeeeeeeee00444440004444400eeeeeeeeeeeeeeeeeeeeeee00444440004444400eeeeeeeeeeeeeeee06666600eeeeeeeeeeeeeeeeee0666660eeeeeeeeeee
eeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeee0666660eeeeeeeeeeeeeeeeee00000000eeeeeeeeeee
eeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeee0666660eeeeeeeeeeeeeeeeee022222220eeeeeeeeee
eeeeeeeeee04444440eee04444440eeeeeeeeeeeeeeeeeeeee04444440eee04444440eeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeee022222220eeeeeeeeee
eeeeeeeeee04444440eee04444440eeeeeeeeeeeeeeeeeeeee04444440eee04444440eeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeee022222220eeeeeeeeee
eeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeee022222200eeeeeeeeeeeeeeeee000000000eeeeeeeeee
eeeeeeeee04944440eeeee04449440eeeeeeeeeeeeeeeeeee04a44440eeeee0444a440eeeeeeeeeeeee000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeee04944440eeeeee04449440eeeeeeeeeeeeeeeeee04a44440eeeeee0444a440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeee04944440eeeeeee04449000eeeeeeeeeeeeeeeee04a44440eeeeeee0444a000eeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeee
eeeeeeee00904440eeeeeeee04049400eeeeeeeeeeeeeeee00a04440eeeeeeee0404a400eeeeeeeeeeeeeeeeeee00aaaaaaaa333333300eeeeeeeeeeeeeeeeee
eeeeeee00494040eeeeeeeee04099400eeeeeeeeeeeeeee004a4040eeeeeeeee040aa400eeeeeeeeeeeeeeeeeee0033333333aaaaaaaa0eeeeeeeeeeeeeeeeee
eeeeeee00944040eeeeeeeeee0044900eeeeeeeeeeeeeee00a44040eeeeeeeeee0044a00eeeeeeeeeeeeeeeeeee0033333333333333000eeeeeeeeeeeeeeeeee
eeeeeee00944040eeeeeeeeee0044900eeeeeeeeeeeeeee00a44040eeeeeeeeee0044a00eeeeeeeeeeeeeeeeeee0033333333333333000eeeeeeeeeeeeeeeeee
eeeeeee0094400eeeeeeeeeeee0000440eeeeeeeeeeeeee00a4400eeeeeeeeeeee0000440eeeeeeeeeeeeeeeeee003333333333333000eeeeeeeeeeeeeeeeeee
eeeeeee040000eeeeeeeeeeeeee044440eeeeeeeeeeeeee040000eeeeeeeeeeeeee044440eeeeeeeeeeeeeeeeee003000330330000000eeeeeeeeeeeeeeeeeee
eeeeeee04440eeeeeeeeeeeeeeee044440eeeeeeeeeeeee04440eeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee00044400000444000eeeeeeeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeee04066660eeeeeeeee0000000eeeeeeeeeeeeeeee04000000eeeeeeeeeeeeeee00444440e0444440eeeeeeeeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeeee0066660eeeeeeeee0000000eeeeeeeeeeeeeeeee0000000eeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeeee0066660eeeeeeeee0000000eeeeeeeeeeeeeeeee0000000eeeeeeeeeeeeeee04444440e044444440eeeeeeeeeeeeeeeeeee
eee000000000eeeeeeeeeeeeeeeee00000000eeeeee000000000eeeeeeeeeeeeeeeee00000000eeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
eee000000000eeeeeeeeeeeeeeeee00000000eeeeee000000000eeeeeeeeeeeeeeeee00000000eeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
eee022222200eeeeeeeeeeeeeeeee022222200eeeee000000000eeeeeeeeeeeeeeeee000000000eeeeeeeeeeee04a44440eeee0444a440eeeeeeeeeeeeeeeeee
eee000000000eeeeeeeeeeeeeeeee000000000eeeee000000000eeeeeeeeeeeeeeeee000000000eeeeeeeeeee044a4440eeeeee0444a440eeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04a44440eeeeee0444a0000eeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee044a4440eeeeeeee0440a4400eeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00a04440eeeeeeeee040aa400eeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee004a4040eeeeeeeeeee004a400eeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00a44040eeeeeeeeeeee000a440eeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00a44040eeeeeeeeeeee000a440eeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00a4400eeeeeeeeeeeeee044440eeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee040000eeeeeeeeeeeeeeee00000000eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee00000000eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeee0000000eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000eeeeeeeeeeeeeeeeee00000000eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000eeeeeeeeeeeeeeeeee000000000eeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeee000000000eeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeee000000000eeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000eeeeeeeeeeeeeeeee000000000eeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
__gff__
__map__
__sfx__
00060000245700000028560000002c555000003053500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000300000c67308053046350000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000400001067308273046550000014635000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00020000266311c645126250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000300002467318663106550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00030000243502b345000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000400000a67306263000000e64500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000300001267308273246730c663000001c6650000008655000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00080020086730000000000000000000000000000000000020665000000000000000096630000000000000000867300000000000000000000000000b663000002067500000000000000000000000000000000000
000800202d635000002d625000002d635000002d625000002d635000002d625000002d6350000030635326252d635000002d625000002d635000002d625000002d635000002d625000002d635000003063534625
000800200c2510c2500c2500c250000000000000000000000a2510a2500a2500a250000000000000000000000f2510f2500f2500f250000000000000000000000825108250082500825000000000000000000000
__music__
__label__
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110005555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555550001111
11110005555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111aa11111111aa111111aaaa11aa11aa11aaaaaa11aaaa111111111111aaaaaa11aa11aa11111111111111111111550001111
11110005511111111111111111111aa11111111aa111111aaaa11aa11aa11aaaaaa11aaaa111111111111aaaaaa11aa11aa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aa11aa11aa111111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aa11aa11aa111111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aaaa1111aaaa1111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aaaa1111aaaa1111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aa11aa11aa111111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aa111111aa11aa11aa111111aa11aa11aa111111aa11aa111111111111aa1111aaaaaa11111111111111111111550001111
11110005511111111111111111111aaaaaa1111aa111111aaaa11aa11aa11aaaaaa11aaaa111111111111aaaaaa11aa11aa11111111111111111111550001111
11110005511111111111111111111aaaaaa1111aa111111aaaa11aa11aa11aaaaaa11aaaa111111111111aaaaaa11aa11aa11111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117777111177777711771177111177771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117777111177777711771177111177771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771111771111777777117711111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771111771111777777117711111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117777111111771111777777117711771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117777111111771111777777117711771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771111771111777777117711771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771111771111777777117711771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771177777711771177111177771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111117711771177777711771177111177771111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111550001111
11110005511166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111550001111
11110005511166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111166111111111550001111
11110005510000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111111550001111
11110005510000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111111550001111
11110005510000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111110000001111111550001111
11110005510000001111110000001111110000001111110000001111110000001111110000001111110000001111100000001111110000001111111550001111
11110005588888888888888888888888888888888888888888888888888888888888888888888888888888888888800080008888888888888888888550001111
11110005588888888888888888888888888888888888888888888888888888888888888888888888888888888000800080008888888888888888888550001111
11110005511111111111111111110000000011111111111111111111111111111111111111111111111111111000100010001111111111111111111550001111
11110005511111111111111111110000000011111111111111111111111111111111111111111111111111111000400040004411111111111111111550001111
11110005511111111111111111440000000041111111111111111111111111111111111111111111111111111000400040004411111111111111111550001111
11110005511111111111111111440000000041111111111111111111111111111111111111111111111111111000400040004411111111111111111550001111
11110005511111111111111111444444444441111111111111111111111111111111111111111111111111111000400040004411111111111111111550001111
11110005511111111111111111444444444441111111111111111111111111111111111111111111111111111000444440004411111111111111111550001111
11110005511111111111111111444444444441111111111111111111111111111111111111111111111111111000444444444411111111111111111550001111
11110005511111111111111111444444444441111111111111111111111111111111111111111111111111111114444444444411111111111111111550001111
11110005511111111111111111444444444441111111111111111111111111111111111111111111111111111114444444444411111111111111111550001111
11110005577777777777777777444444444447777777777777777777777777777777777777777777777777777774444444444477777777777777777550001111
11110005577777777777777777444444444447777777777777777777777777777777777777777777777777777774444444444477777777777777777550001111
1111000551111111111111111244444444444221111111111111111111111111111111111111bbbbbbbb11111334444444444431111111111111111550001111
111100055111111111111111124444444444422111ddddddd111111111111111111111111111bbbbbbbb11111334444444444431111111111111111550001111
111100055111111111111111122222222222222111ddddddd111111111111111111111111111bbbbbbbbbbbbbbb3333333333331111111111111111550001111
1111000551111111111111111222222222222dddddddddddd111111111111111111111111111bbbbbbbbbbbbbbb333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222dddddddddddd111111111111111111111111111bbbbbbbbbbbbbbb333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222dddddddddddd111111111111111111111111111bbbbbbbbbbbbbbb333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222dddddddddddd111111111111111111111111111bbbbbbbbbbbbbbb333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222dddddddddddd11111111111111111111111111111111bbbbbbbbbb333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222ddddddddd11111111111111111111111111111111111bbbbbbbbbb333333ffffffff11111111111111550001111
111100055cccccccccccccccffffff2222222dddddddddccccccccccccccccccccccccccccccccccccccccccc33333333ffffffffcccccccccccccc550001111
111100055cccccccccccccccffffff222222222cccccccccccccccccccccccccccccccccccccccccccccccccc33333333ffffffffcccccccccccccc550001111
111100055111111111111111ffffff2222222221111111111111111111111111111111111111111111111111133333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222221111111111111111111111111111111111111111111111111133333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222221111111111111111111111111111111111111111111111111133333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222221111111111111111111111111111111111111111111111111133333333ffffffff11111111111111550001111
111100055111111111111111ffffff2222222221111111111111111111111aa11a1111111111111111111111133333333ffffffff11111111111111550001111
111100055111111111111111122222222222222111111111111111111111a111a1a1111111111111111111111333333333333331111111111111111550001111
111100055111111111111111122222222222222111111111111000111111a1a1a1a1111111000111111111111333333333333331111111111111111550001111
111100055111111111111111122222222222222111111111111000111111a1a1a1a1111111000111111111111333333333333331111111111111111550001111
1111000551111111111111111222222222222221111111111110001111111aa11a11111111000111111111111333333333333331111111111111111550001111
11110005511111111111111112222222222222211111111111100011111111111111111111000111111111111333333333333331111111111111111550001111
11110005511111111111111112222222222222211111111111111111111111111111111111111111111111111333333333333331111111111111111550001111
11110005511111111111111112222222222222211111111111111111111111111111111111111111111111111333333333333331111111111111111550001111
11110005511111111111111112222222222222221111111111111111111111111111111111111111111111111333333333333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005511111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111111550001111
11110005556666666666666666222222662222226666666666666666666666666666666666666666666666666333333663333336666666666666665550001111
11110005551111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111115550001111
11110005515111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111151550001111
11110005515111111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111151550001111
11110005511511111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111511550001111
11110005511511111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111111511550001111
11110005511151111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111115111550001111
11110005511151111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111115111550001111
11110005511151111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111115111550001111
11110005511115111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111151111550001111
11110005511115111111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111151111550001111
11110005511111511111111111222222112222221111111111111111111111111111111111111111111111111333333113333331111111111511111550001111
111100055111115111111111112222d2112222d2111111111111111111111111111111111111111111111111133b33311333b331111111111511111550001111
11110005511111151111111111111d111111111d11111111111111111111111111111111111111111111111111b1111111111b11111111115111111550001111
1111000551111115111111111111d1111111111d11111111111111111111111111111111111111111111111111b11111111111b1111111115111111550001111
111100055111111511111111111d111111111111d111111111111111111111111111111111111111111111111b1111111111111b111111115111111550001111
111100055111111151111111111d1111111111111d1111111111111111111111111111111111111111111111b11111111111111b111111151111111550001111
11110005511111115111111111d111111111111111d11111111111111111111111111111111111111111111b1111111111111111b11111151111111550001111
1111000551111111151111111d1111111111111111d11111111111111111111111111111111111111111111b11111111111111111b1111511111111550001111
111100055111111115111111d111111111111111111d111111111111111111111111111111111111111111b1111111111111111111b111511111111550001111
11110005511111111151111111111111111111111111111111111111111111111111111111111111111111111111111111111111111115111111111550001111
11110005511111111155555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111550001111
11110005511111111111111111111111166166111611666166611111161161616661661111116161161166611661666111111111111111111111111550001111
11110005511111111111111111111111611161616161611116111111616161616111616111116661616116116111611111111111111111111111111550001111
11110005511111111111111111111111611166116661661116111111616161616611661111116661616116111611661111111111111111111111111550001111
11110005555555555555555555555555655565656565655556555555656565656555656555556665656556555565655555555555555555555555555550001111
11110005555555555555555555555555566565656565655556555555565556556665656555556565565566656655666555555555555555555555555550001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
