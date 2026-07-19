pico-8 cartridge // http://www.pico-8.com
version 42
__lua__
defs={
 {ab="ab",nm="a.b. problem",rl="counter",art=1,ed=13,tr=2,gl=13,hi=7,hm=100,sm=100,gm=40,lk=64,spd=0,ag=1,pdw=1,dm=0,rg=.92},
 {ab="dg",nm="d. great",rl="speed",art=2,ed=11,tr=3,gl=3,hi=11,hm=100,sm=100,gm=40,lk=56,spd=1,ag=1,pdw=0,dm=.16,rg=1.06},
 {ab="ck",nm="callout king",rl="pressure",art=2,ed=8,tr=8,gl=8,hi=10,hm=98,sm=104,gm=38,lk=55,spd=1,ag=1.03,pdw=0,dm=.1,rg=1.04},
 {ab="sg",nm="studio guest",rl="wildcard",art=1,ed=12,tr=12,gl=12,hi=6,hm=96,sm=102,gm=38,lk=53,spd=1,ag=1.02,pdw=0,dm=.08,rg=1.05},
 {ab="lc",nm="legend coach",rl="veteran",art=1,ed=10,tr=9,gl=10,hi=7,hm=103,sm=95,gm=46,lk=61,spd=0,ag=.94,pdw=1,dm=.04,rg=.96},
 {ab="tl",nm="tall lightwt",rl="outside",art=2,ed=14,tr=14,gl=14,hi=7,hm=97,sm=101,gm=39,lk=57,spd=1,ag=.98,pdw=0,dm=.07,rg=1.02}
}

mvs={
 {ln=1,wd=4,re=7,st=3,d=6,gd=4,hy=7,sk=4},
 {ln=1,wd=7,re=11,st=6,d=11,gd=8,hy=11,sk=8},
 {ln=0,wd=5,re=9,st=4,d=7,gd=5,hy=8,sk=10},
 {ln=0,wd=7,re=11,st=6,d=10,gd=7,hy=11,sk=12},
 {ln=1,wd=7,re=12,st=7,d=12,gd=9,hy=13,sk=8}
}
rch={29,32,29,23,19}
anm={"jab","straight","body jab","body hook","uppercut","feint"}

function mkb(i,sd,ai)
 local d=defs[i]
 return {
  id=i,ab=d.ab,sd=sd,ai=ai,
  hm=d.hm,hp=d.hm,sm=d.sm,st=d.sm,gm=d.gm,g=d.gm,
  lk=d.lk,spd=d.spd,ag=d.ag,pg=d.pdw,
   acc=0,dm=d.dm,rg=d.rg,hmul=1,bres=0,brs=0,sh=0,
  hy=0,kd=0,pts=0,ct=0,
  wind=0,rec=0,atk=0,aln=0,gt=9,guard=0,sl=0,cnt=0,stun=0,down=0,q=0,fe=0,link=0,vx=0,mv=0,
   bl=0,bi=0,bs=0,ca=0,cp=0,la=0,co=0,tz=0,
   rdm=0,rcl=0,rdef=0,rkd=0,chain=0,shake=0,bh=false,ds=0,dd=0
 }
end

function clamp(v,a,b)
 if v<a then return a end
 if v>b then return b end
 return v
end

function fast_hook()
 return peek(0x5fff)==1
end

function round_len()
 return fast_hook() and 240 or 1350
end

function corner_len()
 return fast_hook() and 45 or 240
end

function title_mode()
 mode=0
 cam=0 fl=0
 p=nil
 o=nil
 rescode=0
 music(-1)
end

function new_run()
 run_n+=1
 srand(2048+run_n*37+sel*101)
 p=mkb(sel,-1,false)
 local oi=sel==1 and 2 or sel==2 and 1 or sel%2==1 and 2 or 1
 o=mkb(oi,1,true)
 res=nil
 rescode=0
 fight_init()
end

function fight_init()
 mode=2
 round=1
 bell=18
 ht=0 hs=0
 tapd=0 tapt=-20
 set_round(1)
end

function round_reset(f,x)
 f.x=x f.vx=0 f.mv=0
 f.wind=0 f.rec=0 f.stun=0 f.sl=0 f.cnt=0 f.guard=0 f.gt=9 f.down=0 f.atk=0 f.q=0 f.fe=0 f.link=0 f.la=0 f.co=0 f.bl=0 f.bi=0 f.bs=0 f.ca=0 f.cp=0 f.ds=0 f.dd=0 f.tz=0
 f.rdm=0 f.rcl=0 f.rdef=0 f.rkd=0
end

function set_round(n)
 round=n
 rt=round_len()
 ht=0 hs=0
 round_reset(p,42) round_reset(o,86) rng=1
 p.hy=max(p.hy,p.sh)
 o.hy=0
 bell=12
 sfx(0)
end

function corner_init()
 mode=3
 ct=corner_len()
 p.st=min(p.sm,p.st+18+p.brs)
 p.g=min(p.gm,p.g+10)
 o.st=min(o.sm,o.st+16)
 o.g=min(o.gm,o.g+10)
 msg=p.hp>o.hp and "corner: stay sharp" or "corner: build clean shots"
end

function round_score()
 local ps=10
 local os=10
 local pd=p.rdm+p.rcl*2+p.rkd*18+p.rdef
 local od=o.rdm+o.rcl*2+o.rkd*18+o.rdef
 local d=pd-od
 if d>26 then os=8 elseif d>7 then os=9 elseif d<-26 then ps=8 elseif d<-7 then ps=9 end
 p.pts+=ps
 o.pts+=os
end

function finish(win,kind)
 mode=4
 res={w=win,k=kind}
 rescode=kind=="dec" and 3 or (win==1 and 1 or 2)
 grade=win==1 and (kind=="dec" and "b" or "a") or "c"
 music(-1)
 if win==1 then sfx(4) else sfx(2) end
end

