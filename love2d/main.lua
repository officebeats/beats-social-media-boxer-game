-- Ring Rush: Puzzle Boxing - Main Love2D App Entry
local PuzzleEngine = require("src.engine.puzzle")

local playerBoard
local rivalBoard
local gameState = "title" -- "title", "match", "results"
local dropTimer = 0
local dropInterval = 0.6
local animTimer = 0
local animFrame = 1

function love.load()
    love.window.setTitle("Ring Rush: Puzzle Boxing (LÖVE 2D Edition)")
    math.randomseed(os.time())
    playerBoard = PuzzleEngine.newBoard()
    rivalBoard = PuzzleEngine.newBoard()
end

function love.update(dt)
    -- 12 FPS Boxer Stance Animation Step Timer (83.3ms per frame)
    animTimer = animTimer + dt
    if animTimer >= 0.083 then
        animTimer = animTimer - 0.083
        animFrame = (animFrame % 4) + 1
    end

    if gameState == "match" then
        dropTimer = dropTimer + dt
        if dropTimer >= dropInterval then
            dropTimer = dropTimer - dropInterval
            local status = PuzzleEngine.dropStep(playerBoard)
            if status == "game_over" then
                gameState = "results"
            end
            PuzzleEngine.dropStep(rivalBoard)
        end
    end
end

function love.keypressed(key)
    if gameState == "title" then
        if key == "return" or key == "space" then
            gameState = "match"
            playerBoard = PuzzleEngine.newBoard()
            rivalBoard = PuzzleEngine.newBoard()
        end
    elseif gameState == "match" then
        if key == "left" or key == "a" then
            PuzzleEngine.movePair(playerBoard, -1)
        elseif key == "right" or key == "d" then
            PuzzleEngine.movePair(playerBoard, 1)
        elseif key == "up" or key == "w" or key == "space" then
            PuzzleEngine.rotatePair(playerBoard)
        elseif key == "down" or key == "s" then
            PuzzleEngine.dropStep(playerBoard)
        elseif key == "p" or key == "escape" then
            gameState = "title"
        end
    elseif gameState == "results" then
        if key == "return" or key == "space" then
            gameState = "match"
            playerBoard = PuzzleEngine.newBoard()
            rivalBoard = PuzzleEngine.newBoard()
        end
    end
end

function love.mousepressed(x, y, button, istouch)
    if gameState == "title" then
        gameState = "match"
        playerBoard = PuzzleEngine.newBoard()
        rivalBoard = PuzzleEngine.newBoard()
    elseif gameState == "results" then
        gameState = "match"
        playerBoard = PuzzleEngine.newBoard()
        rivalBoard = PuzzleEngine.newBoard()
    end
end

