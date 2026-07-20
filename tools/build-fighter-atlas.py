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


def draw_ab(ox=0):
    # Long arcade-fighter legs: defined thighs, small knees, tapered calves.
    poly(offset([(14, 36), (18, 37), (16, 42), (13, 47), (9, 52),
                 (4, 52), (7, 45), (10, 40)], ox), 0)
    poly(offset([(14, 38), (17, 38), (15, 41), (13, 44), (12, 46),
                 (8, 51), (6, 50), (9, 44), (11, 40)], ox), 4)
    line(ox + 15, 39, ox + 12, 45, 9)
    rect(ox + 11, 44, ox + 13, 45, 4)
    pset(ox + 11, 45, 5)
    pset(ox + 13, 44, 9)
    poly(offset([(22, 37), (27, 36), (29, 41), (31, 45), (36, 51),
                 (31, 52), (27, 47), (25, 43)], ox), 0)
    poly(offset([(22, 38), (27, 38), (28, 41), (29, 44), (31, 46),
                 (35, 51), (32, 51), (28, 47), (26, 42)], ox), 4)
    line(ox + 25, 39, ox + 29, 45, 9)
    rect(ox + 28, 44, ox + 30, 45, 4)
    pset(ox + 28, 45, 5)
    pset(ox + 30, 44, 9)
    rect(ox + 3, 48, ox + 9, 52, 0)
    rect(ox + 4, 48, ox + 8, 50, 6)
    pset(ox + 5, 49, 7)
    poly(offset([(1, 51), (8, 50), (11, 52), (10, 55), (1, 55)], ox), 0)
    poly(offset([(3, 52), (8, 51), (9, 53), (8, 54), (3, 54)], ox), 2)
    pset(ox + 8, 52, 13)
    rect(ox + 30, 48, ox + 35, 51, 0)
    rect(ox + 31, 47, ox + 34, 49, 6)
    pset(ox + 32, 48, 7)
    poly(offset([(30, 50), (35, 49), (38, 52), (38, 55), (30, 55)], ox), 0)
    poly(offset([(31, 51), (35, 50), (37, 52), (36, 54), (31, 54)], ox), 2)
    pset(ox + 36, 51, 13)

    # Tailored trunks stop above the knee and split clearly between the thighs.
    poly(offset([(12, 28), (29, 28), (30, 31), (27, 40), (22, 40),
                 (20, 35), (17, 40), (11, 40), (11, 31)], ox), 0)
    poly(offset([(14, 30), (27, 30), (28, 32), (25, 38), (22, 38),
                 (20, 33), (17, 38), (13, 38)], ox), 2)
    line(ox + 13, 29, ox + 28, 30, 13)
    rect(ox + 18, 29, ox + 20, 30, 5)
    line(ox + 13, 32, ox + 13, 37, 7)
    line(ox + 27, 32, ox + 25, 37, 7)
    line(ox + 19, 34, ox + 19, 39, 0)
    line(ox + 14, 33, ox + 14, 37, 13)
    line(ox + 26, 33, ox + 24, 37, 5)
    pset(ox + 17, 31, 7)
    pset(ox + 21, 31, 6)
    pset(ox + 15, 38, 13)
    pset(ox + 23, 38, 13)

    # A.B.: fitted black training shirt with a narrow athletic shoulder line.
    poly(offset([(11, 31), (10, 25), (12, 20), (17, 17), (20, 15),
                 (27, 15), (32, 18), (35, 24), (32, 31)], ox), 0)
    poly(offset([(14, 30), (13, 24), (17, 20), (21, 17), (26, 17),
                 (30, 20), (32, 25), (29, 30)], ox), 1)
    poly(offset([(13, 21), (17, 18), (20, 19), (18, 23), (14, 25)], ox), 1)
    poly(offset([(27, 18), (31, 20), (33, 24), (31, 26), (28, 23)], ox), 1)
    line(ox + 14, 21, ox + 18, 22, 5)
    line(ox + 29, 20, ox + 32, 23, 5)
    line(ox + 18, 21, ox + 28, 20, 5)
    line(ox + 22, 21, ox + 22, 29, 0)
    line(ox + 16, 27, ox + 21, 28, 5)
    line(ox + 24, 28, ox + 29, 27, 5)
    pset(ox + 15, 23, 6)
    pset(ox + 29, 22, 6)

    # A.B. uses a narrow adult profile: vertical brow, one-pixel nose, recessed mouth.
    poly(offset([(20, 18), (21, 11), (27, 11), (29, 18), (27, 21), (20, 20)], ox), 0)
    poly(offset([(22, 17), (22, 12), (26, 12), (27, 17), (25, 19), (22, 18)], ox), 4)
    line(ox + 22, 13, ox + 22, 17, 15)
    line(ox + 26, 13, ox + 27, 18, 9)
    poly(offset([(18, 6), (20, 3), (23, 2), (27, 3), (29, 5),
                 (29, 10), (29, 12),
                 (28, 12), (28, 14), (26, 17), (22, 16), (19, 14),
                 (18, 10)], ox), 0)
    poly(offset([(20, 6), (21, 4), (24, 3), (27, 4), (28, 6),
                 (28, 10), (28, 11),
                 (27, 12), (27, 14), (25, 15), (22, 15), (20, 13),
                 (19, 10), (19, 7)], ox), 4)
    poly(offset([(18, 6), (20, 3), (23, 2), (27, 3), (29, 5),
                 (28, 6), (25, 5), (22, 5), (20, 7)], ox), 0)
    line(ox + 21, 3, ox + 26, 3, 5)
    pset(ox + 23, 3, 6)
    rect(ox + 19, 8, ox + 20, 10, 9)
    pset(ox + 20, 8, 15)
    line(ox + 25, 6, ox + 27, 6, 5)
    pset(ox + 26, 7, 7)
    pset(ox + 27, 7, 0)
    pset(ox + 28, 9, 9)
    pset(ox + 28, 10, 0)
    pset(ox + 27, 12, 9)
    # Beard follows the underside of the jaw and never projects past the mouth.
    poly(offset([(20, 11), (22, 12), (24, 13), (26, 12), (28, 13),
                 (27, 15), (25, 17), (22, 16), (20, 14)], ox), 0)
    pset(ox + 27, 12, 4)
    line(ox + 22, 14, ox + 25, 15, 5)