function human_ctl()
 local mv=0
 if btn(1) then mv=1 elseif btn(0) then mv=-1 end
 local dp=btnp(0) and -1 or btnp(1) and 1 or 0
 if dp!=0 then
  if tapd==dp and fr-tapt<9 and p.st>=3 then p.ds=5 p.dd=dp p.st-=3 end
  tapd=dp tapt=fr
 end
 local g=0
 if btn(2) then g=1 elseif btn(3) then g=2 end
 local a=0
 if btnp(4) then
  if btn(2) then a=6 elseif btn(3) then a=3 else a=1 end
 end
 if btnp(5) then
  if btn(2) then a=5
  elseif btn(3) then a=4
  else a=2 end
 end
 return mv,g,a
end

function ai_ctl(f,e)
 local mv=0
 local g=0
 local a=0
 if e.wind>0 and rng>0 then
  if rnd()<(.18+f.lk/180) then
   g=e.aln==1 and 1 or 2
   if rnd()<.45 then mv=-1 end
  elseif rnd()<.35 then
   mv=rnd()<.5 and -1 or 1
  end
 elseif f.stun<=0 and f.rec<=0 and f.wind<=0 then
  if f.cnt>0 and rng>0 and f.st>5 and rnd()<.7 then
   a=rng==2 and (rnd()<.35 and 5 or 2) or 1
  elseif f.st<20 and rnd()<.55 then
   mv=-1
  elseif rng==0 and rnd()<.7 then
   mv=1
  elseif rng==2 and rnd()<.3 then
   mv=-1
  else
   if rnd()>.22*f.ag then return mv,g,a end
   local r=rnd()
   if rng>0 and f.st>25 and rnd()<.08 then
    a=6
   elseif rng==0 then
    a=r<.6 and 1 or 3
   elseif rng==1 then
    if r<.34 then a=1 elseif r<.66 then a=2 else a=3 end
   else
    if r<.3 then a=2 elseif r<.62 then a=4 else a=5 end
   end
  end
 end
 return mv,g,a
end

function begin_atk(f,a)
 if a==6 then
  if f==p then htxt=anm[a] ht=18 end
  if f.st<1 then return end
  f.st-=1 f.atk=6 f.aln=1 f.wind=3
  return
 end
 local co=f.link>0 and ((f.la==1 and (a==2 or a==3)) or (f.la==3 and a==2) or (f.la==2 and a==4) or (f.la==4 and a==5))
 f.co=co and 1 or 0
 if f==p then htxt=(co and "combo " or "")..anm[a] ht=18 end
 local m=mvs[a]
 local cost=m.st
 if f.st<cost then
  f.rec=5
  return
 end
 f.cp=0
 if f.cnt>0 then
  f.cp=f.ca f.cnt=0 f.ca=0
 end
 f.st-=cost
 f.atk=a
 f.aln=m.ln
 f.guard=0 f.bl=0
 if co then
  local e=f==p and o or p
  f.x=clamp(f.x-f.sd*2,18,110)
  if f.sd<0 then f.x=min(f.x,e.x-28) else f.x=max(f.x,e.x+28) end
 end
 if rng<2 then f.vx=-f.sd*(a==2 and .8 or a>3 and .55 or .4) end
 local wd=max(2,m.wd-flr(f.acc*8))
 if f.fe>0 or co then wd=max(2,wd-2) end
 if f.cp>0 then
  wd=max(2,wd-1-(f.cp==3 and 1 or 0))
  if f==p then htxt="counter "..anm[a] ht=20 end
 end
 f.wind=wd
end

function knock(d,a)
 d.kd+=1
 a.rkd+=1
 a.hy=min(100,a.hy+18)
 d.down=75
 d.wind=0 d.rec=0 d.stun=0 d.guard=0 d.sl=0 d.bl=0 d.bi=0 d.bs=0 d.cnt=0 d.ca=0 d.cp=0 d.ds=0 d.tz=0
 a.wind=0 a.tz=0
 a.rec=18
 cam=7 fl=3
 sfx(4)
 if d.kd>=3 then
  finish(a==p and 1 or 2,"tko")
 end
end

function hit(a,d)
 if a.atk==6 then return end
 local m=mvs[a.atk]
 if not m then return end
 if abs(a.x-d.x)>rch[a.atk]+11 then
  d.cnt=max(d.cnt,8)
  d.ca=max(d.ca,1)
  a.tz=30
  a.cp=0 a.co=0 a.link=0 a.la=0
  sfx(3)
  return
 end
 if d.sl>0 and m.ln==1 then
  d.cnt=14+d.pg
  d.ca=2
  a.tz=30
  d.hy=min(100,d.hy+4)
  d.rdef+=2
  a.st=max(0,a.st-1)
  a.cp=0 a.co=0 a.link=0 a.la=0
  if d==p then htxt="slip" ht=22 end
  sfx(3)
  return
 end
 local need=m.ln==1 and 1 or 2
  if d.guard==need then
  local pg=d.gt<=2+d.pg
  local lean=d.bl>0
  d.bi=5
  hs=pg and 4 or lean and 3 or 2
  d.bh=m.ln==0
  d.bs=pg and 1 or lean and 2 or 3
  d.rdef+=pg and 3 or lean and 2 or 1
  d.g-=m.gd*(pg and .25 or lean and .6 or 1)
  a.hy=min(100,a.hy+2)
  if pg then
    d.cnt=16+d.pg
    d.ca=3
    a.tz=30
   d.hy=min(100,d.hy+5)
   a.stun=3
   cam=3 fl=2
   d.g=min(d.gm,d.g+1)
   if d==p then htxt="perfect block" ht=24 end
   sfx(5)
  else
   d.hp-=(lean and .1 or .22)*m.d
   d.cnt=max(d.cnt,lean and 9 or 6)
   d.ca=max(d.ca,1)
   a.tz=30
   if d==p then htxt=lean and "lean block" or "blocked" ht=18 end
   sfx(3)
  end
  a.cp=0
  a.la=a.atk a.link=16
  if d.g<=0 then
   d.g=0
   d.stun=8
   d.cnt=0 d.ca=0 d.bl=0 d.guard=0
  end
  return
 end
 local mult=1
 local fin=a.co>0 and a.atk==5 and a.chain>=2
 local cp=a.cp
 if cp>0 then
  mult=1.12+cp*.09
  a.cp=0
  a.hy=min(100,a.hy+cp*3)
  if a.id==1 and a.hy>=100 then
   mult=1.35
   a.hy=0
  end
 end
 if a.fe>0 then mult+=.15 a.fe=0 end
 if a.co>0 then mult+=.1 end
 if fin then mult+=.18 end
 mult*=.8+.2*a.st/a.sm
 a.hy=min(100,a.hy+m.hy*a.hmul)
 if a.chain>=2 and fr-a.ct<40 and a.hy>=100 then mult+=.2 a.hy=0 end
 local dmg=(m.d*(1+a.dm))*mult
 local gdm=m.sk
 if m.ln==0 then
  dmg*=1-d.bres
  d.st=max(0,d.st-gdm)
 end
 d.hp-=dmg
 d.stun=5+(a.atk>1 and 1 or 0)+cp+(fin and 3 or 0)
 a.rcl+=1
 a.rdm+=dmg
 if fr-a.ct<40 then a.chain+=1 else a.chain=1 end
 a.ct=fr
 a.la=a.atk
 a.link=a.atk<5 and 20 or 0
 d.shake=(fin and 7 or 3)+cp
 hs=fin and 7 or 3+(a.atk>1 and 2 or 0)+(cp>1 and 1 or 0)
 cam=fin and 7 or a.atk>1 and 4 or 2
 fl=fin and 3 or a.atk>1 and 2 or 0
 if fin and a==p then htxt="combo finish" ht=24 end
 d.bh=m.ln==0
 if a.atk>=2 and m.ln==1 then d.x=clamp(d.x+d.sd*(fin and 8 or 4),18,110) end
 sfx(a.atk>=2 and 2 or 1)
 if d.hp<=0 or (a.atk>=2 and d.hp<14 and d.kd<2) then
  knock(d,a)
 end
