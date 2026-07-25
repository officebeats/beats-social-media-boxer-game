pico-8 cartridge // http://www.pico-8.com
version 42
__lua__
-- ring rush — pico-8 puzzle fighter (spf2t-style)
-- original game. not based on the web prototype.

-- ═══════════════════════════════════════════
-- config
-- ═══════════════════════════════════════════
private_names=false -- true: broner / deen labels

cols,rows=6,12
cell=6
-- well origins
w1x,w1y=2,12
w2x,w2y=90,12
killcol=3 -- 0-based; 4th column

-- gem colors → pico palette
gpal={8,11,12,10} -- r g b y
gpal_dk={2,3,1,9}

grav_frames=40
lock_delay=8

-- ═══════════════════════════════════════════
-- cell encoding
-- 0 empty
-- 1-4 normal color
-- 5-8 crash color (c-4)
-- 41-44 power color (c-40)
-- counter: 16 + (c-1) + timer*4   timer 0-5 → 16..39
-- ═══════════════════════════════════════════
function isempty(v) return not v or v==0 end
function isnorm(v) return v and v>=1 and v<=4 end
function iscrash(v) return v and v>=5 and v<=8 end
function ispow(v) return v and v>=41 and v<=44 end
function isctr(v) return v and v>=16 and v<=39 end

function colof(v)
 if isempty(v) then return 0 end
 if v<=4 then return v end
 if v<=8 then return v-4 end
 if v>=41 and v<=44 then return v-40 end
 if isctr(v) then return ((v-16)%4)+1 end
 return 0
end

function mknorm(c) return c end
function mkcrash(c) return c+4 end
function mkpow(c) return c+40 end
function mkctr(c,t) return 16+(c-1)+mid(0,t,5)*4 end
function ctr_t(v) return flr((v-16)/4) end
function as_norm(v)
 local c=colof(v)
 if c==0 then return 0 end
 return mknorm(c)
end

-- ═══════════════════════════════════════════
-- fighters (patterns only — no web balance)
-- ═══════════════════════════════════════════
fighters={
 {
  id="gold",
  name=private_names and "broner" or "gold problem",
  tag=private_names and "the problem" or "neon gold",
  -- staggered bands
  pat={1,3,1,3,1,3,4,2,4,2,4,2},
  skin=15,glove=14,trunk=10,line=1,accent=14
 },
 {
  id="crash",
  name=private_names and "deen" or "great crashout",
  tag=private_names and "crashout king" or "full send",
  -- multi-color storm
  pat={1,2,3,4,1,2,3,4,1,2,3,4,2,1,4,3,2,1,4,3,2,1,4,3},
  skin=4,glove=8,trunk=9,line=0,accent=9
 }
}

-- ═══════════════════════════════════════════
-- board helpers
-- ═══════════════════════════════════════════
function new_grid()
 local g={}
 for x=0,cols-1 do
  g[x]={}
  for y=0,rows-1 do g[x][y]=0 end
 end
 return g
end

function grid_get(g,x,y)
 if x<0 or x>=cols or y<0 or y>=rows then return -1 end
 return g[x][y]
end

function grid_set(g,x,y,v)
 if x>=0 and x<cols and y>=0 and y<rows then g[x][y]=v end
end

function new_board(fid)
 return {
  g=new_grid(),
  fid=fid or 1,
  piece=nil,
  nx=nil, -- next pair {a,b}
  drop_n=0,
  pat_i=0,
  pend_in=0,
  pend_out=0,
  grav=0,
  flash={}, -- clear flash cells
  anim=0, -- 0 idle 1 jab 2 special 3 super 4 hit
  anim_t=0,
  chain=0,
  resolving=false,
  dead=false
 }
end

-- ═══════════════════════════════════════════
-- pieces
-- ═══════════════════════════════════════════
function rand_color()
 return 1+flr(rnd(4))
end

function make_pair_vals(b)
 b.drop_n+=1
 local a,c
 if b.drop_n%25==0 then
  -- diamond encoded as 99 + partner color
  a=99
  c=rand_color()
 else
  a=rnd()<0.28 and mkcrash(rand_color()) or mknorm(rand_color())
  c=rnd()<0.28 and mkcrash(rand_color()) or mknorm(rand_color())
 end
 return {a,c}
