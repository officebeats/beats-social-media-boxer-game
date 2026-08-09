pico-8 cartridge // http://www.pico-8.com
version 32
__lua__
-- crash out: ring rush (v1.0.0-alpha.2)
-- pico-8 puzzle boxing — broner vs deen
-- dual detonation system (gdd 4.5)

-- gem types:
--  1=red 2=blue 3=green 4=yellow (normal)
--  5-8 = crash orb of matching color (color+4)
--  9 = rainbow diamond  10 = counter(garbage)

function _init()
  state = 0 -- 0:title 1:battle 2:ko
  round_t = 99
  t_tick = 0
  shake = 0
  flash = 0
  msgs = {}
  parts = {}

  p1 = mk_player(4, false)
  p2 = mk_player(88, true)
  init_board(p1)
  init_board(p2)
end

function mk_player(ox, is_ai)
  return {
    x=ox, hp=100, score=0, combo=0, super=0,
    grid={}, pair=nil, is_ai=is_ai,
    state="spawn", drop_t=0, lock_d=0, clear_t=0,
    pending=nil, anim="idle", anim_t=0, ai_t=0, ai_col=2
  }
end

function init_board(p)
  p.grid = {}
  for r=1,12 do
    p.grid[r] = {}
    for c=1,6 do p.grid[r][c] = 0 end
  end
  p.hp = 100
  p.score = 0
  p.combo = 0
  p.super = 0
  p.pair = nil
  p.state = "spawn"
  p.pending = nil
end

function spawn_pair(p)
  local g1 = flr(rnd(4)) + 1
  local g2
  if rnd(1) < 0.25 then
    g2 = flr(rnd(4)) + 5  -- crash orb
  else
    g2 = flr(rnd(4)) + 1
  end
  -- choose a low ai target column for the cpu
  local best=1 minh=99
  for c=1,6 do
    local h=0
    for r=1,12 do
      if p.grid[r][c] != 0 then h=13-r break end
    end
    if h<minh then minh=h best=c end
  end
  p.ai_col = best
  p.pair = {x=3, y=1, rot=0, g1=g1, g2=g2}
  -- overflow / top-out check
  if p.grid[1][3] != 0 then
    p.hp = 0
    p.pair = nil
    p.state = "dead"
    state = 2
    ko_msg = "k.o.! "..(p==p1 and "deen" or "broner").." wins!"
    sfx(7)
    shake = 12
  else
    p.state = "fall"
  end
end

function _update()
  if state == 0 then
    if btnp(4) or btnp(5) then
      init_board(p1); init_board(p2)
      round_t = 99; t_tick = 0
      state = 1
    end
  elseif state == 1 then
    update_player(p1, false)
    update_player(p2, true)

    -- round timer
    t_tick += 1
    if t_tick >= 30 then
      t_tick = 0
      if round_t > 0 then round_t -= 1
      else
        state = 2
        if p1.hp > p2.hp then ko_msg = "time! broner wins!"
        elseif p2.hp > p1.hp then ko_msg = "time! deen wins!"
        else ko_msg = "time! draw!" end
      end
    end

    -- hp knockout check (skip if a KO was already declared this frame)
    if state == 1 and (p1.hp <= 0 or p2.hp <= 0) then
      state = 2
      if p1.hp <= 0 and p2.hp <= 0 then ko_msg = "double k.o.!"
      elseif p1.hp <= 0 then ko_msg = "k.o.! deen wins!"
      else ko_msg = "k.o.! broner wins!" end
      sfx(7)
      shake = 14
      flash = 5
    end
  elseif state == 2 then
    -- keep ticking boxer anim timers so the finisher punch/retract resolves
    update_player(p1, false)
    update_player(p2, true)
    if btnp(4) or btnp(5) then _init() end
  end

  -- shared fx timers
  if shake > 0 then shake *= 0.85 if shake < 0.5 then shake = 0 end end
  if flash > 0 then flash -= 1 end
  for f in all(msgs) do f.y -= 0.3 f.life -= 1 if f.life <= 0 then del(msgs, f) end end
  for pt in all(parts) do
    pt.x += pt.vx pt.y += pt.vy pt.vy += 0.12 pt.life -= 1
    if pt.life <= 0 then del(parts, pt) end
  end