end

function step_box(f,e,mv,g,a)
 if f.fe>0 then f.fe-=1 end
 if f.link>0 then f.link-=1 end
 if f.sl>0 then f.sl-=1 end
 if f.cnt>0 then
  f.cnt-=1
  if f.cnt==0 then f.ca=0 end
 end
 if f.shake>0 then f.shake-=1 end
 if f.bs>0 then
  a=0
  if f.bi<5 then f.bs-=1 end
 end
 if f.bi>0 then f.bi-=1 end
 if f.down>0 then
  f.down-=1
  if f.down==0 then
   f.hp=max(10,14-f.kd)
   f.st=max(18,f.st)
   f.g=max(12,f.g)
   p.x=42 o.x=86 p.vx=0 o.vx=0 p.mv=0 o.mv=0 rng=1
  end
  return mv
 end
 if f.tz>0 and f.tz%2==1 then
  if a>0 then f.q=a end
  return 0
 end
 local ng=f.wind+f.rec+f.stun>0 and 0 or g
 if ng~=f.guard then
  f.guard=ng
  f.gt=0
 else
  f.gt=min(9,f.gt+1)
 end
 f.bl=f.guard>0 and mv==f.sd and 1 or 0
 if f.stun>0 then
  f.stun-=1
  f.guard=0
  f.bl=0
  return mv
 end
 if f.rec>0 then
  f.rec-=1
  if a>0 and f.rec<=5 then f.q=a end
 else
  if f.q>0 then a=f.q f.q=0 end
  if a>0 and f.wind<=0 then begin_atk(f,a) end
 end
 if f.wind>0 then
  f.wind-=1
  if f.wind==0 then
   if f.atk==6 then
    f.fe=20 f.rec=2 sfx(5)
   else
    hit(f,e)
    local rec=mvs[f.atk].re
    f.rec=max(3,rec-(f.co>0 and 2 or f.chain>1 and 1 or 0))
   end
  end
 end
 if e.wind>0 and (btnp(0) or btnp(1)) and f==p and f.guard==0 and rng>0 then
  f.sl=8 mv=0
  htxt="dodge" ht=18
 end
 if f.ai and e.wind>0 and f.guard==0 and (bal or peek(0x5ff6)==0) and rnd()<.08 then
  f.sl=5
 end
 local regen=.22
 if rng==0 then regen+=.18 end
 if f.guard>0 then regen+=.12 end
 regen*=f.rg
 f.st=min(f.sm,f.st+regen)
 f.g=min(f.gm,f.g+.05+(f.guard>0 and .12 or .03))
 return mv
end

function move_box(f,mv,lo,hi)
 local burst=0
 if f.ds>0 and f.wind+f.rec+f.stun==0 then
  burst=f.dd*1.45 f.ds-=1
 else f.ds=0 end
 local t=f.wind+f.rec+f.stun==0 and (mv+burst)*(f.tz>0 and .35 or 1) or 0
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
 if p.down>0 or o.down>0 then
  step_box(p,o,0,0,0)
  step_box(o,p,0,0,0)
  return
 end
 fr+=1
 if p.tz>0 then p.tz-=1 end
 if o.tz>0 then o.tz-=1 end
 local pm,pg,pa=human_ctl()
 if hs>0 then
  if pa>0 then p.q=pa end
  hs-=1
  return
 end
 rt-=1
 local om,og,oa=ai_ctl(o,p)
 if not bal and peek(0x5ff6)==1 then om=0 og=0 oa=0 end
 local ta=peek(0x5ff5)
 if not bal and ta>0 and o.wind+o.rec==0 then oa=ta poke(0x5ff5,0) end
 local ow=-om
 move_box(p,pg>0 and pm==p.sd and 0 or pm,18,o.x-28)
 move_box(o,og>0 and ow==o.sd and 0 or ow,p.x+28,110)
 rng=o.x-p.x>48 and 0 or o.x-p.x>34 and 1 or 2
 step_box(p,o,pm,pg,pa)
 step_box(o,p,ow,og,oa)
 if rt<=0 then
  round_score()
  if round>=3 then
   if p.pts>o.pts then finish(1,"dec")
   elseif p.pts<o.pts then finish(2,"dec")
   else
    if p.hp>=o.hp then finish(1,"dec") else finish(2,"dec") end
   end
  else
   corner_init()
  end
 end
 if p.hp<=0 and mode~=4 then finish(2,"ko") end
 if o.hp<=0 and mode~=4 then finish(1,"ko") end
