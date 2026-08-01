-- Ring Rush: Puzzle Boxing - Pure Functional Puzzle Engine (Lua / Love2D)

local PuzzleEngine = {}

PuzzleEngine.COLS = 6
PuzzleEngine.ROWS = 12
PuzzleEngine.COLORS = { "red", "blue", "green", "yellow" }

function PuzzleEngine.newBoard()
    local grid = {}
    for r = 1, PuzzleEngine.ROWS do
        grid[r] = {}
        for c = 1, PuzzleEngine.COLS do
            grid[r][c] = nil
        end
    end
    return {
        grid = grid,
        falling = nil,
        next = PuzzleEngine.randomPair(),
        score = 0,
        chain = 0,
        maxChain = 0,
        cleared = 0,
        meter = 0
    }
end

function PuzzleEngine.randomGem()
    local isCrash = math.random() < 0.18
    local color = PuzzleEngine.COLORS[math.random(#PuzzleEngine.COLORS)]
    return {
        color = color,
        type = isCrash and "crash" or "normal",
        counter = nil
    }
end

function PuzzleEngine.randomPair()
    return {
        pivot = PuzzleEngine.randomGem(),
        satellite = PuzzleEngine.randomGem(),
        x = 3,
        y = 1,
        rotation = 0 -- 0: top, 1: right, 2: bottom, 3: left
    }
end

function PuzzleEngine.getSatelliteOffset(rot)
    if rot == 0 then return 0, -1
    elseif rot == 1 then return 1, 0
    elseif rot == 2 then return 0, 1
    elseif rot == 3 then return -1, 0
    end
    return 0, -1
end

function PuzzleEngine.canPlace(grid, x, y, rot)
    if x < 1 or x > PuzzleEngine.COLS or y < 1 or y > PuzzleEngine.ROWS then return false end
    if grid[y] and grid[y][x] then return false end

    local sx, sy = PuzzleEngine.getSatelliteOffset(rot)
    local satX = x + sx
    local satY = y + sy

    if satX < 1 or satX > PuzzleEngine.COLS or satY < 1 or satY > PuzzleEngine.ROWS then return false end
    if grid[satY] and grid[satY][satX] then return false end

    return true
end

function PuzzleEngine.rotatePair(board)
    if not board.falling then return end
    local newRot = (board.falling.rotation + 1) % 4
    if PuzzleEngine.canPlace(board.grid, board.falling.x, board.falling.y, newRot) then
        board.falling.rotation = newRot
    elseif PuzzleEngine.canPlace(board.grid, board.falling.x - 1, board.falling.y, newRot) then
        board.falling.x = board.falling.x - 1
        board.falling.rotation = newRot
    elseif PuzzleEngine.canPlace(board.grid, board.falling.x + 1, board.falling.y, newRot) then
        board.falling.x = board.falling.x + 1
        board.falling.rotation = newRot
    end
end

function PuzzleEngine.movePair(board, dx)
    if not board.falling then return end
    local newX = board.falling.x + dx
    if PuzzleEngine.canPlace(board.grid, newX, board.falling.y, board.falling.rotation) then
        board.falling.x = newX
    end
end

function PuzzleEngine.dropStep(board)
    if not board.falling then
        board.falling = board.next
        board.next = PuzzleEngine.randomPair()
        if not PuzzleEngine.canPlace(board.grid, board.falling.x, board.falling.y, board.falling.rotation) then
            return "game_over"
        end
        return "spawn"
    end

    local newY = board.falling.y + 1
    if PuzzleEngine.canPlace(board.grid, board.falling.x, newY, board.falling.rotation) then
        board.falling.y = newY
        return "move"
    else
        -- Lock gems onto grid
        local f = board.falling
        local sx, sy = PuzzleEngine.getSatelliteOffset(f.rotation)
        board.grid[f.y][f.x] = f.pivot
        board.grid[f.y + sy][f.x + sx] = f.satellite
        board.falling = nil

        PuzzleEngine.applyGravity(board.grid)
        PuzzleEngine.fusePowerGems(board.grid)
        local clearedCount = PuzzleEngine.processDetonations(board)
        return "lock", clearedCount
    end
end

function PuzzleEngine.applyGravity(grid)
    for c = 1, PuzzleEngine.COLS do
        for r = PuzzleEngine.ROWS - 1, 1, -1 do
            if grid[r][c] then
                local fallR = r
                while fallR + 1 <= PuzzleEngine.ROWS and not grid[fallR + 1][c] do
                    fallR = fallR + 1
                end
                if fallR ~= r then
                    grid[fallR][c] = grid[r][c]
                    grid[r][c] = nil
                end
            end
        end
    end
end

function PuzzleEngine.fusePowerGems(grid)
    -- Detect 2x2 fused rectangular power gems
    for r = 1, PuzzleEngine.ROWS - 1 do
        for c = 1, PuzzleEngine.COLS - 1 do
            local g1 = grid[r][c]
            local g2 = grid[r][c + 1]
            local g3 = grid[r + 1][c]
            local g4 = grid[r + 1][c + 1]
            if g1 and g2 and g3 and g4 and
               g1.type == "normal" and g2.type == "normal" and g3.type == "normal" and g4.type == "normal" and
               g1.color == g2.color and g1.color == g3.color and g1.color == g4.color then
                g1.isPower = true
                g2.isPower = true
                g3.isPower = true
                g4.isPower = true
            end
        end
    end
end

function PuzzleEngine.processDetonations(board)
    local grid = board.grid
    local toClear = {}
    local cleared = 0

    for r = 1, PuzzleEngine.ROWS do
        for c = 1, PuzzleEngine.COLS do
            local gem = grid[r][c]
            if gem and gem.type == "crash" then
                -- Check adjacent neighbors for same color
                local neighbors = { {r-1, c}, {r+1, c}, {r, c-1}, {r, c+1} }
                for _, n in ipairs(neighbors) do
                    local nr, nc = n[1], n[2]
                    if nr >= 1 and nr <= PuzzleEngine.ROWS and nc >= 1 and nc <= PuzzleEngine.COLS then
                        local nGem = grid[nr][nc]
                        if nGem and nGem.color == gem.color then
                            toClear[r .. "," .. c] = true
                            toClear[nr .. "," .. nc] = true
                        end
                    end
                end
            end
        end
    end

    for key, _ in pairs(toClear) do
        local r, c = key:match("(%d+),(%d+)")
        r, c = tonumber(r), tonumber(c)
        grid[r][c] = nil
        cleared = cleared + 1
    end

    if cleared > 0 then
        board.cleared = board.cleared + cleared
        board.score = board.score + cleared * 100
        board.meter = math.min(100, board.meter + cleared * 4)
        PuzzleEngine.applyGravity(grid)
    end

    return cleared
end

return PuzzleEngine