function love.draw()
    local w, h = love.graphics.getDimensions()

    -- Dark Arena Background
    love.graphics.clear(0.02, 0.04, 0.08)

    if gameState == "title" then
        -- Title Screen Rendering
        love.graphics.setColor(1, 0.75, 0.16)
        love.graphics.setFont(love.graphics.newFont(28))
        love.graphics.printf("RING RUSH", 0, h * 0.18, w, "center")

        love.graphics.setColor(1, 1, 1, 0.8)
        love.graphics.setFont(love.graphics.newFont(16))
        love.graphics.printf("PUZZLE BOXING", 0, h * 0.24, w, "center")

        -- Animated Boxer Stance Visualizer
        love.graphics.setColor(1, 0.8, 0.2)
        love.graphics.rectangle("line", w * 0.15, h * 0.38, 100, 140)
        love.graphics.printf("BRONER\n[Philly Roll]\nFrame " .. animFrame, w * 0.15, h * 0.42, 100, "center")

        love.graphics.setColor(0.15, 0.65, 1)
        love.graphics.rectangle("line", w * 0.6, h * 0.38, 100, 140)
        love.graphics.printf("DEEN\n[High Guard]\nFrame " .. animFrame, w * 0.6, h * 0.42, 100, "center")

        -- Start Action
        love.graphics.setColor(1, 0.75, 0.16)
        love.graphics.rectangle("fill", w * 0.2, h * 0.72, w * 0.6, 52, 10, 10)
        love.graphics.setColor(0, 0, 0)
        love.graphics.setFont(love.graphics.newFont(20))
        love.graphics.printf("TAP TO FIGHT", 0, h * 0.735, w, "center")

    elseif gameState == "match" then
        -- Match HUD Header
        love.graphics.setColor(1, 0.75, 0.16)
        love.graphics.rectangle("fill", 12, 16, (w - 32) * 0.45, 16, 4, 4)
        love.graphics.setColor(0.15, 0.65, 1)
        love.graphics.rectangle("fill", w - 12 - (w - 32) * 0.45, 16, (w - 32) * 0.45, 16, 4, 4)

        love.graphics.setColor(1, 1, 1)
        love.graphics.setFont(love.graphics.newFont(14))
        love.graphics.printf("BRONER", 12, 36, 120, "left")
        love.graphics.printf("DEEN", w - 132, 36, 120, "right")

        -- Dual Puzzle Boards
        drawBoard(playerBoard, 16, h * 0.36, (w - 56) * 0.46, h * 0.48)
        drawBoard(rivalBoard, w - 16 - (w - 56) * 0.46, h * 0.36, (w - 56) * 0.46, h * 0.48)

        -- Touch Controls Bar (58px minimum target)
        love.graphics.setColor(0.1, 0.15, 0.26)
        local btnW = (w - 40) / 4
        for i = 1, 4 do
            local labels = { "←", "↻", "→", "↓" }
            love.graphics.rectangle("fill", 12 + (i - 1) * (btnW + 6), h - 72, btnW, 58, 8, 8)
            love.graphics.setColor(1, 0.75, 0.16)
            love.graphics.printf(labels[i], 12 + (i - 1) * (btnW + 6), h - 56, btnW, "center")
            love.graphics.setColor(0.1, 0.15, 0.26)
        end

    elseif gameState == "results" then
        -- Results Victory Screen
        love.graphics.setColor(1, 0.75, 0.16)
        love.graphics.setFont(love.graphics.newFont(32))
        love.graphics.printf("WINNER!", 0, h * 0.2, w, "center")

        love.graphics.setColor(1, 1, 1)
        love.graphics.setFont(love.graphics.newFont(20))
        love.graphics.printf("ADRIEN BRONER", 0, h * 0.28, w, "center")

        love.graphics.setColor(1, 0.75, 0.16)
        love.graphics.rectangle("fill", w * 0.2, h * 0.7, w * 0.6, 52, 10, 10)
        love.graphics.setColor(0, 0, 0)
        love.graphics.printf("REMATCH", 0, h * 0.715, w, "center")
    end
end

function drawBoard(board, startX, startY, boardW, boardH)
    local cellW = boardW / PuzzleEngine.COLS
    local cellH = boardH / PuzzleEngine.ROWS

    love.graphics.setColor(0.05, 0.08, 0.15, 0.9)
    love.graphics.rectangle("fill", startX, startY, boardW, boardH, 6, 6)
    love.graphics.setColor(1, 0.75, 0.16, 0.4)
    love.graphics.rectangle("line", startX, startY, boardW, boardH, 6, 6)

    -- Draw Locked Grid Gems
    for r = 1, PuzzleEngine.ROWS do
        for c = 1, PuzzleEngine.COLS do
            local gem = board.grid[r][c]
            if gem then
                drawGem(gem, startX + (c - 1) * cellW, startY + (r - 1) * cellH, cellW, cellH)
            end
        end
    end

    -- Draw Falling Pair
    if board.falling then
        local f = board.falling
        drawGem(f.pivot, startX + (f.x - 1) * cellW, startY + (f.y - 1) * cellH, cellW, cellH)
        local sx, sy = PuzzleEngine.getSatelliteOffset(f.rotation)
        drawGem(f.satellite, startX + (f.x + sx - 1) * cellW, startY + (f.y + sy - 1) * cellH, cellW, cellH)
    end
end

function drawGem(gem, x, y, w, h)
    if gem.color == "red" then love.graphics.setColor(0.9, 0.2, 0.25)
    elseif gem.color == "blue" then love.graphics.setColor(0.1, 0.5, 0.9)
    elseif gem.color == "green" then love.graphics.setColor(0.15, 0.7, 0.4)
    elseif gem.color == "yellow" then love.graphics.setColor(0.95, 0.75, 0.2)
    else love.graphics.setColor(0.6, 0.6, 0.6)
    end

    if gem.type == "crash" then
        love.graphics.circle("fill", x + w / 2, y + h / 2, math.min(w, h) * 0.42)
        love.graphics.setColor(1, 1, 1, 0.8)
        love.graphics.circle("fill", x + w / 2, y + h / 2, math.min(w, h) * 0.18)
    else
        love.graphics.rectangle("fill", x + 1, y + 1, w - 2, h - 2, 3, 3)
    end
end