end

function upd_title()
 if btnp(4) then mode=1 sfx(5) end
end

function upd_select()
 if btnp(0) then sel=sel==1 and #defs or sel-1 sfx(5) end
 if btnp(1) then sel=sel==#defs and 1 or sel+1 sfx(5) end
 if btnp(4) then new_run() sfx(5) end
 if btnp(5) then title_mode() end
end

function upd_corner()
 ct-=1
 if ct<=0 then
  set_round(round+1)
  mode=2
 end
end

function upd_result()
 if btnp(4) then new_run() end
 if btnp(5) then title_mode() end
end

function gpio()
 local q={
  mode,round or 0,
  p and flr(clamp(p.hp,0,100)) or 0,o and flr(clamp(o.hp,0,100)) or 0,
  rescode or 0,sel or 0,
  p and p.atk or 0,p and p.wind or 0,p and p.rec or 0,p and p.sl or 0,p and p.fe or 0,
  o and o.atk or 0,o and o.wind or 0,p and p.mv+1 or 1,o and o.mv+1 or 1,
  p and flr(p.x) or 0,o and flr(o.x) or 0,p and p.guard or 0,p and p.gt or 0,
  p and p.bl or 0,p and p.bi or 0,p and (p.ca==3 and 3 or p.bl>0 and 2 or p.bi>0 and 1 or 0) or 0,p and p.cnt or 0,p and p.ca or 0,
  p and p.cp or 0,p and flr(p.g) or 0,p and p.bs or 0,o and o.rec or 0,p and p.stun or 0,hs or 0,p and p.ds or 0,
  p and p.co or 0,p and p.chain or 0,p and p.id or 0,o and o.id or 0,p and p.tz or 0,o and o.tz or 0
 }
 for i=1,#q do poke(0x5f7f+i,q[i]) end
end

function _init()
 run_n=0
 sel=1
 fr=0
 title_mode()
end

function _update()
 gpio()
 if mode==0 then upd_title()
 elseif mode==1 then upd_select()
 elseif mode==2 then fight_tick()
 elseif mode==3 then upd_corner()
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

function warehouse(y0,y1)
 rectfill(0,y0,127,y1,0)
 for y=y0+5,y1,8 do line(0,y,127,y,1) end
 for x=4,124,13 do
  local h=9+(x%5)
  line(x,y0,x,y0+h,5)
  line(x+1,y0,x+1,y0+h,1)
 end
 rectfill(44,y0,83,y1,1)
 rectfill(48,y0+3,79,y1-3,0)
 rect(47,y0+2,80,y1-2,5)
 line(63,y0+3,63,y1-3,5)
 rectfill(43,y1-5,84,y1-3,5)
 rectfill(39,y1-2,88,y1,1)
 line(20,y0,20,y0+9,5)
 rectfill(16,y0+9,24,y0+28,8)
 rectfill(17,y0+17,23,y0+20,0)
 line(100,y0,100,y0+8,5)
 rectfill(94,y0+8,106,y0+27,4)
 rect(94,y0+8,106,y0+27,5)
 circfill(100,y0+14,3,0)
 line(100,y0+17,96,y0+25,0)
 line(100,y0+18,104,y0+25,0)
 for row=0,1 do
  for i=0,12 do
   local x=2+i*10+(row%2)*4
   local y=y1-10+row*5-(i%3)
   local sk=i%3==0 and 4 or i%3==1 and 9 or 15
   circfill(x,y,2,sk)
   rectfill(x-3,y+2,x+3,y+7,1)
   pset(x+1,y-1,7)
   if (i+row)%4==0 then
    rectfill(x+3,y-5,x+5,y-2,7)
    pset(x+4,y-5,10)
   end
  end
 end
end

function ring_bg()
 cls(0)
 warehouse(0,51)
 for y=52,107 do
  local i=flr((107-y)*20/55)
  rectfill(i,y,127-i,y,6)
  if y%3==0 then
   for x=i+(y%6),127-i,8 do pset(x,y,13) end
  end
 end
 line(20,52,0,107,8)
 line(107,52,127,107,8)
 line(22,55,2,107,7)
 line(105,55,125,107,7)
 line(24,58,4,107,12)
 line(103,58,123,107,12)
 rectfill(20,48,27,66,0)
 rectfill(100,48,107,66,0)
 rectfill(22,49,25,64,7)
 rectfill(102,49,105,64,7)
 rect(21,48,26,65,6)
 rect(101,48,106,65,6)
 rectfill(24,51,103,53,8)
 rectfill(24,56,103,57,7)
 rectfill(24,60,103,62,12)
 line(0,107,127,107,5)
 circ(64,88,6,5)
 rectfill(57,90,71,101,5)
 rectfill(59,92,69,99,10)
 rectfill(63,94,65,98,0)
 pset(64,93,7)
end

function ring_front()
 line(0,106,127,106,0)
 line(0,107,127,107,7)
 line(0,108,127,108,6)
end

function portrait(id,x,y)
 local d=defs[id]
 panel(x,y,x+16,y+17,d.ed,0)
 if d.art==1 then pal(2,d.tr) pal(13,d.gl)
 else pal(3,d.tr) pal(11,d.hi) end
 palt(14,true) palt(0,false)
 sspr((d.art-1)*16,64,16,16,x+1,y+1,15,15)
 palt() pal()
end

function meter(x,y,w,v,m,c,rev)
 rectfill(x,y,x+w,y+4,0)
 rect(x,y,x+w,y+4,5)
 local n=flr((w-2)*clamp(v,0,m)/m)
 if rev then rectfill(x+w-n,y+1,x+w-1,y+3,c)
 else rectfill(x+1,y+1,x+n,y+3,c) end
end