end

function update_player(p, is_ai)
  -- cosmetic anim timer always ticks (even on KO / dead boards) so punch
  -- and flinch poses retract back to idle instead of freezing mid-swing.
  if p.anim_t > 0 then
    p.anim_t -= 1
    if p.anim_t <= 0 then p.anim_t = 0 p.anim = "idle" end
  end

  if p.state == "dead" then return end
  if state != 1 then return end

  if p.state == "spawn" then
    spawn_pair(p)
  elseif p.state == "clearing" then
    p.clear_t -= 1
    if p.clear_t <= 0 then
      do_clear(p)
      apply_gravity(p)
      p.state = "grav"
    end
  elseif p.state == "grav" then
    if not apply_gravity(p) then
      local m = eval_matches(p)
      if m then p.state = "clearing" p.clear_t = 24
      else p.combo = 0 p.state = "spawn" end
    end
  elseif p.state == "fall" then
    if is_ai and p.pair then
      p.ai_t += 1
      if p.ai_t >= 14 then
        p.ai_t = 0
        if p.pair.x < p.ai_col and valid_pos(p, p.pair.x+1, p.pair.y, p.pair.rot) then move_pair(p, 1)
        elseif p.pair.x > p.ai_col and valid_pos(p, p.pair.x-1, p.pair.y, p.pair.rot) then move_pair(p, -1)
        else
          if rnd(1) < 0.25 then rotate_pair(p, 1) end
          if rnd(1) < 0.3 then drop_soft(p) end
        end
        if p.super >= 100 and rnd(1) < 0.15 then trigger_super(p) end
      end
    else
      if btnp(0) then move_pair(p, -1) end
      if btnp(1) then move_pair(p, 1) end
      if btnp(2) then drop_hard(p) end
      if btn(3) then drop_soft(p) end
      if btnp(4) then rotate_pair(p, -1) end
      if btnp(5) then
        if p.super >= 100 then trigger_super(p) else rotate_pair(p, 1) end
      end
    end

    if p.pair then
      p.drop_t += 1
      local interval = 40 - min(20, (99 - round_t)\4)
      if interval < 14 then interval = 14 end
      if p.drop_t >= interval then
        p.drop_t = 0
        if valid_pos(p, p.pair.x, p.pair.y+1, p.pair.rot) then
          p.pair.y += 1
        else
          p.lock_d += 1
          if p.lock_d >= 8 then p.lock_d = 0 lock_pair(p) end
        end
      end
    end
  end
end

function sub_xy(rot, x, y)
  local sx, sy = x, y
  if rot == 0 then sy -= 1
  elseif rot == 1 then sx += 1
  elseif rot == 2 then sy += 1
  elseif rot == 3 then sx -= 1 end
  return sx, sy
end

function valid_pos(p, x, y, rot)
  local sx, sy = sub_xy(rot, x, y)
  if x < 1 or x > 6 or y < 1 or y > 12 then return false end
  if sx < 1 or sx > 6 or sy < 1 or sy > 12 then return false end
  if p.grid[y][x] != 0 then return false end
  if p.grid[sy][sx] != 0 then return false end
  return true
end

function move_pair(p, dir)
  if not p.pair then return end
  if valid_pos(p, p.pair.x+dir, p.pair.y, p.pair.rot) then
    p.pair.x += dir sfx(0)
  end
end

function rotate_pair(p, dir)
  if not p.pair then return end
  local nrot = (p.pair.rot + dir + 4) % 4
  local nx, ny = p.pair.x, p.pair.y
  if not valid_pos(p, nx, ny, nrot) then
    if valid_pos(p, nx-1, ny, nrot) then nx -= 1
    elseif valid_pos(p, nx+1, ny, nrot) then nx += 1 end
  end
  if valid_pos(p, nx, ny, nrot) then
    p.pair.x = nx p.pair.y = ny p.pair.rot = nrot sfx(1)
  end
end

function drop_soft(p)
  if not p.pair then return end
  if valid_pos(p, p.pair.x, p.pair.y+1, p.pair.rot) then
    p.pair.y += 1 p.score += 1
  else lock_pair(p) end