def draw_dg(ox=40):
    poly(offset([(14, 36), (18, 37), (16, 42), (12, 47), (8, 52),
                 (3, 52), (6, 45), (10, 40)], ox), 0)
    poly(offset([(14, 38), (17, 38), (15, 41), (12, 44), (11, 46),
                 (7, 51), (5, 50), (8, 44), (11, 40)], ox), 4)
    line(ox + 15, 39, ox + 11, 45, 9)
    rect(ox + 10, 44, ox + 12, 45, 4)
    pset(ox + 10, 45, 5)
    pset(ox + 12, 44, 9)
    poly(offset([(22, 37), (27, 36), (30, 41), (32, 45), (38, 51),
                 (33, 52), (28, 47), (25, 43)], ox), 0)
    poly(offset([(22, 38), (27, 38), (29, 41), (30, 44), (32, 46),
                 (37, 51), (34, 51), (29, 47), (26, 42)], ox), 4)
    line(ox + 25, 39, ox + 30, 45, 9)
    rect(ox + 29, 44, ox + 31, 45, 4)
    pset(ox + 29, 45, 5)
    pset(ox + 31, 44, 9)
    rect(ox + 2, 48, ox + 8, 52, 0)
    rect(ox + 3, 48, ox + 7, 50, 0)
    pset(ox + 4, 49, 10)
    poly(offset([(1, 51), (8, 50), (11, 52), (10, 55), (1, 55)], ox), 0)
    poly(offset([(3, 52), (8, 51), (9, 53), (8, 54), (3, 54)], ox), 0)
    pset(ox + 7, 52, 10)
    rect(ox + 32, 48, ox + 37, 52, 0)
    rect(ox + 33, 48, ox + 36, 50, 0)
    pset(ox + 34, 49, 10)
    poly(offset([(30, 50), (36, 49), (38, 52), (38, 55), (30, 55)], ox), 0)
    poly(offset([(32, 51), (36, 50), (37, 52), (36, 54), (32, 54)], ox), 0)
    pset(ox + 36, 51, 10)

    poly(offset([(12, 28), (30, 28), (31, 31), (27, 40), (22, 40),
                 (20, 35), (17, 40), (11, 40), (11, 31)], ox), 0)
    poly(offset([(14, 30), (28, 30), (29, 32), (25, 38), (22, 38),
                 (20, 33), (17, 38), (13, 38)], ox), 3)
    line(ox + 13, 29, ox + 29, 30, 10)
    rect(ox + 19, 29, ox + 21, 30, 9)
    line(ox + 13, 32, ox + 13, 37, 10)
    line(ox + 28, 32, ox + 25, 37, 10)
    line(ox + 19, 34, ox + 19, 39, 0)
    line(ox + 14, 33, ox + 14, 37, 10)
    line(ox + 27, 33, ox + 24, 37, 5)
    pset(ox + 17, 31, 15)
    pset(ox + 22, 31, 9)
    pset(ox + 15, 38, 11)
    pset(ox + 23, 38, 11)

    poly(offset([(11, 32), (10, 25), (12, 20), (17, 17), (21, 14),
                 (28, 15), (33, 19), (35, 25), (31, 32)], ox), 0)
    poly(offset([(14, 31), (13, 24), (17, 20), (22, 16), (27, 17),
                 (31, 21), (32, 27), (28, 31)], ox), 4)
    poly(offset([(13, 21), (17, 18), (19, 19), (18, 23), (15, 25), (12, 23)], ox), 4)
    poly(offset([(27, 17), (32, 20), (34, 24), (31, 26), (27, 23)], ox), 4)
    line(ox + 13, 20, ox + 18, 22, 9)
    line(ox + 22, 22, ox + 29, 20, 9)
    line(ox + 16, 23, ox + 28, 23, 0)
    line(ox + 20, 20, ox + 20, 31, 0)
    line(ox + 17, 26, ox + 20, 27, 9)
    line(ox + 23, 27, ox + 27, 26, 9)
    pset(ox + 12, 19, 15)
    pset(ox + 30, 20, 15)
    pset(ox + 15, 29, 9)
    pset(ox + 25, 30, 9)

    # Deen shares the human profile but keeps the jaw visible and braids rearward.
    poly(offset([(20, 18), (21, 11), (27, 11), (29, 18), (27, 21), (20, 20)], ox), 0)
    poly(offset([(22, 17), (22, 12), (26, 12), (27, 17), (25, 19), (22, 18)], ox), 4)
    line(ox + 22, 13, ox + 22, 17, 15)
    line(ox + 26, 13, ox + 27, 18, 9)
    poly(offset([(18, 6), (20, 3), (23, 2), (27, 3), (29, 5),
                 (29, 10), (29, 12),
                 (28, 14), (26, 16), (22, 16), (19, 14), (18, 10)], ox), 0)
    poly(offset([(20, 6), (21, 4), (24, 3), (27, 4), (28, 6),
                 (28, 10), (28, 12),
                 (27, 13), (26, 15), (22, 15), (20, 13), (19, 10),
                 (19, 7)], ox), 4)
    poly(offset([(18, 6), (20, 3), (23, 2), (27, 3), (29, 5),
                 (28, 6), (25, 5), (22, 5), (20, 7)], ox), 0)
    line(ox + 21, 3, ox + 26, 4, 5)
    line(ox + 19, 5, ox + 15, 12, 0)
    line(ox + 21, 4, ox + 18, 15, 0)
    line(ox + 23, 4, ox + 22, 17, 0)
    line(ox + 19, 5, ox + 16, 12, 5)
    line(ox + 21, 5, ox + 19, 15, 5)
    line(ox + 23, 5, ox + 23, 17, 5)
    pset(ox + 16, 12, 6)
    pset(ox + 19, 15, 6)
    pset(ox + 23, 17, 6)
    rect(ox + 19, 8, ox + 20, 10, 9)
    pset(ox + 20, 8, 15)
    line(ox + 25, 6, ox + 27, 6, 5)
    pset(ox + 26, 7, 7)
    pset(ox + 27, 7, 0)
    pset(ox + 28, 9, 9)
    pset(ox + 28, 10, 0)
    pset(ox + 27, 12, 9)
    pset(ox + 27, 14, 5)