function limb(x1,y1,x2,y2,c)
 line(x1-2,y1,x2-2,y2,0)
 line(x1+2,y1,x2+2,y2,0)
 line(x1,y1-2,x2,y2-2,0)
 line(x1,y1+2,x2,y2+2,0)
 line(x1-1,y1,x2-1,y2,c)
 line(x1+1,y1,x2+1,y2,c)
 line(x1,y1,x2,y2,c)
end

function joint(x1,y1,x2,y2,c,b)
 local mx=(x1+x2)/2
 local my=(y1+y2)/2+abs(b)
 mx+=b
 limb(x1,y1,mx,my,c)
 limb(mx,my,x2,y2,c)
 circfill(mx,my,3,0)
 circfill(mx,my,2,c)
 pset(mx-1,my-1,9)
end

function draw_glove(x,y,r,c,h,d)
 rectfill(x-r,y-r+1,x+r,y+r-1,0)
 rectfill(x-r+1,y-r,x+r-1,y+r,0)
 rectfill(x-r+1,y-r+1,x+r-1,y+r-1,c)
 rectfill(x-r+2,y-r+1,x+r-2,y-r+1,h)
 line(x-d*(r-2),y-r+2,x+d,y-r+2,h)
 rectfill(x-d*(r+2),y-2,x-d*r,y+2,0)
 rectfill(x-d*(r+1),y-1,x-d*r,y+1,h)
end

function draw_boxer(id,x,y,dir,guard,wind,rec,atk,down,sl,shake,mv,stun,bl,bi,ds,inside)
 local d=defs[id]
 local dash=ds and ds>0
 local walk=mv and mv~=0 or dash
 local step=walk and flr(fr/(dash and 1 or 2))%4 or 0
 local bob=wind+rec==0 and (walk and step%2 or flr(fr/10)%2) or 0
 local lean=sl>0 and -dir*7 or stun and stun>0 and -dir*(3+min(4,stun)) or 0
 local crouch=sl>0 and 3 or 0
 local rear=atk==2 or atk==4 or atk==5
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
  if rec>0 and atk>0 and atk<6 then
   local rm=mvs[atk].re
   ext=rec>=rm-2 and 1 or max(.18,(rec-1)/(rm-3))
   lean+=dir*flr(ext*(atk==2 and 7 or atk==5 and 5 or rear and 4 or 3))
  elseif wind>0 and atk>0 then
   lean-=dir*(atk==2 and 3 or atk==4 and 2 or 1)
   if atk==4 then crouch=2 elseif atk==5 then crouch=4 end
 end
 x+=shake>0 and shake%2*dir or 0
 y+=bob
 local skin=4
 local trunks=d.tr
 local glove=d.gl
 local ghi=d.hi
 rectfill(x-10,y+1,x+10,y+3,0)
 line(x-12,y+2,x+12,y+2,0)
 if down>0 then
  rectfill(x-11,y-5,x+7,y+1,0)
  rectfill(x-9,y-4,x+3,y,trunks)
  limb(x-7,y-1,x-13,y+2,skin)
  circfill(x+10,y-3,6,0) circfill(x+10,y-3,5,skin)
  circfill(x-13,y+1,3,0) circfill(x-13,y+1,2,glove)
  return
 end
 if d.art==1 then pal(2,d.tr) pal(13,d.gl)
 else pal(3,d.tr) pal(11,d.hi) end
 palt(14,true) palt(0,false)
 sspr((d.art-1)*40,0,40,30,x-20+lean,y-56+crouch,40,30,dir<0)
 local pivot=rear and atk>1 and wind+rec>0
 local alt=step==2 or pivot
 local lx=alt and 80 or (d.art-1)*40
 local ly=alt and 60+(d.art-1)*28 or step%2==1 and 80 or 28
 sspr(lx,ly,40,28,x-20,y-26,40,28,dir<0)
 palt() pal()
 local ux=x+lean
 local uy=y+crouch
 local sy=uy-33
 local g1x=ux+dir*1
 local g1y=uy-37
 local g2x=ux+dir*10
 local g2y=uy-32
 if inside and guard==0 and wind+rec==0 then
  g1x=ux-dir*2 g1y=uy-35
  g2x=ux+dir*6 g2y=uy-34
 end
 if guard==0 and wind+rec==0 then g1y-=flr(fr/5)%2 g2y+=flr(fr/5)%2 end
 if guard==1 then
  g1x=ux-dir*4 g1y=uy-35
  g2x=ux+dir*9 g2y=uy-34
 elseif guard==2 then
  g1x=ux-dir g1y=uy-28
  g2x=ux+dir*7 g2y=uy-27
  elseif wind>0 and atk>0 then
   local tx=atk==6 and ux+dir*13 or atk==1 and ux+dir*5 or atk==3 and ux+dir*3 or atk==2 and ux-dir*8 or ux-dir*5
   local ty=uy-(atk==6 and 34 or atk==1 and 35 or atk==2 and 29 or atk==5 and 22 or 25)
  local load=1-wind/mvs[min(atk,5)].wd
  if rear then
   g1x+=load*(tx-g1x) g1y+=load*(ty-g1y)
  else
   g2x+=load*(tx-g2x) g2y+=load*(ty-g2y)
  end
 elseif rec>0 and atk>0 and atk<6 then
  local tx=ux+dir*rch[atk]
  local ty=uy-(atk==5 and 43 or atk==2 and 38 or atk>=3 and 27 or 36)
  if rear then
   g1x+=ext*(tx-g1x) g1y+=ext*(ty-g1y)
  else
   g2x+=ext*(tx-g2x) g2y+=ext*(ty-g2y)
  end
 end
 local b1=-dir*3
 local b2=-dir*3
 if rec>0 and atk>0 and atk<6 then
  local bend=atk==4 and -dir*(4+flr(3*ext)) or atk==5 and dir*(3+flr(3*ext)) or -dir*flr(3*(1-ext))
  if rear then b1=bend else b2=bend end
 elseif wind>0 and atk==5 then b1=dir*6 end
 local s1x=ux-dir*3+(rear and dir*flr(ext*(atk==2 and 5 or 3)) or 0)
 local s2x=ux+dir*4+(not rear and dir*flr(ext*2) or -dir*flr(ext*2))
 local s1y=sy-(atk==5 and flr(ext*4) or 0)
 joint(s1x,s1y,g1x,g1y,skin,b1)
 joint(s2x,sy,g2x,g2y,skin,b2)
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
 local gr=ext==1 and 5 or 4
 local r1=rear and gr or 4
 local r2=rear and 4 or gr
 draw_glove(g1x,g1y,r1,glove,ghi,dir)
 draw_glove(g2x,g2y,r2,glove,ghi,dir)