end

function spawn_piece(b)
 if b.nx==nil then b.nx=make_pair_vals(b) end
 local v=b.nx
 b.nx=make_pair_vals(b)
 -- tick counters on new piece
 tick_counters(b)
 -- apply pending garbage before spawn
 if b.pend_in>0 then
  drop_counters(b,b.pend_in)
  b.pend_in=0
 end
 -- spawn check kill column
 if not isempty(grid_get(b.g,killcol,0))
  or not isempty(grid_get(b.g,killcol,1)) then
  b.dead=true
  b.piece=nil
  return
 end
 b.piece={
  a=v[1],b=v[2],
  x=killcol,y=0,
  rot=0 -- 0: a above b (vertical). rot 0..3
 }
 b.grav=0
end

-- cell offsets for pair relative to pivot (pivot = second gem at rot0 bottom)
function pair_cells(p)
 -- pivot at p.x,p.y is gem b; gem a is offset by rot
 local ox,oy=0,-1
 if p.rot==1 then ox,oy=1,0 end
 if p.rot==2 then ox,oy=0,1 end
 if p.rot==3 then ox,oy=-1,0 end
 return p.x+ox,p.y+oy,p.x,p.y
end

function pair_ok(g,p,nx,ny,nrot)
 local tmp={x=nx,y=ny,rot=nrot,a=p.a,b=p.b}
 local x1,y1,x2,y2=pair_cells(tmp)
 if x1<0 or x1>=cols or y1<0 or y1>=rows then return false end
 if x2<0 or x2>=cols or y2<0 or y2>=rows then return false end
 if not isempty(grid_get(g,x1,y1)) then return false end
 if not isempty(grid_get(g,x2,y2)) then return false end
 return true
end

function try_move(b,dx,dy)
 local p=b.piece
 if not p then return false end
 if pair_ok(b.g,p,p.x+dx,p.y+dy,p.rot) then
  p.x+=dx p.y+=dy
  return true
 end
 return false
end

function try_rot(b,dir)
 local p=b.piece
 if not p then return false end
 local nr=(p.rot+dir)%4
 if pair_ok(b.g,p,p.x,p.y,nr) then
  p.rot=nr
  return true
 end
 -- wall kicks
 for _,k in pairs({{-1,0},{1,0},{0,-1}}) do
  if pair_ok(b.g,p,p.x+k[1],p.y+k[2],nr) then
   p.x+=k[1] p.y+=k[2] p.rot=nr
   return true
  end
 end
 return false
end

function lock_piece(b)
 local p=b.piece
 if not p then return end
 local x1,y1,x2,y2=pair_cells(p)
 -- diamond (99): land partner gem, wipe all of that color
 if p.a==99 or p.b==99 then
  local partner=p.a==99 and p.b or p.a
  local dc=colof(partner)
  if dc==0 then dc=rand_color() end
  if p.a!=99 then grid_set(b.g,x1,y1,p.a) end
  if p.b!=99 then grid_set(b.g,x2,y2,p.b) end
  b.piece=nil
  b.resolving=true
  b.chain=0
  b._diamond=dc
  return
 end
 grid_set(b.g,x1,y1,p.a)
 grid_set(b.g,x2,y2,p.b)
 b.piece=nil
 b.resolving=true
 b.chain=0
 b._diamond=nil
end

-- ═══════════════════════════════════════════
-- gravity
-- ═══════════════════════════════════════════
function apply_gravity(g)
 local moved=false
 for x=0,cols-1 do
  local w=rows-1
  for y=rows-1,0,-1 do
   local v=g[x][y]
   if not isempty(v) then
    if y!=w then
     g[x][w]=v
     g[x][y]=0
     moved=true
    end
    w-=1
   end
  end
  for y=w,0,-1 do g[x][y]=0 end
 end
 return moved
end

