pico-8 cartridge // http://www.pico-8.com
version 32
__lua__
-- crash out: ring rush (v1.0.0-alpha.1)
-- pico-8 puzzle boxing alpha 1.0 release
-- broner vs deen

function _init()
  state = 0 -- 0:title, 1:battle, 2:ko
  round_timer = 99
  timer_tick = 0
  
  -- p1: broner (x=4)
  p1 = {
    x=4, hp=100, score=0, combo=0,
    grid={}, pgem={}, pair=nil,
    anim=0, anim_t=0
  }
  
  -- p2: deen (x=88)
  p2 = {
    x=88, hp=100, score=0, combo=0,
    grid={}, pgem={}, pair=nil,
    anim=0, anim_t=0
  }

  init_board(p1)
  init_board(p2)
  spawn_pair(p1)
  spawn_pair(p2)
end

function init_board(p)
  p.grid = {}
  p.pgem = {}
  for r=1,12 do
    p.grid[r] = {}
    p.pgem[r] = {}
    for c=1,6 do
      p.grid[r][c] = 0
      p.pgem[r][c] = false
    end
  end
end

function spawn_pair(p)
  local g1 = flr(rnd(4)) + 1
  local is_crash = rnd(1) < 0.25
  local g2 = is_crash and (flr(rnd(4)) + 5) or (flr(rnd(4)) + 1)
  p.pair = {x=3, y=1, rot=0, g1=g1, g2=g2}
end

function _update()
  if (state == 0) then
    if (btnp(4) or btnp(5)) state = 1
  elseif (state == 1) then
    update_player(p1, false)
    update_player(p2, true)
    
    timer_tick += 1
    if timer_tick >= 30 then
      timer_tick = 0
      if (round_timer > 0) round_timer -= 1
    end
    
    if (p1.hp <= 0 or p2.hp <= 0) state = 2
  elseif (state == 2) then
    if (btnp(4) or btnp(5)) _init()
  end
end

function update_player(p, is_ai)
  if not is_ai then
    if (btnp(0)) move_pair(p, -1)
    if (btnp(1)) move_pair(p, 1)
    if (btnp(2)) drop_hard(p)
    if (btn(3)) drop_soft(p)
    if (btnp(4)) rotate_pair(p, -1)
    if (btnp(5)) rotate_pair(p, 1)
  else
    -- simple ai
    if rnd(1) < 0.1 then
      local dir = rnd(1) < 0.5 and -1 or 1
      move_pair(p, dir)
    end
    if (rnd(1) < 0.05) rotate_pair(p, 1)
    if (rnd(1) < 0.02) drop_soft(p)
  end
end

function move_pair(p, dir)
  if (not p.pair) return
  if valid_pos(p, p.pair.x + dir, p.pair.y, p.pair.rot) then
    p.pair.x += dir
    sfx(0)
  end
end

function rotate_pair(p, dir)
  if (not p.pair) return
  local nrot = (p.pair.rot + dir) % 4
  if valid_pos(p, p.pair.x, p.pair.y, nrot) then
    p.pair.rot = nrot
    sfx(1)
  end
end

function drop_soft(p)
  if (not p.pair) return
  if valid_pos(p, p.pair.x, p.pair.y + 1, p.pair.rot) then
    p.pair.y += 1
  else
    lock_pair(p)
  end
end

function drop_hard(p)
  if (not p.pair) return
  while valid_pos(p, p.pair.x, p.pair.y + 1, p.pair.rot) do
    p.pair.y += 1
  end
  lock_pair(p)
end

function valid_pos(p, x, y, rot)
  local sx, sy = x, y
  if (rot == 0) sy -= 1
  if (rot == 1) sx += 1
  if (rot == 2) sy += 1
  if (rot == 3) sx -= 1
  
  if (x < 1 or x > 6 or y < 1 or y > 12) return false
  if (sx < 1 or sx > 6 or sy < 1 or sy > 12) return false
  if (p.grid[y][x] != 0) return false
  if (sy >= 1 and p.grid[sy][sx] != 0) return false
  return true
end

function lock_pair(p)
  if (not p.pair) return
  local sx, sy = p.pair.x, p.pair.y
  if (p.pair.rot == 0) sy -= 1
  if (p.pair.rot == 1) sx += 1
  if (p.pair.rot == 2) sy += 1
  if (p.pair.rot == 3) sx -= 1
  
  if (p.pair.y >= 1) p.grid[p.pair.y][p.pair.x] = p.pair.g1
  if (sy >= 1) p.grid[sy][sx] = p.pair.g2
  sfx(2)
  p.pair = nil
  spawn_pair(p)
end

function _draw()
  cls(1)
  
  -- top hud
  rectfill(0,0,127,14,0)
  print("broner", 4, 4, 7)
  print("deen", 98, 4, 7)
  print(round_timer, 58, 4, 10)
  
  -- hp bars
  rectfill(4, 10, 44, 13, 8)
  rectfill(4, 10, 4 + flr(40 * p1.hp / 100), 13, 11)
  rectfill(82, 10, 122, 13, 8)
  rectfill(82, 10, 82 + flr(40 * p2.hp / 100), 13, 11)

  if (state == 0) then
    print("crash out: ring rush", 22, 50, 10)
    print("press x/o to start", 26, 70, 7)
  else
    draw_board(p1)
    draw_board(p2)
    draw_ring()
  end
  
  if (state == 2) then
    rectfill(20, 50, 108, 70, 0)
    print("k.o.!", 54, 58, 10)
  end
end

function draw_board(p)
  rect(p.x - 1, 15, p.x + 36, 112, 5)
  rectfill(p.x, 16, p.x + 35, 111, 0)
  
  for r=1,12 do
    for c=1,6 do
      local g = p.grid[r][c]
      if (g != 0) draw_gem(p.x + (c-1)*6, 16 + (r-1)*8, g)
    end
  end
  
  if p.pair then
    draw_gem(p.x + (p.pair.x-1)*6, 16 + (p.pair.y-1)*8, p.pair.g1)
  end
end

function draw_gem(x, y, g)
  local col = 8
  if (g == 2 or g == 6) col = 12
  if (g == 3 or g == 7) col = 11
  if (g == 4 or g == 8) col = 10
  rectfill(x+1, y+1, x+4, y+6, col)
  rect(x, y, x+5, y+7, 0)
end

function draw_ring()
  rectfill(41, 16, 86, 111, 0)
  line(41, 45, 86, 45, 6)
  line(41, 65, 86, 65, 6)
  line(41, 85, 86, 85, 6)
  -- fighters
  rectfill(46, 75, 54, 90, 4) -- broner
  rectfill(72, 75, 80, 90, 4) -- deen
end
__gfx__
__sfx__
__music__
