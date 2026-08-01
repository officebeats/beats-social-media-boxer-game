function love.conf(t)
    t.identity = "ring-rush-puzzle-boxing"
    t.version = "11.4"
    t.console = false

    t.window.title = "Ring Rush: Puzzle Boxing (LÖVE 2D Edition)"
    t.window.icon = nil
    t.window.width = 412
    t.window.height = 915
    t.window.resizable = true
    t.window.minwidth = 360
    t.window.minheight = 640

    t.modules.audio = true
    t.modules.data = true
    t.modules.event = true
    t.modules.font = true
    t.modules.graphics = true
    t.modules.image = true
    t.modules.joystick = true
    t.modules.keyboard = true
    t.modules.math = true
    t.modules.mouse = true
    t.modules.physics = false
    t.modules.sound = true
    t.modules.system = true
    t.modules.timer = true
    t.modules.touch = true
    t.modules.video = false
    t.modules.window = true
end