-- ═══════════════════════════════════════════
-- power gems: fuse max rectangles >=2x2
-- ═══════════════════════════════════════════
function fuse_power(g)
 -- mark normals that sit in any filled same-color rectangle >=2x2
 for c=1,4 do
  -- integral-style scan
  for y=0,rows-2 do
   for x=0,cols-2 do
    -- find largest rect with top-left x,y of color c (norm or pow)
    local maxw=cols-x
    for yy=y,rows-1 do
     local rowmax=0
     for xx=x,cols-1 do
      local v=g[xx][yy]
      local ok=(isnorm(v) or ispow(v)) and colof(v)==c
      if not ok then break end
      rowmax=xx-x+1
     end
     if yy==y then
      maxw=rowmax
     else
      maxw=min(maxw,rowmax)
     end
     if maxw<2 then break end
     local h=yy-y+1
     if h>=2 and maxw>=2 then
      for fy=y,yy do
       for fx=x,x+maxw-1 do
        if isnorm(g[fx][fy]) then
         g[fx][fy]=mkpow(c)
        end
       end
      end
     end
    end
   end
  end
 end
end

-- ═══════════════════════════════════════════
-- crash resolve
-- ═══════════════════════════════════════════
function flood_color(g,sx,sy,c,seen)
 local stack={{sx,sy}}
 local cells={}
 while #stack>0 do
  local n=stack[#stack]
  stack[#stack]=nil
  local x,y=n[1],n[2]
  local k=x+y*cols
  if not seen[k] then
   local v=grid_get(g,x,y)
   if v!=-1 and not isempty(v) then
    local cc=colof(v)
    local ok=(isnorm(v) or ispow(v)) and cc==c
    if ok then
     seen[k]=true
     add(cells,{x,y,v})
     add(stack,{x+1,y})
     add(stack,{x-1,y})
     add(stack,{x,y+1})
     add(stack,{x,y-1})
    end
   end
  end
 end
 return cells
end

function resolve_step(b)
 local g=b.g
 local cleared=0
 local power_n=0
 local flash={}
 local seen={}

 -- diamond clear
 if b._diamond then
  local dc=b._diamond
  b._diamond=nil
  for x=0,cols-1 do
   for y=0,rows-1 do
    local v=g[x][y]
    if not isempty(v) and colof(v)==dc then
     g[x][y]=0
     cleared+=1
     if ispow(v) then power_n+=1 end
     add(flash,{x,y})
    end
   end
  end
  b.flash=flash
  b.chain+=1
  return cleared,power_n,true
 end

 -- find crash gems and clear connected
 local crashes={}
 for x=0,cols-1 do
  for y=0,rows-1 do
   if iscrash(g[x][y]) then
    add(crashes,{x,y,colof(g[x][y])})
   end
  end
 end
 if #crashes==0 then return 0,0,false end

 local to_clear={} -- set of keys
 for cr in all(crashes) do
  local cx,cy,c=cr[1],cr[2],cr[3]
  -- always remove crash itself
  local ck=cx+cy*cols
  to_clear[ck]={cx,cy,g[cx][cy]}
  -- flood from neighbors of crash
  for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
    local cells=flood_color(g,cx+d[1],cy+d[2],c,seen)
    for cell in all(cells) do
     local k=cell[1]+cell[2]*cols
     to_clear[k]=cell
    end
  end
  -- also if crash sits on same color group touching — flood from crash pos
  -- (crash doesn't count as normal, so check neighbors only is correct)
 end

 -- counters of matching color adjacent to any cleared cell
 for k,cell in pairs(to_clear) do
  local x,y=cell[1],cell[2]
  local c=colof(cell[3])
  if c==0 and iscrash(cell[3]) then c=colof(cell[3]) end
  for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
   local nx,ny=x+d[1],y+d[2]
   local v=grid_get(g,nx,ny)
   if isctr(v) and colof(v)==c then
    to_clear[nx+ny*cols]={nx,ny,v}
   end
  end
 end

 for k,cell in pairs(to_clear) do
  local x,y,v=cell[1],cell[2],cell[3]
  if ispow(v) then power_n+=1 end
  g[x][y]=0
  cleared+=1
  add(flash,{x,y})
 end

 b.flash=flash
 if cleared>0 then b.chain+=1 end
 return cleared,power_n,cleared>0
end

function attack_from(cleared,power_n,chain,is_diamond)
 local base=cleared+power_n
 local atk=max(0,base-2)+max(0,chain-1)*2
 if is_diamond then atk=flr(atk*0.6) end
 return atk
end

function tick_counters(b)
 local g=b.g
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=g[x][y]
   if isctr(v) then
    local t=ctr_t(v)
    local c=colof(v)
    if t<=0 then
     g[x][y]=mknorm(c)
    else
     g[x][y]=mkctr(c,t-1)
    end
   end
  end
 end
end

function drop_counters(b,n)
 if n<=0 then return end
 local f=fighters[b.fid]
 local g=b.g
 local placed=0
 local i=0
 while placed<n do
  local c=f.pat[(b.pat_i%#f.pat)+1]
  b.pat_i+=1
  local start=(i)%cols
  local ok=false
  for o=0,cols-1 do
   local x=(start+o)%cols
   if isempty(g[x][0]) then
    g[x][0]=mkctr(c,5)
    placed+=1
    ok=true
    break
   end
  end
  if not ok then break end
  i+=1
 end
 apply_gravity(g)
 fuse_power(g)
end

-- sousai: send attack from attacker board to defender
function send_attack(atk,attacker,defender)
 if atk<=0 then return end
 -- cancel incoming on attacker first
 if attacker.pend_in>0 then
  local c=min(atk,attacker.pend_in)
  attacker.pend_in-=c
  atk-=c
 end
 if atk>0 then
  defender.pend_in+=atk
 end
 -- anim tier
 if atk>=9 then attacker.anim=3
 elseif atk>=4 then attacker.anim=2
 elseif atk>=1 then attacker.anim=1
 end
 attacker.anim_t=20
 if atk>=1 then
  defender.anim=4
  defender.anim_t=16
 end
end

function finish_resolve(b,opp)
 apply_gravity(b.g)
 fuse_power(b.g)
 local total_atk=0
 local guard=0
 while guard<20 do
  guard+=1
  local is_dia=b._diamond!=nil
  local cl,pw,did=resolve_step(b)
  if not did then break end
  total_atk+=attack_from(cl,pw,b.chain,is_dia)
  apply_gravity(b.g)
  fuse_power(b.g)
 end
 if total_atk>0 then
  send_attack(total_atk,b,opp)
 end
 b.resolving=false
 b.flash={}
 b.chain=0
 if not b.dead then spawn_piece(b) end
end

-- ═══════════════════════════════════════════
-- cpu ai (greedy placement)
-- ═══════════════════════════════════════════
function board_height(g)
 local h=0
 for x=0,cols-1 do
  for y=0,rows-1 do
   if not isempty(g[x][y]) then
    h=max(h,rows-y)
    break
   end
  end
 end
 return h
end

function score_grid(g)
 -- prefer clearing potential + low height + power gems
 local sc=0
 sc-=board_height(g)*3
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=g[x][y]
   if ispow(v) then sc+=4 end
   if iscrash(v) then
    -- nearby same color
    local c=colof(v)
    for _,d in pairs({{1,0},{-1,0},{0,1},{0,-1}}) do
     local n=grid_get(g,x+d[1],y+d[2])
     if (isnorm(n) or ispow(n)) and colof(n)==c then sc+=6 end
    end
   end
  end
 end
 -- kill col pressure
 for y=0,5 do
  if not isempty(g[killcol][y]) then sc-=8 end
 end
 return sc
end

function clone_grid(g)
 local n=new_grid()
 for x=0,cols-1 do
  for y=0,rows-1 do n[x][y]=g[x][y] end
 end
 return n
end

function cpu_think(b)
 local p=b.piece
 if not p then return end
 local best,bx,by,br=-9999,p.x,p.y,p.rot
 for rot=0,3 do
  for x=0,cols-1 do
   -- drop from top
   local ty=0
   local ok=true
   if not pair_ok(b.g,p,x,0,rot) then
    -- try y=1
    if pair_ok(b.g,p,x,1,rot) then ty=1 else ok=false end
   end
   if ok then
    local y=ty
    while pair_ok(b.g,p,x,y+1,rot) do y+=1 end
    local ng=clone_grid(b.g)
    local tmp={a=p.a,b=p.b,x=x,y=y,rot=rot}
    local x1,y1,x2,y2=pair_cells(tmp)
    if p.a!=99 then grid_set(ng,x1,y1,p.a==99 and 0 or p.a) end
    if p.b!=99 then grid_set(ng,x2,y2,p.b==99 and 0 or p.b) end
    if p.a==99 then grid_set(ng,x1,y1,0) end
    if p.b==99 then grid_set(ng,x2,y2,0) end
    apply_gravity(ng)
    fuse_power(ng)
    local sc=score_grid(ng)+rnd(2)
    if sc>best then best,bx,by,br=sc,x,y,rot end
   end
  end
 end
 -- step toward best
 if p.rot!=br then try_rot(b,1) return end
 if p.x<br then try_move(b,1,0) return end
 if p.x>br then try_move(b,-1,0) return end
 -- hard drop
 while try_move(b,0,1) do end
 lock_piece(b)
end

-- ═══════════════════════════════════════════
-- game state
-- ═══════════════════════════════════════════
scene="title" -- title select fight result
sel=1
p1_fid,p2_fid=1,2
p1,p2=nil,nil
winner=0
das_t,das_d=0,0
pause=false
cpu_timer=0

function start_fight()
 p1=new_board(p1_fid)
 p2=new_board(p2_fid)
 spawn_piece(p1)
 spawn_piece(p2)
 winner=0
 pause=false
 scene="fight"
end

function update_board_player(b,opp,is_cpu)
 if b.dead or b.resolving then return end
 if not b.piece then
  if not b.dead then spawn_piece(b) end
  return
 end
 if is_cpu then
  cpu_timer+=1
  if cpu_timer>=8 then
   cpu_timer=0
   cpu_think(b)
  end
 else
  -- das left/right
  if btnp(0) then try_move(b,-1,0) das_t=12 das_d=-1 end
  if btnp(1) then try_move(b,1,0) das_t=12 das_d=1 end
  if btn(0) or btn(1) then
   local d=btn(0) and -1 or 1
   das_t-=1
   if das_t<=0 then
    try_move(b,d,0)
    das_t=3
   end
  end
  if btnp(2) then -- up unused
  end
  if btn(3) then -- soft
   if try_move(b,0,1) then b.grav=0 else end
  end
  if btnp(4) then try_rot(b,1) end -- z
  if btnp(5) then -- x hard drop
   while try_move(b,0,1) do end
   lock_piece(b)
   return
  end
 end
 -- gravity
 b.grav+=1
 local gf=grav_frames
 if not is_cpu and btn(3) then gf=2 end
 if b.grav>=gf then
  b.grav=0
  if not try_move(b,0,1) then
   lock_piece(b)
  end
 end
end

function update_resolve(b,opp)
 if not b.resolving then return end
 -- one-frame style resolve for snappy play; flash drawn once
 finish_resolve(b,opp)
end

-- ═══════════════════════════════════════════
-- draw
-- ═══════════════════════════════════════════
function draw_gem_at(px,py,v,small)
 if isempty(v) then return end
 local s=small and 3 or cell
 local c=colof(v)
 if v==99 or (type(v)=="number" and v>=99) then
  -- diamond
  local cx,cy=px+s/2,py+s/2
  for i=0,s/2 do
   line(cx-i,cy-s/2+i,cx+i,cy-s/2+i,7)
   line(cx-i,cy+s/2-i,cx+i,cy+s/2-i,6)
  end
  return
 end
 local col=gpal[c] or 7
 local dk=gpal_dk[c] or 5
 if isctr(v) then
  rectfill(px,py,px+s-1,py+s-1,dk)
  rect(px,py,px+s-1,py+s-1,col)
  local t=ctr_t(v)
  print(t,px+2,py+1,7)
  return
 end
 -- body
 rectfill(px+1,py+1,px+s-2,py+s-2,col)
 rect(px,py,px+s-1,py+s-1,0)
 -- specular
 pset(px+2,py+2,7)
 if ispow(v) then
  rect(px+1,py+1,px+s-2,py+s-2,7)
 end
 if iscrash(v) then
  -- star burst
  local cx,cy=px+flr(s/2),py+flr(s/2)
  pset(cx,cy,7)
  pset(cx-1,cy,7) pset(cx+1,cy,7)
  pset(cx,cy-1,7) pset(cx,cy+1,7)
  pset(cx-1,cy-1,0) pset(cx+1,cy+1,0)
 end
end

function draw_well(b,ox,oy,flip)
 -- frame
 rectfill(ox-1,oy-1,ox+cols*cell,oy+rows*cell,1)
 rect(ox-1,oy-1,ox+cols*cell,oy+rows*cell,7)
 -- danger col tint
 rectfill(ox+killcol*cell,oy,ox+killcol*cell+cell-1,oy+rows*cell-1,2)
 -- cells
 for x=0,cols-1 do
  for y=0,rows-1 do
   local v=b.g[x][y]
   if not isempty(v) then
    draw_gem_at(ox+x*cell,oy+y*cell,v)
   end
  end
 end
 -- flash
 for f in all(b.flash) do
  rectfill(ox+f[1]*cell,oy+f[2]*cell,ox+f[1]*cell+cell-1,oy+f[2]*cell+cell-1,7)
 end
 -- active piece
 if b.piece and not b.resolving then
  local p=b.piece
  local x1,y1,x2,y2=pair_cells(p)
  local va,vb=p.a,p.b
  if va==99 then
   draw_gem_at(ox+x1*cell,oy+y1*cell,99)
  else
   draw_gem_at(ox+x1*cell,oy+y1*cell,va)
  end
  if vb==99 then
   draw_gem_at(ox+x2*cell,oy+y2*cell,99)
  else
   draw_gem_at(ox+x2*cell,oy+y2*cell,vb)
  end
 end
 -- pending in
 if b.pend_in>0 then
  print("+"..b.pend_in,ox,oy-7,8)
 end
end

function draw_chibi(f,x,y,anim,face)
 -- super deformed boxer
 local sk,gl,tr,ln,ac=f.skin,f.glove,f.trunk,f.line,f.accent
 local bob=flr(t()/20)%2
 local ox=0
 if anim==1 then ox=face*3 end
 if anim==2 then ox=face*5 end
 if anim==3 then ox=face*7 end
 if anim==4 then ox=-face*2 end
 x+=ox
 -- shadow
 circfill(x+4,y+20,5,1)
 -- legs
 rectfill(x+2,y+14,x+4,y+19,tr)
 rectfill(x+6,y+14,x+8,y+19,tr)
 -- torso
 rectfill(x+2,y+9,x+9,y+14,tr)
 -- chain / accent
 pset(x+5,y+10,ac) pset(x+6,y+11,ac)
 -- gloves
 local gy=y+10+bob
 circfill(x+1+ox/2,gy,3,gl)
 circfill(x+10+ox/2,gy,3,gl)
 circfill(x+1+ox/2,gy,2,7)
 circfill(x+10+ox/2,gy,2,7)
 -- head
 circfill(x+5,y+5+bob,5,sk)
 circfill(x+5,y+5+bob,5,ln)
 circfill(x+5,y+5+bob,4,sk)
 -- eyes
 local ey=y+4+bob
 if anim==4 then
  print("x",x+2,ey,0)
  print("x",x+6,ey,0)
 else
  pset(x+3,ey,0) pset(x+7,ey,0)
  if anim==3 then pset(x+3,ey-1,7) end
 end
 -- mouth
 if anim>=2 then
  line(x+3,y+7+bob,x+7,y+7+bob,0)
 else
  pset(x+5,y+7+bob,0)
 end
end

function draw_next(b,ox,oy)
 print("next",ox,oy,6)
 if b.nx then
  local a,c=b.nx[1],b.nx[2]
  if a==99 then draw_gem_at(ox,oy+7,99) else draw_gem_at(ox,oy+7,a) end
  if c==99 then draw_gem_at(ox+7,oy+7,99) else draw_gem_at(ox+7,oy+7,c) end
 end
end

function draw_stage()
 cls(1)
 -- ring floor
 rectfill(0,100,127,127,5)
 rectfill(0,100,127,102,7)
 -- ropes
 line(40,30,40,100,14)
 line(87,30,87,100,14)
 line(40,50,87,50,7)
 line(40,70,87,70,8)
 -- crowd dots
 for i=0,20 do
  pset(4+i*6,4+sin(i+t()/30)*2,flr(rnd(3))+5)
 end
end

function draw_fight()
 draw_stage()
 local f1,f2=fighters[p1.fid],fighters[p2.fid]
 -- names
 print(sub(f1.name,1,10),1,1,7)
 print("vs",60,1,10)
 print(sub(f2.name,1,10),78,1,7)
 draw_well(p1,w1x,w1y)
 draw_well(p2,w2x,w2y)
 draw_chibi(f1,48,55,p1.anim,1)
 draw_chibi(f2,68,55,p2.anim,-1)
 draw_next(p1,2,100)
 draw_next(p2,90,100)
 print("z:rot x:drop",36,120,5)
 if pause then
  rectfill(40,50,88,70,0)
  print("paused",50,58,7)
 end
end

function draw_title()
 cls(0)
 -- gem border
 for i=0,15 do
  draw_gem_at(i*8,0,mknorm(1+i%4),true)
  draw_gem_at(i*8,122,mknorm(1+(i+2)%4),true)
 end
 print("ring rush",40,30,10)
 print("puzzle fighters",28,40,14)
 print("gba crash-gem style",22,52,6)
 print("z/x start",44,80,7)
 print("arrows:move",40,90,5)
 -- mini boxers
 draw_chibi(fighters[1],40,100,0,1)
 draw_chibi(fighters[2],72,100,0,-1)
end

function draw_select()
 cls(1)
 print("choose fighter",32,8,7)
 print("<- ->  z confirm",28,18,6)
 for i=1,2 do
  local f=fighters[i]
  local x=10+(i-1)*64
  local on=sel==i
  rectfill(x,30,x+54,100,on and 2 or 0)
  rect(x,30,x+54,100,on and 10 or 5)
  draw_chibi(f,x+18,45,on and 2 or 0,1)
  print(f.name,x+4,78,7)
  print(f.tag,x+4,86,6)
 end
 print("p1: "..fighters[sel].name,20,110,10)
end

function draw_result()
 cls(0)
 local w=winner==1 and fighters[p1.fid] or fighters[p2.fid]
 print("k.o.",56,30,8)
 print(w.name,40,50,10)
 print("wins!",52,60,7)
 if winner==1 then
  print("\"still the problem\"",20,80,14)
 else
  print("\"full crashout\"",28,80,9)
 end
 print("z title",48,110,6)
 draw_chibi(w,56,90,3,1)
end

-- ═══════════════════════════════════════════
-- main
-- ═══════════════════════════════════════════
function _init()
 poke(0x5f2d,1) -- mouse optional off
 scene="title"
end

function _update()
 -- anim timers
 if p1 then
  if p1.anim_t>0 then p1.anim_t-=1 else p1.anim=0 end
 end
 if p2 then
  if p2.anim_t>0 then p2.anim_t-=1 else p2.anim=0 end
 end

 if scene=="title" then
  if btnp(4) or btnp(5) or btnp(6) then scene="select" end
 elseif scene=="select" then
  if btnp(0) then sel=1 end
  if btnp(1) then sel=2 end
  if btnp(4) or btnp(5) then
   p1_fid=sel
   p2_fid=sel==1 and 2 or 1
   start_fight()
  end
 elseif scene=="fight" then
  if btnp(6) then pause=not pause end
  if pause then return end
  update_resolve(p1,p2)
  update_resolve(p2,p1)
  if p1.resolving or p2.resolving then return end
  update_board_player(p1,p2,false)
  update_board_player(p2,p1,true)
  if p1.dead or p2.dead then
   winner=p1.dead and 2 or 1
   scene="result"
  end
 elseif scene=="result" then
  if btnp(4) or btnp(5) then scene="title" end
 end
end

function _draw()
 if scene=="title" then draw_title()
 elseif scene=="select" then draw_select()
 elseif scene=="fight" then draw_fight()
 elseif scene=="result" then draw_result()
 end
end
__gfx__
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__gff__
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__map__
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__sfx__
000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__music__
00 01424344
__label__
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000aaaa0000aaaaaa00aa00aa0000aaaa0000000000aaaa0000aa00aa0000aaaa00aa00aa00000000000000000000000001111
11110000000000000000000000000aaaa0000aaaaaa00aa00aa0000aaaa0000000000aaaa0000aa00aa0000aaaa00aa00aa00000000000000000000000001111
11110000000000000000000000000aa00aa0000aa0000aaaaaa00aa00000000000000aa00aa00aa00aa00aa000000aa00aa00000000000000000000000001111
11110000000000000000000000000aa00aa0000aa0000aaaaaa00aa00000000000000aa00aa00aa00aa00aa000000aa00aa00000000000000000000000001111
11110000000000000000000000000aaaa000000aa0000aaaaaa00aa00aa0000000000aaaa0000aa00aa0000aa0000aaaaaa00000000000000000000000001111
11110000000000000000000000000aaaa000000aa0000aaaaaa00aa00aa0000000000aaaa0000aa00aa0000aa0000aaaaaa00000000000000000000000001111
11110000000000000000000000000aa00aa0000aa0000aaaaaa00aa00aa0000000000aa00aa00aa00aa000000aa00aa00aa00000000000000000000000001111
11110000000000000000000000000aa00aa0000aa0000aaaaaa00aa00aa0000000000aa00aa00aa00aa000000aa00aa00aa00000000000000000000000001111
11110000000000000000000000000aa00aa00aaaaaa00aa00aa0000aaaa0000000000aa00aa0000aaaa00aaaa0000aa00aa00000000000000000000000001111
11110000000000000000000000000aa00aa00aaaaaa00aa00aa0000aaaa0000000000aa00aa0000aaaa00aaaa0000aa00aa00000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008878888888800bb7bbbbbbbb00cc7cccccccc00aa7aaaaaaaa008878888888800bb7bbbbbbbb00cc7cccccccc00aa7aaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888887888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888877788800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888887888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
1111000000008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa008888888888800bbbbbbbbbbb00ccccccccccc00aaaaaaaaaaa00000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000eeee0000ee00ee00eeeeee00eeeeee00ee000000eeeeee00000000000000000000000000000000000001111
11110000000000000000000000000000000000000eeee0000ee00ee00eeeeee00eeeeee00ee000000eeeeee00000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee00ee00ee00ee000000ee000000ee00ee000000ee000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee00ee00ee00ee000000ee000000ee00ee000000ee000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000eeee0000ee00ee0000ee000000ee0000ee000000eeee0000000000000000000000000000000000000001111
11110000000000000000000000000000000000000eeee0000ee00ee0000ee000000ee0000ee000000eeee0000000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee000000ee00ee00ee000000ee000000ee000000ee000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee000000ee00ee00ee000000ee000000ee000000ee000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee00000000eeee00eeeeee00eeeeee00eeeeee00eeeeee00000000000000000000000000000000000001111
11110000000000000000000000000000000000000ee00000000eeee00eeeeee00eeeeee00eeeeee00eeeeee00000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000777777000077770077007700777777007777770077770000007777000000000000000000000000000001111
11110000000000000000000000000000000000000777777000077770077007700777777007777770077770000007777000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700000077007700007700007700000077007700770000000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700000077007700007700007700000077007700770000000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700770077777700007700007777000077770000007700000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700770077777700007700007777000077770000007700000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700770077007700007700007700000077007700000077000000000000000000000000000001111
11110000000000000000000000000000000000000007700007700770077007700007700007700000077007700000077000000000000000000000000000001111
11110000000000000000000000000000000000000777777000077770077007700007700007777770077007700777700000000000000000000000000000001111
11110000000000000000000000000000000000000777777000077770077007700007700007777770077007700777700000000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
11110000000000000000000000000000fffffffff000000000000000000000000000000000000000000000004444444440000000000000000000000000001111
111100000000000000000000000000eefffffffffee0000000000000000000000000000000000000000000884444444448800000000000000000000000001111
111100000000000000000000000000eefffffffffee0000000000000000000000000000000000000000000884444444448800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000aa0000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee000000000000000000000a000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000a00000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee00000000000000000000000a0000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee000000000000000000000aa00000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
111100000000000000000000000000eeeeeeeeeeeee0000000000000000000000000000000000000000000888888888888800000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
