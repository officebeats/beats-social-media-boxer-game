from pathlib import Path

path = Path(__file__).resolve().parents[1] / "ring-rush.p8"
text = path.read_text(encoding="utf-8")

text = text.replace(
    "cols,rows,cell=6,12,6\nw1x,w1y,w2x,w2y=1,14,91,14",
    "cols,rows,cell=6,12,6\nw1x,w1y,w2x,w2y=0,16,92,16",
)

text = text.replace(
    """function new_board(fid)
 return {
  g=new_grid(),fid=fid or 1,piece=nil,nx=nil,
  drop_n=0,pat_i=0,pend_in=0,pend_out=0,grav=0,
  flash={},anim=0,anim_t=0,chain=0,
  resolving=false,dead=false,combo_txt=nil,combo_t=0
 }
end""",
    """function new_board(fid)
 return {
  g=new_grid(),fid=fid or 1,piece=nil,nx=nil,
  drop_n=0,pat_i=0,pend_in=0,pend_out=0,grav=0,
  flash={},anim=0,anim_t=0,chain=0,score=0,
  resolving=false,dead=false,combo_txt=nil,combo_t=0
 }
end""",
)

text = text.replace(
    """ if total>0 then send_attack(total,b,opp) end
 b.resolving=false""",
    """ if total>0 then
  send_attack(total,b,opp)
  b.score+=total*100+b.chain*50
 end
 b.resolving=false""",
)

start = text.index("function draw_gem")
end = text.index("__gfx__")
init_marker = "\nfunction _init()"
orig_tail_start = text.index(init_marker, start)
tail = text[orig_tail_start:end]

