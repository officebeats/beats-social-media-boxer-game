from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CART = ROOT / "locked-in-ring.p8"
W = H = 128
KEY = 14
px = [[KEY for _ in range(W)] for _ in range(H)]


def pset(x, y, c):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < W and 0 <= y < H:
        px[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            pset(x, y, c)


def disc(cx, cy, r, c):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r:
                pset(x, y, c)


def line(x0, y0, x1, y1, c, width=1):
    dx, dy = x1 - x0, y1 - y0
    steps = max(abs(dx), abs(dy), 1)
    radius = max(0, (width - 1) // 2)
    for i in range(steps + 1):
        x = round(x0 + dx * i / steps)
        y = round(y0 + dy * i / steps)
        disc(x, y, radius, c)


def poly(points, c):
    min_x = max(0, min(x for x, _ in points))
    max_x = min(W - 1, max(x for x, _ in points))
    min_y = max(0, min(y for _, y in points))
    max_y = min(H - 1, max(y for _, y in points))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            inside = False
            j = len(points) - 1
            for i, (xi, yi) in enumerate(points):
                xj, yj = points[j]
                if (yi > y) != (yj > y):
                    cross = (xj - xi) * (y - yi) / (yj - yi) + xi
                    if x < cross:
                        inside = not inside
                j = i
            if inside:
                pset(x, y, c)


def offset(points, ox, oy=0):
    return [(x + ox, y + oy) for x, y in points]


def leg(points, ox, skin, hi):
    a, b, d = [(x + ox, y) for x, y in points]
    line(*a, *b, 0, 7)
    line(*b, *d, 0, 7)
    line(*a, *b, skin, 4)
    line(*b, *d, skin, 4)
    line(a[0] + 1, a[1], b[0] + 1, b[1], hi, 1)


def draw_ab(ox=0):
    leg([(14, 34), (9, 44), (5, 52)], ox, 4, 9)
    leg([(23, 34), (29, 43), (33, 51)], ox, 4, 9)
    rect(ox + 3, 48, ox + 9, 52, 0)
    rect(ox + 4, 48, ox + 8, 50, 6)
    pset(ox + 5, 49, 7)
    poly(offset([(0, 51), (8, 50), (12, 52), (11, 55), (0, 55)], ox), 0)
    poly(offset([(2, 52), (8, 51), (10, 53), (9, 54), (2, 54)], ox), 2)
    pset(ox + 8, 52, 13)
    rect(ox + 30, 48, ox + 35, 51, 0)
    rect(ox + 31, 47, ox + 34, 49, 6)
    pset(ox + 32, 48, 7)
    poly(offset([(29, 50), (35, 49), (39, 52), (39, 55), (29, 55)], ox), 0)
    poly(offset([(31, 51), (35, 50), (38, 52), (37, 54), (31, 54)], ox), 2)
    pset(ox + 36, 51, 13)

    poly(offset([(9, 28), (29, 28), (30, 31), (28, 44), (22, 44), (19, 37), (16, 45), (8, 44), (9, 31)], ox), 0)
    poly(offset([(11, 30), (27, 30), (28, 32), (26, 42), (23, 42), (19, 35), (15, 43), (10, 42)], ox), 2)
    line(ox + 11, 29, ox + 27, 29, 13)
    rect(ox + 18, 29, ox + 20, 30, 5)
    line(ox + 11, 32, ox + 10, 41, 7)
    line(ox + 27, 32, ox + 26, 41, 7)
    line(ox + 19, 34, ox + 19, 42, 0)
    pset(ox + 15, 42, 13)
    pset(ox + 23, 41, 13)

    poly(offset([(10, 14), (17, 11), (27, 13), (32, 20), (29, 30), (26, 32), (10, 32), (6, 25), (7, 18)], ox), 0)
    poly(offset([(12, 15), (18, 13), (25, 14), (29, 20), (27, 29), (24, 30), (11, 30), (8, 24), (9, 18)], ox), 1)
    poly(offset([(8, 17), (13, 15), (15, 21), (11, 24), (7, 22)], ox), 1)
    poly(offset([(25, 15), (30, 18), (31, 23), (27, 24), (24, 20)], ox), 1)
    line(ox + 12, 27, ox + 25, 27, 5)
    line(ox + 11, 29, ox + 23, 29, 5)
    pset(ox + 14, 18, 5)
    pset(ox + 25, 21, 13)

    rect(ox + 18, 12, ox + 23, 17, 0)
    rect(ox + 19, 11, ox + 22, 16, 4)
    poly(offset([(15, 4), (18, 2), (25, 2), (28, 4), (29, 8), (31, 10), (29, 13), (26, 14), (25, 17), (19, 17), (16, 15), (14, 11), (14, 6)], ox), 0)
    poly(offset([(17, 5), (19, 4), (24, 4), (27, 5), (27, 9), (29, 10), (28, 12), (26, 12), (24, 15), (20, 15), (18, 13), (16, 11)], ox), 4)
    poly(offset([(15, 3), (18, 1), (25, 1), (28, 4), (27, 6), (23, 5), (18, 6), (15, 7)], ox), 0)
    pset(ox + 18, 3, 5)
    rect(ox + 21, 2, ox + 23, 3, 5)
    pset(ox + 26, 4, 5)
    poly(offset([(16, 11), (19, 12), (21, 14), (25, 12), (29, 12), (27, 17), (24, 18), (19, 17)], ox), 0)
    pset(ox + 19, 13, 5)
    pset(ox + 21, 15, 5)
    pset(ox + 24, 16, 5)
    pset(ox + 26, 14, 5)
    pset(ox + 17, 9, 9)
    pset(ox + 18, 10, 15)
    line(ox + 25, 7, ox + 27, 7, 0)
    pset(ox + 27, 8, 15)
    pset(ox + 27, 9, 7)
    pset(ox + 28, 9, 0)
    pset(ox + 30, 11, 9)
    pset(ox + 26, 11, 15)
    pset(ox + 25, 14, 4)
    pset(ox + 24, 15, 15)


def draw_dg(ox=40):
    leg([(14, 34), (8, 44), (4, 52)], ox, 4, 9)
    leg([(23, 34), (30, 43), (35, 51)], ox, 4, 9)
    rect(ox + 2, 48, ox + 8, 52, 0)
    rect(ox + 3, 48, ox + 7, 50, 3)
    pset(ox + 4, 49, 11)
    poly(offset([(0, 51), (8, 50), (12, 52), (11, 55), (0, 55)], ox), 0)
    poly(offset([(2, 52), (8, 51), (10, 53), (9, 54), (2, 54)], ox), 3)
    pset(ox + 7, 52, 10)
    rect(ox + 32, 48, ox + 37, 52, 0)
    rect(ox + 33, 48, ox + 36, 50, 3)
    pset(ox + 34, 49, 11)
    poly(offset([(30, 50), (36, 49), (39, 52), (39, 55), (30, 55)], ox), 0)
    poly(offset([(32, 51), (36, 50), (38, 52), (37, 54), (32, 54)], ox), 3)
    pset(ox + 36, 51, 10)

    poly(offset([(9, 28), (30, 28), (31, 31), (28, 45), (22, 45), (19, 37), (16, 45), (8, 44), (9, 31)], ox), 0)
    poly(offset([(11, 30), (28, 30), (29, 32), (26, 43), (23, 43), (19, 35), (15, 43), (10, 42)], ox), 3)
    line(ox + 11, 29, ox + 28, 29, 10)
    rect(ox + 19, 29, ox + 21, 30, 9)
    line(ox + 11, 32, ox + 10, 41, 10)
    line(ox + 28, 32, ox + 26, 42, 10)
    line(ox + 19, 34, ox + 19, 43, 0)
    pset(ox + 15, 42, 11)
    pset(ox + 23, 42, 11)

    poly(offset([(10, 14), (17, 11), (26, 13), (32, 20), (29, 30), (26, 32), (10, 32), (6, 25), (7, 18)], ox), 0)
    poly(offset([(12, 15), (18, 13), (24, 14), (29, 20), (27, 29), (24, 30), (11, 30), (8, 24), (9, 18)], ox), 4)
    poly(offset([(9, 16), (12, 14), (15, 16), (15, 20), (13, 22), (9, 20)], ox), 4)
    poly(offset([(24, 16), (27, 15), (30, 18), (29, 21), (26, 22), (24, 20)], ox), 4)
    line(ox + 13, 20, ox + 18, 21, 9)
    line(ox + 21, 21, ox + 27, 19, 9)
    line(ox + 15, 24, ox + 24, 24, 0)
    line(ox + 19, 21, ox + 19, 29, 0)
    pset(ox + 14, 17, 15)
    pset(ox + 25, 17, 15)
    pset(ox + 16, 26, 9)
    pset(ox + 23, 27, 9)

    rect(ox + 18, 12, ox + 23, 17, 0)
    rect(ox + 19, 11, ox + 22, 16, 4)
    poly(offset([(15, 4), (18, 2), (25, 2), (28, 4), (29, 8), (31, 10), (29, 13), (26, 14), (25, 17), (19, 17), (16, 15), (14, 11), (14, 6)], ox), 0)
    poly(offset([(17, 5), (19, 4), (24, 4), (27, 5), (27, 9), (29, 10), (28, 12), (26, 12), (24, 15), (20, 15), (18, 13), (16, 11)], ox), 4)
    poly(offset([(15, 3), (18, 1), (25, 1), (28, 4), (27, 6), (23, 5), (18, 6), (15, 7)], ox), 0)
    line(ox + 17, 2, ox + 7, 13, 0, 2)
    line(ox + 20, 1, ox + 11, 14, 0, 2)
    line(ox + 23, 1, ox + 16, 15, 0, 2)
    line(ox + 26, 2, ox + 21, 16, 0, 2)
    pset(ox + 7, 12, 5)
    pset(ox + 11, 12, 5)
    pset(ox + 15, 11, 5)
    pset(ox + 20, 10, 5)
    pset(ox + 17, 9, 9)
    pset(ox + 18, 10, 15)
    line(ox + 25, 7, ox + 27, 7, 0)
    pset(ox + 27, 8, 15)
    pset(ox + 27, 9, 7)
    pset(ox + 28, 9, 0)
    pset(ox + 30, 11, 9)
    line(ox + 24, 14, ox + 28, 14, 9)


def portrait_ab(ox=0, oy=64):
    poly(offset([(1, 15), (3, 12), (7, 11), (12, 12), (15, 15)], ox, oy), 1)
    line(ox + 3, oy + 14, ox + 13, oy + 14, 5)
    pset(ox + 4, oy + 13, 13)
    poly(offset([(2, 4), (5, 1), (11, 1), (15, 5), (14, 10), (11, 14), (5, 14), (1, 10)], ox, oy), 0)
    poly(offset([(4, 5), (6, 3), (11, 3), (13, 5), (12, 9), (10, 11), (6, 11), (3, 9)], ox, oy), 4)
    rect(ox + 4, oy + 2, ox + 11, oy + 4, 0)
    pset(ox + 6, oy + 2, 5)
    pset(ox + 9, oy + 3, 5)
    poly(offset([(3, 9), (7, 9), (9, 11), (13, 9), (12, 14), (6, 14)], ox, oy), 0)
    pset(ox + 5, oy + 10, 5)
    pset(ox + 7, oy + 12, 5)
    pset(ox + 10, oy + 11, 5)
    pset(ox + 4, oy + 7, 9)
    line(ox + 9, oy + 5, ox + 11, oy + 5, 0)
    pset(ox + 11, oy + 6, 7)
    pset(ox + 12, oy + 7, 0)
    pset(ox + 13, oy + 9, 9)


def portrait_dg(ox=16, oy=64):
    poly(offset([(1, 15), (3, 12), (7, 11), (12, 12), (15, 15)], ox, oy), 4)
    line(ox + 3, oy + 14, ox + 13, oy + 14, 3)
    pset(ox + 11, oy + 13, 10)
    poly(offset([(2, 4), (5, 1), (11, 1), (15, 5), (14, 10), (11, 14), (5, 14), (1, 10)], ox, oy), 0)
    poly(offset([(4, 5), (6, 3), (11, 3), (13, 5), (12, 9), (10, 12), (6, 12), (3, 9)], ox, oy), 4)
    line(ox + 6, oy + 2, ox + 1, oy + 12, 0, 2)
    line(ox + 9, oy + 2, ox + 5, oy + 13, 0, 2)
    line(ox + 12, oy + 3, ox + 9, oy + 13, 0, 2)
    pset(ox + 2, oy + 10, 5)
    pset(ox + 5, oy + 9, 5)
    pset(ox + 8, oy + 8, 5)
    pset(ox + 4, oy + 7, 9)
    line(ox + 9, oy + 5, ox + 11, oy + 5, 0)
    pset(ox + 11, oy + 6, 7)
    pset(ox + 12, oy + 7, 0)
    pset(ox + 13, oy + 9, 9)
    line(ox + 7, oy + 11, ox + 12, oy + 11, 9)


def draw_step(ox, oy, trunks, trim, boot, sock, hi):
    poly(offset([(8, 0), (30, 0), (31, 5), (27, 12), (22, 11),
                 (19, 8), (15, 12), (8, 10)], ox, oy), 0)
    poly(offset([(10, 1), (28, 1), (28, 5), (25, 10), (22, 9),
                 (19, 6), (15, 10), (10, 8)], ox, oy), trunks)
    rect(ox + 10, oy + 1, ox + 28, oy + 3, trim)
    line(ox + 13, oy + 9, ox + 10, oy + 18, 0, 7)
    line(ox + 10, oy + 18, ox + 8, oy + 24, 0, 7)
    line(ox + 13, oy + 9, ox + 10, oy + 18, 4, 4)
    line(ox + 10, oy + 18, ox + 8, oy + 24, 4, 4)
    line(ox + 24, oy + 9, ox + 28, oy + 17, 0, 7)
    line(ox + 28, oy + 17, ox + 32, oy + 23, 0, 7)
    line(ox + 24, oy + 9, ox + 28, oy + 17, 4, 4)
    line(ox + 28, oy + 17, ox + 32, oy + 23, 4, 4)
    line(ox + 11, oy + 12, ox + 9, oy + 18, hi)
    line(ox + 26, oy + 12, ox + 29, oy + 17, hi)
    rect(ox + 5, oy + 21, ox + 11, oy + 25, 0)
    rect(ox + 6, oy + 21, ox + 10, oy + 23, sock)
    poly(offset([(2, 24), (10, 23), (14, 25), (13, 27), (2, 27)], ox, oy), 0)
    poly(offset([(4, 25), (10, 24), (12, 26), (4, 26)], ox, oy), boot)
    rect(ox + 30, oy + 21, ox + 35, oy + 25, 0)
    rect(ox + 31, oy + 21, ox + 34, oy + 23, sock)
    poly(offset([(28, 24), (35, 23), (39, 25), (39, 27), (28, 27)], ox, oy), 0)
    poly(offset([(30, 25), (35, 24), (38, 26), (30, 26)], ox, oy), boot)


def draw_step2(ox, oy, trunks, trim, boot, sock, hi):
    poly(offset([(8, 0), (30, 0), (30, 5), (26, 11), (21, 10),
                 (18, 7), (14, 11), (8, 9)], ox, oy), 0)
    poly(offset([(10, 1), (28, 1), (27, 5), (24, 9), (21, 8),
                 (18, 5), (14, 9), (10, 7)], ox, oy), trunks)
    rect(ox + 10, oy + 1, ox + 28, oy + 3, trim)
    line(ox + 14, oy + 8, ox + 10, oy + 17, 0, 7)
    line(ox + 10, oy + 17, ox + 7, oy + 24, 0, 7)
    line(ox + 14, oy + 8, ox + 10, oy + 17, 4, 4)
    line(ox + 10, oy + 17, ox + 7, oy + 24, 4, 4)
    line(ox + 24, oy + 8, ox + 29, oy + 16, 0, 7)
    line(ox + 29, oy + 16, ox + 33, oy + 22, 0, 7)
    line(ox + 24, oy + 8, ox + 29, oy + 16, 4, 4)
    line(ox + 29, oy + 16, ox + 33, oy + 22, 4, 4)
    line(ox + 12, oy + 11, ox + 9, oy + 18, hi)
    line(ox + 26, oy + 11, ox + 30, oy + 17, hi)
    rect(ox + 4, oy + 21, ox + 10, oy + 25, 0)
    rect(ox + 5, oy + 21, ox + 9, oy + 23, sock)
    poly(offset([(2, 24), (10, 23), (14, 25), (13, 27), (2, 27)], ox, oy), 0)
    poly(offset([(4, 25), (10, 24), (12, 26), (4, 26)], ox, oy), boot)
    rect(ox + 30, oy + 19, ox + 36, oy + 23, 0)
    rect(ox + 31, oy + 19, ox + 35, oy + 21, sock)
    poly(offset([(28, 22), (36, 21), (39, 23), (39, 26), (28, 26)], ox, oy), 0)
    poly(offset([(30, 23), (36, 22), (38, 24), (30, 25)], ox, oy), boot)


draw_ab()
draw_dg()
portrait_ab()
portrait_dg()
draw_step(0, 80, 2, 13, 2, 6, 9)
draw_step(40, 80, 3, 10, 3, 3, 9)
draw_step2(80, 60, 2, 13, 2, 6, 9)
draw_step2(80, 88, 3, 10, 3, 3, 9)

gfx = "\n".join("".join(format(c, "x") for c in row) for row in px)
cart = CART.read_text(encoding="utf-8")
start = cart.index("__gfx__") + len("__gfx__")
end = cart.index("__gff__", start)
cart = cart[:start] + "\n" + gfx + "\n" + cart[end:]
CART.write_text(cart, encoding="utf-8")
print(f"Wrote fighter atlas to {CART}")