end

function draw_f(f)
 if f.ds>0 then
  line(f.x-f.dd*18,83,f.x-f.dd*8,83,5)
  line(f.x-f.dd*15,90,f.x-f.dd*6,90,6)
  line(f.x-f.dd*14,104,f.x-f.dd*7,104,6)
  line(f.x-f.dd*11,106,f.x-f.dd*5,106,5)
  circfill(f.x-f.dd*12,105,1,7)
 end
 local inside=p and o and abs(p.x-o.x)<30
 draw_boxer(f.id,f.x,105,-f.sd,f.guard,f.wind,f.rec,f.atk,f.down,f.sl,f.shake,f.mv,f.stun,f.bl,f.bi,f.ds,inside)
 if f.shake>0 then
  local sx=f.x-f.sd*8
  local sy=105-(f.bh and 28 or 42)
  circfill(sx,sy,2,7) circ(sx,sy,4,10)
  line(sx-7,sy,sx-3,sy,7) line(sx+3,sy,sx+7,sy,7)
  line(sx,sy-7,sx,sy-3,7) line(sx,sy+3,sx,sy+7,7)
  pset(sx-5,sy-4,10) pset(sx+5,sy+4,10)
 end
 if f.bi>0 then circ(f.x-f.sd*10,105-(f.bh and 28 or 40),3,f.ca==3 and 10 or 7) end
end

function hud()
 rectfill(0,109,127,127,0)
 line(0,109,127,109,7)
 line(0,110,127,110,5)
 if not p then return end
 portrait(p.id,1,110)
 portrait(o.id,110,110)
 print(p.ab,18,112,defs[p.id].ed)
 print(o.ab,100,112,defs[o.id].ed)
 meter(30,111,19,p.g,p.gm,10,false)
 meter(78,111,19,o.g,o.gm,10,true)
 meter(18,117,31,p.hp,p.hm,8,false)
 meter(78,117,31,o.hp,o.hm,8,true)
 meter(18,123,31,p.st,p.sm,12,false)
 meter(78,123,31,o.st,o.sm,12,true)
 panel(53,111,74,127,10,1)
 print("r"..(round or 0),58,112,10)
 local sec=max(0,flr((rt or 0)/30))
 print(sec<10 and "0"..sec or sec,58,120,7)
end

function draw_title()
 ring_bg()
 draw_boxer(1,33,105,1,1,0,0,0,0,0,0)
 draw_boxer(2,94,105,-1,1,0,0,0,0,0,0)
 ring_front()
 panel(13,4,114,48,2,0)
 rectfill(17,7,110,9,8)
 btxt("locked-in",46,14,7)
 btxt("ring",56,23,10)
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
 print("combo jab>straight>body>upper",6,101,10)
 print("up/down block  back+block lean",2,113,6)
 print("left/right select o fight x back",0,121,7)
end