end

function drop_hard(p)
  if not p.pair then return end
  while valid_pos(p, p.pair.x, p.pair.y+1, p.pair.rot) do
    p.pair.y += 1 p.score += 2
  end
  lock_pair(p)
end

function lock_pair(p)
  if not p.pair then return end
  local sx, sy = sub_xy(p.pair.rot, p.pair.x, p.pair.y)
  p.grid[p.pair.y][p.pair.x] = p.pair.g1
  if sy >= 1 and sy <= 12 and sx >= 1 and sx <= 6 then
    p.grid[sy][sx] = p.pair.g2
  end
  sfx(2)
  shake = max(shake, 2)
  p.pair = nil

  apply_gravity(p)
  local m = eval_matches(p)
  if m then p.state = "clearing" p.clear_t = 24
  else p.combo = 0 p.state = "spawn" end
end

function apply_gravity(p)
  local moved = false
  for pass=1,12 do
    local pm = false
    for c=1,6 do
      for r=11,1,-1 do
        if p.grid[r][c] != 0 and p.grid[r+1][c] == 0 then
          p.grid[r+1][c] = p.grid[r][c]
          p.grid[r][c] = 0
          pm = true moved = true
        end
      end
    end
    if not pm then break end
  end
  return moved
end

-- dual detonation (gdd 4.5):
-- primary: crash orb (5-8) adjacent to same-color normal flood-fills & clears.
-- secondary: 4+ contiguous same-color normal cluster auto-pops at 50% power.
function eval_matches(p)
  local clr = {}
  for r=1,12 do clr[r] = {} for c=1,6 do clr[r][c] = false end end

  -- primary: crash orbs
  for r=1,12 do
    for c=1,6 do
      local orb = p.grid[r][c]
      if orb >= 5 and orb <= 8 then
        local tc = orb - 4
        local trig = false
        for d in all({{-1,0},{1,0},{0,-1},{0,1}}) do
          local ar,ac = r+d[1], c+d[2]
          if ar>=1 and ar<=12 and ac>=1 and ac<=6 then
            if p.grid[ar][ac] == tc then trig = true end
          end
        end
        if trig then
          clr[r][c] = true
          flood(p, r, c, tc, clr)
        end
      end
    end
  end

  local pcnt = count_clr(clr)

  -- secondary: 4+ clusters (only if no primary clear happened)
  local scnt = 0
  if pcnt == 0 then
    local vis = {}
    for r=1,12 do vis[r] = {} for c=1,6 do vis[r][c] = false end end
    for r=1,12 do
      for c=1,6 do
        local g = p.grid[r][c]
        if g >= 1 and g <= 4 and not vis[r][c] then
          local grp = {}
          cluster(p, r, c, g, vis, grp)
          if #grp >= 4 then
            for cell in all(grp) do
              clr[cell[1]][cell[2]] = true
              scnt += 1
            end
          end
        end
      end
    end
  end

  local matched = pcnt > 0 or scnt > 0
  if matched then
    p.pending = {clr=clr, primary=pcnt, secondary=scnt}
  end
  return matched
end