new_draw = r'''
-- ═══ SPF2T-style presentation ═══
-- dual wells, jewel gems, big center chibis, next/score chrome

function jewel(px,py,s,col,dk,hi,kind)
 rectfill(px,py,px+s-1,py+s-1,0)
 rectfill(px+1,py+1,px+s-2,py+s-2,col)
 line(px+1,py+1,px+s-2,py+1,hi)
 line(px+1,py+2,px+s-3,py+2,hi)
 line(px+1,py+1,px+1,py+s-2,hi)
 line(px+2,py+s-2,px+s-2,py+s-2,dk)
 line(px+s-2,py+2,px+s-2,py+s-2,dk)
 pset(px+2,py+2,7)
 pset(px+3,py+3,7)
 if kind=="pow" then
  rect(px+2,py+2,px+s-3,py+s-3,7)
  pset(px+s-3,py+2,10)
 elseif kind=="crash" then
  local cx,cy=px+flr(s/2),py+flr(s/2)
  for i=0,2 do
   pset(cx+i,cy,7) pset(cx-i,cy,7)
   pset(cx,cy+i,7) pset(cx,cy-i,7)
  end
  pset(cx-1,cy-1,hi) pset(cx+1,cy-1,hi)
  pset(cx-1,cy+1,hi) pset(cx+1,cy+1,hi)
 elseif kind=="ctr" then
  rectfill(px+1,py+1,px+s-2,py+s-2,dk)
  rect(px,py,px+s-1,py+s-1,col)
 end
end

function draw_gem(px,py,v)
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
 local col,dk,hi=gpal[c] or 7,gpal_dk[c] or 5,gpal_hi[c] or 7
 if isctr(v) then
  jewel(px,py,s,col,dk,hi,"ctr")
  print(ctr_t(v),px+2,py+1,7)
  return
 end
 if ispow(v) then
  jewel(px,py,s,col,dk,hi,"pow")
  return
 end
 if iscrash(v) then
  jewel(px,py,s,col,dk,hi,"crash")
  return
 end
 jewel(px,py,s,col,dk,hi,"norm")
end

function draw_pow_block(ox,oy,x,y,w,h,c)
 local px,py=ox+x*cell,oy+y*cell
 local bw,bh=w*cell,h*cell
 local col,dk,hi=gpal[c],gpal_dk[c],gpal_hi[c]
 rectfill(px,py,px+bw-1,py+bh-1,0)
 rectfill(px+1,py+1,px+bw-2,py+bh-2,col)
 line(px+1,py+1,px+bw-2,py+1,hi)
 line(px+1,py+2,px+bw-3,py+2,hi)
 line(px+1,py+1,px+1,py+bh-2,hi)
 line(px+2,py+bh-2,px+bw-2,py+bh-2,dk)
 line(px+bw-2,py+2,px+bw-2,py+bh-2,dk)
 rect(px+2,py+2,px+bw-3,py+bh-3,7)
 pset(px+3,py+3,7)
 pset(px+4,py+4,7)
 pset(px+bw-4,py+3,10)
end

function find_pow_rects(g)
 local seen,rects={},{}
 for y=0,rows-1 do
  for x=0,cols-1 do
   local k=x+y*cols
   if not seen[k] then
    local v=g[x][y]
    if ispow(v) then
     local c=colof(v)
     local w=1
     while x+w<cols and ispow(g[x+w][y]) and colof(g[x+w][y])==c and not seen[x+w+y*cols] do
      w+=1
     end
     local h=1
     local ok=true
     while y+h<rows and ok do
      for xx=x,x+w-1 do
       if not (ispow(g[xx][y+h]) and colof(g[xx][y+h])==c and not seen[xx+(y+h)*cols]) then
        ok=false
        break
       end
      end
      if ok then h+=1 end
     end
     if w>=2 and h>=2 then
      add(rects,{x,y,w,h,c})
      for yy=y,y+h-1 do
       for xx=x,x+w-1 do
        seen[xx+yy*cols]=true
       end
      end
     else
      seen[k]=true
     end
    end
   end
  end
 end
 return rects,seen
end

function draw_chibi(fid,x,y,anim,face)
 local f=fighters[fid]
 local bob=flr(t()/16)%2
 local punch=0
 if anim==1 then punch=face*5
 elseif anim==2 then punch=face*8
 elseif anim==3 then punch=face*10
 elseif anim==4 then punch=-face*3 end
 local sk,gl,tr=f.skin,f.glove,f.trunk
 local gold=f.id=="gold"
 circfill(x+7,y+30,7,0)
 rectfill(x+2,y+26,x+7,y+30,f.shoe)
 rectfill(x+10,y+25,x+15,y+30,f.shoe)
 rectfill(x+3,y+18,x+7,y+26,tr)
 rectfill(x+10,y+17,x+14,y+25,tr)
 rectfill(x+2,y+14,x+15,y+20,tr)
 if gold then
  line(x+3,y+15,x+14,y+15,10)
  line(x+3,y+19,x+14,y+19,10)
 else
  line(x+3,y+15,x+14,y+15,8)
  rectfill(x+7,y+14,x+10,y+20,0)
 end
 rectfill(x+4,y+10,x+13,y+16,sk)
 if gold then
  for i=0,2 do circ(x+8,y+12+i,3+i,10) end
  pset(x+8,y+16,9)
 else
  line(x+5,y+12,x+12,y+12,9)
  pset(x+8,y+13,10)
 end
 local gx1=x+1+punch
 local gx2=x+14+flr(punch/2)
 local gy=y+12+bob
 circfill(gx1,gy,5,gl)
 circfill(gx1,gy,4,gold and 14 or 8)
 circfill(gx1,gy,2,7)
 circfill(gx2,gy+1,5,gl)
 circfill(gx2,gy+1,4,gold and 14 or 8)
 circfill(gx2,gy+1,2,7)
 rectfill(x+6,y+8,x+11,y+11,sk)
 local hx,hy=x+8,y+4+bob
 circfill(hx,hy,8,sk)
 circfill(hx,hy,8,0)
 circfill(hx,hy,7,sk)
 if gold then
  circfill(hx,hy-3,6,0)
  rectfill(hx-5,hy-1,hx+5,hy+3,sk)
  line(hx-7,hy,hx-7,hy+3,5)
  line(hx+7,hy,hx+7,hy+3,5)
  line(hx-4,hy-1,hx-1,hy-2,0)
  line(hx+1,hy-2,hx+4,hy-1,0)
  if anim!=4 then line(hx-1,hy+3,hx+4,hy+2,8) end
  pset(hx-7,hy+1,10) pset(hx+7,hy+1,10)
 else
  for i=-3,3 do
   line(hx+i*2,hy-4,hx+i*2,hy-8-abs(i)%2,0)
  end
  circfill(hx,hy-3,5,0)
  line(hx-5,hy-1,hx-1,hy-3,0)
  line(hx+1,hy-3,hx+5,hy-1,0)
  line(hx-5,hy,hx-1,hy-2,0)
  if anim>=2 then
   rectfill(hx-3,hy+2,hx+3,hy+4,0)
   line(hx-2,hy+3,hx+2,hy+3,7)
  else
   line(hx-2,hy+3,hx+3,hy+3,0)
  end
 end
 if anim==4 then
  print("x",hx-4,hy,8)
  print("x",hx+1,hy,8)
 else
  rectfill(hx-4,hy,hx-1,hy+2,7)
  rectfill(hx+1,hy,hx+4,hy+2,7)
  pset(hx-3+(face>0 and 1 or 0),hy+1,0)
  pset(hx+2+(face>0 and 1 or 0),hy+1,0)
 end
end

function draw_well(b,ox,oy)
 rectfill(ox-3,oy-3,ox+cols*cell+2,oy+rows*cell+2,0)
 rectfill(ox-2,oy-2,ox+cols*cell+1,oy+rows*cell+1,7)
 rectfill(ox-1,oy-1,ox+cols*cell,oy+rows*cell,1)
 local pulse=(flr(t()/10)%2==0) and 2 or 1
 rectfill(ox+killcol*cell,oy,ox+killcol*cell+cell-1,oy+rows*cell-1,pulse)
 local rects,seen=find_pow_rects(b.g)
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=b.g[x][y]
   if not isempty(v) then
    if not (ispow(v) and seen[x+y*cols]) then
     draw_gem(ox+x*cell,oy+y*cell,v)
    end
   else
    pset(ox+x*cell+3,oy+y*cell+3,0)
   end
  end
 end
 for r in all(rects) do
  draw_pow_block(ox,oy,r[1],r[2],r[3],r[4],r[5])
 end
 for f in all(b.flash) do
  rectfill(ox+f[1]*cell,oy+f[2]*cell,ox+f[1]*cell+5,oy+f[2]*cell+5,7)
  circfill(ox+f[1]*cell+3,oy+f[2]*cell+3,4,10)
 end
 if b.piece and not b.resolving then
  local p=b.piece
  local x1,y1,x2,y2=pair_cells(p)
  draw_gem(ox+x1*cell,oy+y1*cell,p.a==99 and 99 or p.a)
  draw_gem(ox+x2*cell,oy+y2*cell,p.b==99 and 99 or p.b)
 end
 if b.pend_in>0 then
  rectfill(ox-2,oy-11,ox+cols*cell+1,oy-4,0)
  rect(ox-2,oy-11,ox+cols*cell+1,oy-4,8)
  print("!! "..b.pend_in,ox,oy-10,8)
 end
 if b.combo_t>0 then
  print(b.combo_txt,ox+10,oy+28,10)
 end
end

function draw_next_box(b,ox,oy,name,ncol)
 rectfill(ox,oy,ox+18,oy+28,0)
 rect(ox,oy,ox+18,oy+28,7)
 print("next",ox+2,oy+1,ncol)
 if b and b.nx then
  draw_gem(ox+6,oy+8,b.nx[1]==99 and 99 or b.nx[1])
  draw_gem(ox+6,oy+15,b.nx[2]==99 and 99 or b.nx[2])
 end
 rectfill(ox-2,oy+30,ox+20,oy+38,0)
 rect(ox-2,oy+30,ox+20,oy+38,ncol)
 print(sub(name,1,6),ox-1,oy+32,ncol)
end

function draw_score_box(sc,ox,oy,col)
 rectfill(ox,oy,ox+36,oy+14,0)
 rectfill(ox+1,oy+1,ox+35,oy+13,2)
 rect(ox,oy,ox+36,oy+14,col)
 print("score",ox+4,oy+2,col)
 local s=tostr(flr(sc or 0))
 while #s<6 do s="0"..s end
 print(s,ox+4,oy+8,7)
end

function draw_center_stage()
 local x0,x1=38,90
 rectfill(x0,16,x1,88,1)
 for i=0,6 do
  rectfill(x0,16+i*3,x1,18+i*3,1+(i%2))
 end
 for i=0,5 do
  local c=({8,14,12,10,11,9})[i+1]
  rectfill(x0+4+i*8,28,x0+10+i*8,40,c)
 end
 rectfill(x0,70,x1,88,5)
 rectfill(x0,70,x1,72,6)
 rectfill(x0+4,74,x1-4,86,2)
 line(x0+4,78,x1-4,78,14)
 line(x0+4,82,x1-4,82,8)
 for i=0,10 do
  circfill(x0+6+i*4,66+sin(i+t()/30),2,0)
 end
end

function draw_parts()
 for p in all(parts) do
  pset(flr(p.x),flr(p.y),p.c)
  if p.life>6 then pset(flr(p.x)+1,flr(p.y),7) end
 end
end

function draw_fight()
 local sx=shake>0 and (rnd(shake*2)-shake) or 0
 local sy=shake>0 and (rnd(shake*2)-shake) or 0
 camera(-sx,-sy)
 cls(0)
 rectfill(0,0,0,127,14)
 rectfill(127,0,127,127,8)
 draw_center_stage()
 local f1,f2=fighters[p1.fid],fighters[p2.fid]
 rectfill(40,0,87,14,0)
 rect(40,0,87,14,10)
 print("ring",52,2,10)
 print("rush",54,8,14)
 draw_next_box(p1,20,0,f1.short,14)
 draw_next_box(p2,90,0,f2.short,8)
 rectfill(108,0,126,8,0)
 rect(108,0,126,8,12)
 print("go",112,2,12)
 draw_well(p1,w1x,w1y)
 draw_well(p2,w2x,w2y)
 draw_chibi(p1.fid,40,48,p1.anim,1)
 draw_chibi(p2.fid,68,48,p2.anim,-1)
 if (p1.anim>=2 or p2.anim>=2) and flr(t()/2)%2==0 then
  circfill(64,62,3+min(3,p1.anim),7)
  print("*",62,58,10)
 end
 draw_score_box(p1.score,20,100,14)
 rectfill(58,102,70,112,0)
 rect(58,102,70,112,10)
 print("vs",60,105,10)
 draw_score_box(p2.score,74,100,8)
 rectfill(0,120,127,127,0)
 print("z:rot  x:drop  arrows:move",12,121,5)
 if pause then
  rectfill(40,50,88,72,0)
  rect(40,50,88,72,10)
  print("paused",50,58,7)
 end
 camera()
 draw_parts()
end

function draw_title()
 cls(0)
 for i=0,5 do
  for j=0,3 do
   jewel(4+i*6,90+j*6,6,gpal[1+(i+j)%4],gpal_dk[1+(i+j)%4],gpal_hi[1+(i+j)%4],"norm")
   jewel(90+i*6,90+j*6,6,gpal[1+(i+j+2)%4],gpal_dk[1+(i+j+2)%4],gpal_hi[1+(i+j+2)%4],j==1 and "crash" or "norm")
  end
 end
 rectfill(18,10,109,78,0)
 rect(18,10,109,78,7)
 rect(20,12,107,76,10)
 print("ring rush",44,18,10)
 print("puzzle fighters",30,28,14)
 print("spf2t-style crash gems",22,40,6)
 print("trap gym edition",34,48,5)
 if flr(t()/15)%2==0 then
  print(">> press z <<",38,62,7)
 end
 draw_chibi(1,30,70,2,1)
 draw_chibi(2,78,70,3,-1)
 print(fighters[1].short,24,118,14)
 print(fighters[2].short,78,118,8)
end

function draw_select()
 cls(1)
 rectfill(0,0,127,12,0)
 print("select fighter",36,3,10)
 for i=1,2 do
  local f=fighters[i]
  local x=4+(i-1)*64
  local on=sel==i
  local col=i==1 and 10 or 8
  rectfill(x,16,x+58,104,0)
  rect(x,16,x+58,104,on and col or 5)
  if on then rect(x+1,17,x+57,103,col) end
  rectfill(x+4,20,x+54,36,1)
  for j=1,6 do
   rectfill(x+6+(j-1)*8,24,x+12+(j-1)*8,32,gpal[f.pat[j]])
  end
  draw_chibi(i,x+16,42,on and (1+flr(t()/12)%3) or 0,1)
  print(f.name,x+3,88,7)
  print(f.tag,x+3,96,on and col or 6)
 end
 print("left/right  z=lock in",24,112,6)
end

function draw_result()
 cls(0)
 local wid=winner==1 and p1.fid or p2.fid
 local w=fighters[wid]
 for i=0,24 do
  jewel((i*17+flr(t()*2))%120,(i*23+flr(t()))%70,4,gpal[1+i%4],gpal_dk[1+i%4],gpal_hi[1+i%4],"norm")
 end
 rectfill(16,20,111,78,0)
 rect(16,20,111,78,7)
 rect(18,22,109,76,10)
 print("k.o.",56,28,8)
 print(w.name,24,40,10)
 print("wins!",54,50,7)
 print('"'..w.quote..'"',14,60,w.accent or 14)
 draw_chibi(wid,52,78,3,1)
 print("z title",48,118,5)
end

'''

text = text[:start] + new_draw + tail
path.write_text(text, encoding="utf-8", newline="\n")
print("ok", path)
print("tokens check later")