function draw_fight()
 local cx=cam>0 and (cam%2*2-1)*(cam>4 and 2 or 1) or 0
 local cy=cam>4 and (flr(cam/2)%2*2-1) or 0
 camera(cx,cy)
 ring_bg()
 draw_f(p)
 draw_f(o)
 ring_front()
 camera()
 if fl>0 then
  local fy=28+fl*3
  line(0,fy,127,fy,7)
  line(8,fy+29,119,fy+29,7)
  if fl>1 then line(0,fy+58,127,fy+58,6) end
 end
 hud()
 if bell>0 then panel(49,43,78,55,10,0) btxt("ding!",54,47,10) end
 if p.cnt>0 then btxt(p.ca==3 and "perfect return!" or "counter!",6,27,10)
 elseif p.bl>0 then btxt("lean block",8,27,6) end
 if p.chain>1 and fr-p.ct<30 then btxt(p.chain.." hit",95,27,10) end
 if p.g<=0 and p.stun>0 then btxt("guard break",39,34,8) end
 if ht>0 then btxt(htxt,64-#htxt*2,24,10) end
end

function draw_corner()
 ring_bg()
 draw_f(p)
 draw_f(o)
 ring_front()
 hud()
 panel(16,43,111,84,7,0)
 btxt("corner break",38,49,11)
 print(msg,22,63,7)
 print("round "..(round+1).." coming",33,74,6)
end

function draw_result()
 ring_bg()
 ring_front()
 local win=res.w==1
 panel(9,27,118,76,win and 11 or 8,0)
 portrait(res.w==1 and p.id or o.id,15,33)
 btxt(win and "you win" or "you lose",42,32,win and 11 or 8)
 print("method "..res.k,43,43,7)
 btxt("grade "..grade,44,53,10)
 if res.k=="dec" then print("score "..p.pts.."-"..o.pts,43,64,6)
 else print("round "..round,43,64,6) end
 print("o rematch   x title",25,111,7)
end

function _draw()
 gpio()
 if mode==0 then draw_title()
 elseif mode==1 then draw_select()
 elseif mode==2 then draw_fight()
 elseif mode==3 then draw_corner()
 elseif mode==4 then draw_result() end
end
__gfx__
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeee05565550000eeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeee00000000655550eeeeeeeeeeeeeeeeeeeeeeeeee00000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee0000000000000000eeeeeeeeeeeeeeeeeeeeeeee0000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee00000044440000000eeeeeeeeeeeeeeeeeeeeeee00000040440000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee00044444440000000eeeeeeeeeeeeeeeeeeeeeee00004440440000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee00444444400000000eeeeeeeeeeeeeeeeeeeeee000404440400000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee00494444444477000eeeeeeeeeeeeeeeeeeeee0e00044404440477000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee09994444444444409eeeeeeeeeeeeeeeeeeee0e009994044440444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeee009494444444444444f90eeeeeeeeeeeeeeee0eee094940444044444099eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee099944444444444444f0eeeeeeeeeeeeeeee0eee09994044404444444f90eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee00004444444444444440eeeeeeeeeeeeeee0eeee004404444044444440f0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee0000044444444099900eeeeeeeeeeeeeee5eeee00000444404444000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee000050444440000feeeeeeeeeeeeeeeeeeeeee0e000044440444409999eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeee0000500000000000eeeeeeeeeeeeeeeeeeeeee0ee00044404444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeee000050000000500eeeeeeeeeeeeeeeeeeeee6eeee0004404444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeee00050000000000eeeeeeeeeeeeeeeeeeeeeeeee00000404499fff0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeee0000005666660000eeeeeeeeeeeeeeeeeeeeeeee5000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeee0011000000000006100eeeeeeeeeeeeeeeeeeefe0044400600000544400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee6001111000000001111100eeeeeeeeeeeeeeeeee099444400000000499f400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee0111111111111111111510eeeeeeeeeeeeeeeeee0449944404449999444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeee0511111111111111111150eeeeeeeeeeeeeeeeee0444499404994444444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee001511111111111111111510eeeeeeeeeeeeeeee044440000000000000444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee011155111111111111111510eeeeeeeeeeeeeeee004444444044444444444440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0001111511111111111111150eeeeeeeeeeeeeee0000444444044444444444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee000111111111111111111100eeeeeeeeeeeeeeee000444994044449994444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00011111111111111111100eeeeeeeeeeeeeeeee00044444994499444444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00011111111111111111000eeeeeeeeeeeeeeeee00044444404444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0005555555555555551000eeeeeeeeeeeeeeeeee0004944440444444444000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0001111111111111110000eeeeeeeeeeeeeeeeee0004444440444494440000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee000000666666666000000eeeeeeeeeeeeeeeeeee000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0072222222222222700eeeeeeeeeeeeeeeeeeeee00a33333333333333a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d222222222225700eeeeeeeeeeeeeeeeeeeee00aa3333333333335300eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220022222500eeeeeeeeeeeeeeeeeeeeee00aa333300333335a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220022225700eeeeeeeeeeeeeeeeeeeeee00aa333300333335000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22220e02257000eeeeeeeeeeeeeeeeeeeeee00aa33330e03335a00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee007d22200e0225700eeeeeeeeeeeeeeeeeeeeeee00aa33300e0335a000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000d0000ee0d0000eeeeeeeeeeeeeeeeeeeeeee0000b0000ee0b00000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee0000000e0ee0000000eeeeeeeeeeeeeeeeeeeeee0000000e0ee0000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0444940eeeeeee44940eeeeeeeeeeeeeeeeeeeee0444940eeeeeee449440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeee0444900eeeeeee04940eeeeeeeeeeeeeeeeeeeee0444900eeeeeee044940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeee0444490eeeeeeeee04940eeeeeeeeeeeeeeeeeee0444900eeeeeeeee044940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeee0444900eeeeeeeee00490eeeeeeeeeeeeeeeeee04449000eeeeeeeee004940eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeee0444490eeeeeeeeeee04449eeeeeeeeeeeeeeee04444900eeeeeeeeeee004449eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee00445440eeeeeeeeeee00544eeeeeeeeeeeeeee00445440eeeeeeeeeeeee04544eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee0444400eeeeeeeeeeeee04440eeeeeeeeeeeeee0444400eeeeeeeeeeeeeee04440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeee044440eeeeeeeeeeeeee04446666eeeeeeeeeee044440eeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee0666660400eeeeeeeeeeeeeee04067660eeeeee0333330400eeeeeeeeeeeeeeeee004033330eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee067666000eeeeeeeeeeeeeeeee0066660eeeeee03b333000eeeeeeeeeeeeeeeeeee0003b330eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eee06666600eeeeeeeeeeeeeeeeee00000000eeeee03333300eeeeeeeeeeeeeeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
0000000000eeeeeeeeeeeeeeeeeee0022222d0ee0000000000eeeeeeeeeeeeeeeeeeee003333a0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
00222222d000eeeeeeeeeeeeeeeee0022222220e0033333a3000eeeeeeeeeeeeeeeeee003333330eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
002222222200eeeeeeeeeeeeeeeee0022222220e003333333300eeeeeeeeeeeeeeeeee003333330eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
000000000000eeeeeeeeeeeeeeeee0000000000e000000000000eeeeeeeeeeeeeeeeee000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00dddddddd222222200eeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0022222222dddddddd0eeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0022222222222222000eeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee002222222222222000eeeeeeeeeeeeeeeeeee
eeeee000000eeeeeeeeee000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee002000220220000000eeeeeeeeeeeeeeeeeee
eeee05050500eeeeeeee00000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00044400000444000eeeeeeeeeeeeeeeeeeee
eee0500000050eeeeee0060050000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00444440e0444440eeeeeeeeeeeeeeeeeeeee
ee000044444400eeee000040440400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeee
ee0044440000400eee0004400000400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440e044444440eeeeeeeeeeeeeeeeeee
ee044f444474400eee004f404474400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
e00494444444900ee00094044404900eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04944440eeee04449440eeeeeeeeeeeeeeeeee
ee04444444444f0eee04440444044f0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04494440eeeeee04449440eeeeeeeeeeeeeeeee
ee000044444000eeee044044404400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04944440eeeeee044490000eeeeeeeeeeeeeeee
ee000504440f00eee500404499999eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee04494440eeeeeeee044094400eeeeeeeeeeeeeee
ee000000000000eee000504440400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00904440eeeeeeeee04099400eeeeeeeeeeeeeee
eee0000500500eeeeee0000050000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00494040eeeeeeeeeee0049400eeeeeeeeeeeeeee
ee11000000000eeeeee4000000004eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00944040eeeeeeeeeeee0009440eeeeeeeeeeeeee
e1155000000055eeee433000000333eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0094400eeeeeeeeeeeeee044440eeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee040000eeeeeeeeeeeeeeee00666660eeeeeeeeeee
eeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee00666660eeeeeeeeeee
eeeeeeeeeee00dddddddd222222200eeeeeeeeeeeeeeeeeeeee00aaaaaaaa333333300eeeeeeeeeeeeee06666600eeeeeeeeeeeeeeeeee0666660eeeeeeeeeee
eeeeeeeeeee0022222222dddddddd0eeeeeeeeeeeeeeeeeeeee0033333333aaaaaaaa0eeeeeeeeeeeeee0666660eeeeeeeeeeeeeeeee0000000000eeeeeeeeee
eeeeeeeeeee0022222222222222200eeeeeeeeeeeeeeeeeeeee0033333333333333300eeeeeeeeeeeeee0666660eeeeeeeeeeeeeeeee00222222200eeeeeeeee
eeeeeeeeeee0022222222222222000eeeeeeeeeeeeeeeeeeeee0033333333333333000eeeeeeeeeeee0000000000eeeeeeeeeeeeeeee00222222220eeeeeeeee
eeeeeeeeeee0020002222200022000eeeeeeeeeeeeeeeeeeeee0030003333300033000eeeeeeeeeeee002222222000eeeeeeeeeeeeee00000000000eeeeeeeee
eeeeeeeeeee000444020004440000eeeeeeeeeeeeeeeeeeeeee000444030004440000eeeeeeeeeeeee000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee00444440004444400eeeeeeeeeeeeeeeeeeeeeee00444440004444400eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee0000000000000000000eeeeeeeeeeeeeeeeee
eeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeeeeee00aaaaaaaa333333300eeeeeeeeeeeeeeeeee
eeeeeeeeee04444440eee04444440eeeeeeeeeeeeeeeeeeeee04444440eee04444440eeeeeeeeeeeeeeeeeeeeee0033333333aaaaaaaa0eeeeeeeeeeeeeeeeee
eeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeeeeee0033333333333333000eeeeeeeeeeeeeeeeee
eeeeeeeee04944440eeeee04449440eeeeeeeeeeeeeeeeeee04944440eeeee04449440eeeeeeeeeeeeeeeeeeeee003333333333333000eeeeeeeeeeeeeeeeeee
eeeeeeeee04944440eeeeee04449440eeeeeeeeeeeeeeeeee04944440eeeeee04449440eeeeeeeeeeeeeeeeeeee003000330330000000eeeeeeeeeeeeeeeeeee
eeeeeeee04944440eeeeeee04449000eeeeeeeeeeeeeeeee04944440eeeeeee04449000eeeeeeeeeeeeeeeeeeee00044400000444000eeeeeeeeeeeeeeeeeeee
eeeeeeee00904440eeeeeeee04049400eeeeeeeeeeeeeeee00904440eeeeeeee04049400eeeeeeeeeeeeeeeeeee00444440e0444440eeeeeeeeeeeeeeeeeeeee
eeeeeee00494040eeeeeeeee04099400eeeeeeeeeeeeeee00494040eeeeeeeee04099400eeeeeeeeeeeeeeeeeee04444440e04444440eeeeeeeeeeeeeeeeeeee
eeeeeee00944040eeeeeeeeee0044900eeeeeeeeeeeeeee00944040eeeeeeeeee0044900eeeeeeeeeeeeeeeeeee04444440e044444440eeeeeeeeeeeeeeeeeee
eeeeeee0094400eeeeeeeeeeee0000440eeeeeeeeeeeeee0094400eeeeeeeeeeee0000440eeeeeeeeeeeeeeeee04444440eee044444440eeeeeeeeeeeeeeeeee
eeeeeee040000eeeeeeeeeeeeee044440eeeeeeeeeeeeee040000eeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee04944440eeee04449440eeeeeeeeeeeeeeeeee
eeeeeee04440eeeeeeeeeeeeeeee044440eeeeeeeeeeeee04440eeeeeeeeeeeeeeee044440eeeeeeeeeeeeeee04494440eeeeee04449440eeeeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeee04066660eeeeeeeee0333330eeeeeeeeeeeeeeee04033330eeeeeeeeeeeee04944440eeeeee044490000eeeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeeee0066660eeeeeeeee0333330eeeeeeeeeeeeeeeee0033330eeeeeeeeeeee04494440eeeeeeee044094400eeeeeeeeeeeeeee
eeeee0666660eeeeeeeeeeeeeeeee0066660eeeeeeeee0333330eeeeeeeeeeeeeeeee0033330eeeeeeeeeeee00904440eeeeeeeee04099400eeeeeeeeeeeeeee
ee0000000000eeeeeeeeeeeeeeee000000000eeeee0000000000eeeeeeeeeeeeeeee000000000eeeeeeeeee00494040eeeeeeeeeee0049400eeeeeeeeeeeeeee
ee002222222000eeeeeeeeeeeeee00222222200eee003333333000eeeeeeeeeeeeee00333333300eeeeeeee00944040eeeeeeeeeeee0009440eeeeeeeeeeeeee
ee000000000000eeeeeeeeeeeeee00000000000eee000000000000eeeeeeeeeeeeee00000000000eeeeeeee0094400eeeeeeeeeeeeee044440eeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee040000eeeeeeeeeeeeeeee00333330eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee044440eeeeeeeeeeeeeeeee00333330eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee03333300eeeeeeeeeeeeeeeeee0333330eeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0333330eeeeeeeeeeeeeeeee0000000000eeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0333330eeeeeeeeeeeeeeeee00333333300eeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000eeeeeeeeeeeeeeee00333333330eeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee003333333000eeeeeeeeeeeeee00000000000eeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
__gff__
__map__
__sfx__
000800000000000000000000000000000000000000000000183701c37020360223600000000000000000000000000000000000000000000000000000000000000000000
000600000867006660466500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000600000867006750566400366300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000400000447000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000a00002047024370264702a770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000600001c47020470184700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
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