function flood(p, r, c, tc, clr)
  local stack = {{r-1,c},{r+1,c},{r,c-1},{r,c+1}}
  while #stack > 0 do
    local cell = deli(stack, #stack)
    local cr, cc = cell[1], cell[2]
    if cr>=1 and cr<=12 and cc>=1 and cc<=6 then
      if not clr[cr][cc] and (p.grid[cr][cc] == tc or p.grid[cr][cc] == tc+4) then
        clr[cr][cc] = true
        add(stack, {cr-1,cc})
        add(stack, {cr+1,cc})
        add(stack, {cr,cc-1})
        add(stack, {cr,cc+1})
      end
    end
  end
end

function cluster(p, r, c, g, vis, grp)
  vis[r][c] = true
  add(grp, {r, c})
  for d in all({{-1,0},{1,0},{0,-1},{0,1}}) do
    local ar, ac = r+d[1], c+d[2]
    if ar>=1 and ar<=12 and ac>=1 and ac<=6 then
      if not vis[ar][ac] and p.grid[ar][ac] == g then
        cluster(p, ar, ac, g, vis, grp)
      end
    end
  end
end

function count_clr(clr)
  local n = 0
  for r=1,12 do for c=1,6 do if clr[r][c] then n += 1 end end end
  return n
end

function do_clear(p)
  if not p.pending then return end
  local clr = p.pending.clr
  local primary = p.pending.primary
  local secondary = p.pending.secondary
  local opp = (p == p1) and p2 or p1
  local cnt = 0

  for r=1,12 do
    for c=1,6 do
      if clr[r][c] or (p.grid[r][c] == 10 and near_clr(r, c, clr)) then
        cnt += 1
        local px = p.x + (c-1)*6 + 3
        local py = 16 + (r-1)*8 + 4
        local col = gem_col(p.grid[r][c])
        for i=1,5 do
          add(parts, {x=px, y=py, vx=rnd(3)-1.5, vy=rnd(3)-2.5, col=col, life=18})
        end
        p.grid[r][c] = 0
      end
    end
  end

  p.combo += 1
  local is_primary = primary > 0
  local mult = is_primary and 1.0 or 0.5
  local dmg = flr(cnt * 3 * mult * p.combo)
  opp.hp = max(0, opp.hp - dmg)
  p.super = min(100, p.super + cnt * 6)
  p.score += dmg * 10

  -- garbage payload
  local gb = is_primary and (flr(cnt/2) + (p.combo-1)*2) or flr(cnt/2)
  if gb < 1 then gb = 1 end
  send_garbage(opp, gb)

  flash = 3
  add(msgs, {txt="-"..dmg.." hp!", x=58, y=32, col=8, life=40})

  -- punch anim by intensity
  if p.combo >= 3 then p.anim="upper" shake=14 sfx(6)
  elseif p.combo == 2 or cnt >= 5 then p.anim="hook" shake=10 sfx(5)
  elseif cnt >= 4 then p.anim="straight" shake=8 sfx(4)
  else p.anim="jab" shake=6 sfx(3) end
  p.anim_t = 60
  opp.anim = "flinch" opp.anim_t = 60

  p.pending = nil
end

function near_clr(r, c, clr)
  for d in all({{-1,0},{1,0},{0,-1},{0,1}}) do
    local ar, ac = r+d[1], c+d[2]
    if ar>=1 and ar<=12 and ac>=1 and ac<=6 then
      if clr[ar][ac] then return true end
    end
  end
  return false
end

function send_garbage(p, count)
  local rem = count
  for r=1,12 do
    for c=1,6 do
      if rem > 0 and p.grid[r][c] == 0 then
        p.grid[r][c] = 10
        rem -= 1
      end
    end
  end
  apply_gravity(p)
  sfx(8)
  add(msgs, {txt="garbage +"..count, x=p.x+2, y=20, col=8, life=40})
end

function trigger_super(p)
  if p.super < 100 then return end
  p.super = 0
  local opp = (p == p1) and p2 or p1
  -- clear bottom 3 rows
  for r=10,12 do
    for c=1,6 do p.grid[r][c] = 0 end
  end
  apply_gravity(p)
  opp.hp = max(0, opp.hp - 35)
  send_garbage(opp, 10)
  shake = 16 flash = 6 sfx(9)
  p.anim = "upper" opp.anim = "flinch"
  p.anim_t = 72 opp.anim_t = 72
  add(msgs, {txt="super! -35", x=50, y=30, col=10, life=50})
end

function gem_col(g)
  if g == 1 or g == 5 then return 8 end
  if g == 2 or g == 6 then return 12 end
  if g == 3 or g == 7 then return 11 end
  if g == 4 or g == 8 then return 10 end
  if g == 9 then return 7 end
  return 5 -- counter / unknown
end

function _draw()
  cls(1)

  -- camera shake
  local sx, sy = 0, 0
  if shake > 0 then
    sx = rnd(shake) - shake/2
    sy = rnd(shake) - shake/2
  end
  camera(sx, sy)

  if state == 0 then
    draw_title()
  else
    draw_hud()
    draw_board(p1)
    draw_board(p2)
    draw_ring()

    if state == 2 then
      rectfill(20, 50, 108, 70, 0)
      print(ko_msg or "k.o.!", 30, 57, 10)
      print("press x/o", 40, 64, 7)
    end
  end

  -- fx
  for pt in all(parts) do
    pset(pt.x, pt.y, pt.col)
  end
  for f in all(msgs) do
    print(f.txt, f.x+1, f.y+1, 0)
    print(f.txt, f.x, f.y, f.col)
  end

  if flash > 0 then
    rectfill(0, 0, 128, 128, flr((flash%2)==0 and 7 or 6))
  end
  camera(0, 0)
end

function draw_title()
  rectfill(0, 0, 128, 128, 1)
  rectfill(10, 12, 118, 56, 0)
  rect(10, 12, 118, 56, 10)
  print("crash out", 36, 22, 10)
  print("ring rush", 34, 36, 8)
  print("pico-8 puzzle boxing", 22, 64, 7)
  if flr(t() * 2) % 2 == 0 then
    print("press x/o to start", 24, 90, 10)
  end
end

function draw_hud()
  rectfill(0, 0, 128, 14, 0)
  print("broner", 4, 4, 7)
  print("deen", 100, 4, 7)
  print(round_t < 10 and "0"..round_t or round_t, 58, 4, 10)

  -- hp bars
  rectfill(4, 10, 44, 13, 8)
  rectfill(4, 10, 4 + flr(40 * p1.hp / 100), 13, 11)
  rectfill(82, 10, 122, 13, 8)
  rectfill(82, 10, 82 + flr(40 * p2.hp / 100), 13, 11)

  -- super meters
  rectfill(4, 114, 44, 117, 5)
  rectfill(4, 114, 4 + flr(40 * p1.super / 100), 117, 10)
  rectfill(82, 114, 122, 117, 5)
  rectfill(82, 114, 82 + flr(40 * p2.super / 100), 117, 10)
end

function draw_board(p)
  rect(p.x - 1, 15, p.x + 36, 112, 5)
  rectfill(p.x, 16, p.x + 35, 111, 0)

  for r=1,12 do
    for c=1,6 do
      local g = p.grid[r][c]
      if g != 0 then
        draw_gem(p.x + (c-1)*6, 16 + (r-1)*8, g)
      end
    end
  end

  if p.pair and (p.state == "fall") then
    draw_gem(p.x + (p.pair.x-1)*6, 16 + (p.pair.y-1)*8, p.pair.g1)
    local sx, sy = sub_xy(p.pair.rot, p.pair.x, p.pair.y)
    if sy >= 1 and sy <= 12 and sx >= 1 and sx <= 6 then
      draw_gem(p.x + (sx-1)*6, 16 + (sy-1)*8, p.pair.g2)
    end
  end
end

function draw_gem(x, y, g)
  local col = gem_col(g)
  local is_crash = (g >= 5 and g <= 8)
  local is_counter = (g == 10)
  rectfill(x, y, x+5, y+7, col)
  rect(x, y, x+5, y+7, 0)
  -- bevel highlight
  rectfill(x+1, y+1, x+4, y+1, 7)
  if is_crash then
    -- crash orb inner mark
    rectfill(x+2, y+3, x+3, y+4, 0)
  elseif is_counter then
    -- counter gem hatch
    pset(x+1, y+2, 6)
    pset(x+4, y+5, 6)
  end
end

function draw_ring()
  rectfill(41, 16, 86, 111, 0)
  line(41, 45, 86, 45, 6)
  line(41, 65, 86, 65, 6)
  line(41, 85, 86, 85, 6)
  -- simple fighters
  local b1y = 75 + (p1.anim != "idle" and -2 or 0)
  local b2y = 75 + (p2.anim != "idle" and -2 or 0)
  rectfill(46, b1y, 54, b1y+15, 4)
  rectfill(72, b2y, 80, b2y+15, 4)
  -- gloves lunge on punch
  if p1.anim != "idle" and p1.anim != "flinch" then rectfill(54, b1y+4, 60, b1y+9, 8) end
  if p2.anim != "idle" and p2.anim != "flinch" then rectfill(66, b2y+4, 72, b2y+9, 12) end
end
__gfx__
__sfx__
__music__