def portrait_ab(ox=0, oy=64):
    poly(offset([(1, 15), (3, 12), (6, 11), (11, 11), (14, 15)], ox, oy), 1)
    rect(ox + 6, oy + 11, ox + 10, oy + 15, 4)
    poly(offset([(3, 5), (5, 2), (9, 2), (12, 4), (12, 8),
                 (12, 10), (10, 12), (6, 12),
                 (3, 9)], ox, oy), 0)
    poly(offset([(5, 5), (6, 3), (9, 3), (11, 5), (11, 7),
                 (11, 8), (11, 10), (9, 11), (6, 10),
                 (4, 8)], ox, oy), 4)
    poly(offset([(3, 5), (5, 2), (9, 2), (12, 4), (11, 5),
                 (8, 4), (5, 4), (4, 6)], ox, oy), 0)
    line(ox + 6, oy + 2, ox + 10, oy + 3, 5)
    pset(ox + 5, oy + 7, 9)
    pset(ox + 6, oy + 6, 15)
    pset(ox + 7, oy + 6, 0)
    pset(ox + 9, oy + 6, 15)
    pset(ox + 10, oy + 6, 0)
    pset(ox + 11, oy + 9, 0)
    poly(offset([(4, 9), (6, 9), (8, 10), (10, 9), (11, 10),
                 (10, 13), (7, 13), (5, 11)], ox, oy), 0)
    pset(ox + 10, oy + 9, 4)
    line(ox + 6, oy + 11, ox + 9, oy + 12, 5)


def portrait_dg(ox=16, oy=64):
    poly(offset([(1, 15), (3, 12), (6, 11), (11, 11), (14, 15)], ox, oy), 4)
    rect(ox + 6, oy + 11, ox + 10, oy + 15, 4)
    poly(offset([(3, 5), (5, 2), (9, 2), (12, 4), (12, 8),
                 (12, 10), (10, 12), (6, 12),
                 (3, 9)], ox, oy), 0)
    poly(offset([(5, 5), (6, 3), (9, 3), (11, 5), (11, 7),
                 (11, 8), (11, 10), (9, 11), (6, 10),
                 (4, 8)], ox, oy), 4)
    poly(offset([(3, 5), (5, 2), (9, 2), (12, 4), (11, 5),
                 (8, 4), (5, 4), (4, 6)], ox, oy), 0)
    line(ox + 6, oy + 2, ox + 10, oy + 3, 5)
    line(ox + 4, oy + 3, ox + 1, oy + 10, 0)
    line(ox + 6, oy + 3, ox + 3, oy + 13, 0)
    line(ox + 8, oy + 3, ox + 7, oy + 14, 0)
    line(ox + 4, oy + 4, ox + 2, oy + 10, 5)
    line(ox + 6, oy + 4, ox + 4, oy + 13, 5)
    line(ox + 8, oy + 4, ox + 8, oy + 14, 5)
    pset(ox + 5, oy + 7, 9)
    pset(ox + 6, oy + 6, 15)
    pset(ox + 7, oy + 6, 0)
    pset(ox + 9, oy + 6, 15)
    pset(ox + 10, oy + 6, 0)
    pset(ox + 11, oy + 9, 0)
    pset(ox + 10, oy + 11, 5)


def draw_step(ox, oy, trunks, trim, boot, sock, hi):
    poly(offset([(11, 0), (30, 0), (30, 4), (26, 9), (22, 9),
                 (20, 6), (17, 10), (11, 9)], ox, oy), 0)
    poly(offset([(13, 1), (28, 1), (27, 4), (24, 8), (22, 7),
                 (20, 5), (17, 8), (13, 7)], ox, oy), trunks)
    line(ox + 13, oy + 1, ox + 28, oy + 2, trim, 2)
    line(ox + 15, oy + 8, ox + 10, oy + 17, 0, 7)
    line(ox + 10, oy + 17, ox + 8, oy + 24, 0, 5)
    line(ox + 15, oy + 8, ox + 10, oy + 17, 4, 5)
    line(ox + 10, oy + 17, ox + 8, oy + 24, 4, 3)
    disc(ox + 10, oy + 17, 2, 0)
    disc(ox + 10, oy + 17, 1, 4)
    pset(ox + 9, oy + 17, hi)
    line(ox + 23, oy + 8, ox + 28, oy + 16, 0, 7)
    line(ox + 28, oy + 16, ox + 32, oy + 23, 0, 5)
    line(ox + 23, oy + 8, ox + 28, oy + 16, 4, 5)
    line(ox + 28, oy + 16, ox + 32, oy + 23, 4, 3)
    disc(ox + 28, oy + 16, 2, 0)
    disc(ox + 28, oy + 16, 1, 4)
    pset(ox + 27, oy + 16, hi)
    line(ox + 11, oy + 12, ox + 9, oy + 18, hi)
    line(ox + 26, oy + 12, ox + 29, oy + 17, hi)
    rect(ox + 5, oy + 21, ox + 11, oy + 25, 0)
    rect(ox + 6, oy + 21, ox + 10, oy + 23, sock)
    poly(offset([(3, 24), (10, 23), (12, 25), (11, 27), (3, 27)], ox, oy), 0)
    poly(offset([(4, 25), (9, 24), (11, 26), (4, 26)], ox, oy), boot)
    rect(ox + 30, oy + 21, ox + 35, oy + 25, 0)
    rect(ox + 31, oy + 21, ox + 34, oy + 23, sock)
    poly(offset([(29, 24), (35, 23), (38, 25), (38, 27), (29, 27)], ox, oy), 0)
    poly(offset([(30, 25), (35, 24), (37, 26), (30, 26)], ox, oy), boot)


def draw_step2(ox, oy, trunks, trim, boot, sock, hi):
    poly(offset([(11, 0), (30, 0), (29, 4), (25, 9), (21, 8),
                 (19, 6), (16, 10), (11, 8)], ox, oy), 0)
    poly(offset([(13, 1), (28, 1), (26, 4), (23, 7), (21, 7),
                 (19, 4), (16, 8), (13, 6)], ox, oy), trunks)
    line(ox + 13, oy + 1, ox + 28, oy + 2, trim, 2)
    line(ox + 15, oy + 8, ox + 10, oy + 17, 0, 7)
    line(ox + 10, oy + 17, ox + 7, oy + 24, 0, 5)
    line(ox + 15, oy + 8, ox + 10, oy + 17, 4, 5)
    line(ox + 10, oy + 17, ox + 7, oy + 24, 4, 3)
    disc(ox + 10, oy + 17, 2, 0)
    disc(ox + 10, oy + 17, 1, 4)
    pset(ox + 9, oy + 17, hi)
    line(ox + 23, oy + 8, ox + 29, oy + 15, 0, 7)
    line(ox + 29, oy + 15, ox + 33, oy + 22, 0, 5)
    line(ox + 23, oy + 8, ox + 29, oy + 15, 4, 5)
    line(ox + 29, oy + 15, ox + 33, oy + 22, 4, 3)
    disc(ox + 29, oy + 15, 2, 0)
    disc(ox + 29, oy + 15, 1, 4)
    pset(ox + 28, oy + 15, hi)
    line(ox + 12, oy + 11, ox + 9, oy + 18, hi)
    line(ox + 26, oy + 11, ox + 30, oy + 17, hi)
    rect(ox + 4, oy + 21, ox + 10, oy + 25, 0)
    rect(ox + 5, oy + 21, ox + 9, oy + 23, sock)
    poly(offset([(3, 24), (10, 23), (12, 25), (11, 27), (3, 27)], ox, oy), 0)
    poly(offset([(4, 25), (9, 24), (11, 26), (4, 26)], ox, oy), boot)
    rect(ox + 30, oy + 19, ox + 36, oy + 23, 0)
    rect(ox + 31, oy + 19, ox + 35, oy + 21, sock)
    poly(offset([(29, 22), (36, 21), (38, 23), (38, 26), (29, 26)], ox, oy), 0)
    poly(offset([(30, 23), (36, 22), (37, 24), (30, 25)], ox, oy), boot)


def stretch_frame(sx, sy, dx, dy, width, source_height=28, target_height=32):
    source = [[px[sy + y][sx + x] for x in range(width)] for y in range(source_height)]
    for y in range(target_height):
        source_y = round(y * (source_height - 1) / (target_height - 1))
        for x in range(width):
            px[dy + y][dx + x] = source[source_y][x]


draw_ab()
draw_dg()
stretch_frame(0, 28, 0, 32, 40)
stretch_frame(40, 28, 40, 32, 40)
portrait_ab()
portrait_dg()
draw_step(0, 80, 2, 13, 2, 6, 9)
draw_step(40, 80, 3, 10, 0, 0, 10)
stretch_frame(0, 80, 0, 80, 40)
stretch_frame(40, 80, 40, 80, 40)
draw_step2(80, 64, 2, 13, 2, 6, 9)
draw_step2(80, 96, 3, 10, 0, 0, 10)
stretch_frame(80, 64, 80, 64, 40)
stretch_frame(80, 96, 80, 96, 40)

gfx = "\n".join("".join(format(c, "x") for c in row) for row in px)
cart = CART.read_text(encoding="utf-8")
start = cart.index("__gfx__") + len("__gfx__")
end = cart.index("__gff__", start)
cart = cart[:start] + "\n" + gfx + "\n" + cart[end:]
CART.write_text(cart, encoding="utf-8")
print(f"Wrote fighter atlas to {CART}")
