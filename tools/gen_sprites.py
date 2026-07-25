# -*- coding: utf-8 -*-
"""Street Fighter / Puzzle Fighter style chibi boxer sprite sheet."""
from pathlib import Path

K, D1, D2 = 0, 1, 2
DG, BR, DK = 3, 4, 5
GY, WH, RD = 6, 7, 8
OR, YL, GN = 9, 10, 11
BL, IN, PK, PC = 12, 13, 14, 15


def blank():
    return [[0] * 128 for _ in range(128)]


def pset(b, x, y, c):
    if 0 <= x < 128 and 0 <= y < 128:
        b[y][x] = c


def rf(b, x0, y0, x1, y1, c):
    for y in range(min(y0, y1), max(y0, y1) + 1):
        for x in range(min(x0, x1), max(x0, x1) + 1):
            pset(b, x, y, c)


def cf(b, cx, cy, r, c):
    rr = r * r
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= rr:
                pset(b, x, y, c)


def outline(b, x0, y0, w, h):
    solid = set()
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            if 0 <= x < 128 and 0 <= y < 128 and b[y][x] != 0:
                solid.add((x, y))
    for x, y in list(solid):
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if (nx, ny) not in solid and x0 <= nx < x0 + w and y0 <= ny < y0 + h:
                if b[ny][nx] == 0:
                    pset(b, nx, ny, K)


def paint_boxer(b, ox, oy, skin, glove, trunk, accent, spikes, pose):
    """20x28 chibi, faces RIGHT. SF Puzzle Fighter proportions."""
    # pose motion
    punch = lean = dip = 0
    glove_y = 0
    mouth = "smirk" if not spikes else "grit"
    if pose == "idle2":
        dip = 1
    elif pose == "jab":
        punch, lean, mouth = 4, 1, "open"
    elif pose == "punch":
        punch, lean, mouth = 7, 2, "open"
    elif pose == "upper":
        punch, lean, dip, glove_y, mouth = 2, 1, -2, -5, "open"
    elif pose == "hit":
        lean, punch, mouth = -2, -1, "hurt"
    elif pose == "super":
        punch, lean, mouth = 8, 3, "open"

    # clear region
    rf(b, ox, oy, ox + 19, oy + 27, 0)

    # --- shoes ---
    rf(b, ox + 3 + lean, oy + 24 + dip, ox + 7 + lean, oy + 26 + dip, K)
    rf(b, ox + 11 + lean, oy + 24 + dip, ox + 15 + lean, oy + 26 + dip, K)
    pset(b, ox + 4 + lean, oy + 24 + dip, GY)
    pset(b, ox + 12 + lean, oy + 24 + dip, GY)

    # --- legs ---
    rf(b, ox + 4 + lean, oy + 18 + dip, ox + 7 + lean, oy + 24 + dip, trunk)
    rf(b, ox + 11 + lean, oy + 18 + dip, ox + 14 + lean, oy + 24 + dip, trunk)
    # shade
    rf(b, ox + 6 + lean, oy + 19 + dip, ox + 7 + lean, oy + 23 + dip, DK)
    rf(b, ox + 13 + lean, oy + 19 + dip, ox + 14 + lean, oy + 23 + dip, DK)

    # --- trunks ---
    rf(b, ox + 3 + lean, oy + 14 + dip, ox + 15 + lean, oy + 19 + dip, trunk)
    rf(b, ox + 3 + lean, oy + 14 + dip, ox + 15 + lean, oy + 15 + dip, accent)
    # belt buckle
    pset(b, ox + 9 + lean, oy + 15 + dip, WH)
    # fold highlight
    rf(b, ox + 4 + lean, oy + 17 + dip, ox + 6 + lean, oy + 17 + dip, WH if trunk != WH else YL)

    # --- torso ---
    rf(b, ox + 5 + lean, oy + 9 + dip, ox + 13 + lean, oy + 15 + dip, skin)
    # muscle shade
    pset(b, ox + 6 + lean, oy + 11 + dip, BR if skin == PC else DK)
    pset(b, ox + 12 + lean, oy + 11 + dip, BR if skin == PC else DK)
    pset(b, ox + 9 + lean, oy + 13 + dip, BR if skin == PC else DK)

    # chain / necklace
    if not spikes:
        for i, (cx, cy) in enumerate([(7, 10), (8, 11), (9, 11), (10, 11), (11, 10)]):
            pset(b, ox + cx + lean, oy + cy + dip, YL)
        pset(b, ox + 9 + lean, oy + 12 + dip, OR)  # pendant
    else:
        pset(b, ox + 8 + lean, oy + 10 + dip, OR)
        pset(b, ox + 9 + lean, oy + 11 + dip, YL)
        pset(b, ox + 10 + lean, oy + 10 + dip, OR)

    # --- rear arm (guard) ---
    cf(b, ox + 3 + lean, oy + 12 + dip, 2, skin)
    cf(b, ox + 2 + lean, oy + 15 + dip, 3, glove)
    pset(b, ox + 1 + lean, oy + 14 + dip, WH)
    pset(b, ox + 2 + lean, oy + 14 + dip, WH)

    # --- lead arm / punch glove ---
    fx = ox + 14 + lean + punch
    fy = oy + 11 + dip + glove_y
    # forearm
    cf(b, ox + 12 + lean, oy + 12 + dip, 2, skin)
    # BIG glove (Balrog/SF style sphere)
    cf(b, fx, fy + 2, 4, glove)
    cf(b, fx, fy + 2, 3, glove)
    # knuckle shade
    pset(b, fx + 2, fy + 3, K)
    pset(b, fx + 3, fy + 2, K)
    pset(b, fx + 2, fy + 4, K)
    # highlight
    pset(b, fx - 1, fy, WH)
    pset(b, fx, fy, WH)
    pset(b, fx - 1, fy + 1, WH)
    # wrist wrap
    rf(b, fx - 2, fy + 5, fx + 1, fy + 6, WH)

    # --- neck ---
    rf(b, ox + 7 + lean, oy + 7 + dip, ox + 11 + lean, oy + 9 + dip, skin)

    # --- HEAD (oversized) ---
    hx, hy = ox + 9 + lean, oy + 4 + dip
    if pose == "hit":
        hx -= 1
        hy += 1
    cf(b, hx, hy, 6, skin)
    # ears
    cf(b, hx - 6, hy + 1, 1, skin)
    cf(b, hx + 6, hy + 1, 1, skin)

    # hair
    if spikes:
        cf(b, hx, hy - 2, 5, K)
        for dx, tip in ((-5, 3), (-3, 4), (-1, 5), (1, 5), (3, 4), (5, 3)):
            for t in range(tip):
                pset(b, hx + dx, hy - 4 - t, K)
        # hairline over forehead
        rf(b, hx - 5, hy - 2, hx + 5, hy - 1, K)
    else:
        # fade cut
        cf(b, hx, hy - 3, 5, K)
        rf(b, hx - 5, hy - 1, hx + 5, hy + 2, skin)
        # top hair mass
        rf(b, hx - 4, hy - 6, hx + 4, hy - 3, K)
        pset(b, hx - 2, hy - 7, K)
        pset(b, hx, hy - 7, K)
        pset(b, hx + 2, hy - 7, K)
        # side fade
        pset(b, hx - 6, hy, GY)
        pset(b, hx - 6, hy + 1, GY)
        pset(b, hx + 6, hy, GY)
        pset(b, hx + 6, hy + 1, GY)
        # studs
        pset(b, hx - 7, hy + 1, YL)
        pset(b, hx + 7, hy + 1, YL)

    # brows
    if spikes:
        rf(b, hx - 4, hy - 2, hx - 1, hy - 1, K)
        rf(b, hx + 1, hy - 2, hx + 4, hy - 1, K)
        pset(b, hx - 1, hy - 3, K)
        pset(b, hx + 1, hy - 3, K)
    else:
        pset(b, hx - 3, hy - 1, K)
        pset(b, hx - 2, hy - 2, K)
        pset(b, hx - 1, hy - 1, K)
        pset(b, hx + 1, hy - 2, K)
        pset(b, hx + 2, hy - 2, K)
        pset(b, hx + 3, hy - 1, K)

    # eyes
    if mouth == "hurt":
        for sx, sy in ((-3, 0), (-2, 1), (-3, 1), (-2, 0), (2, 0), (3, 1), (2, 1), (3, 0)):
            pset(b, hx + sx, hy + sy, K)
    else:
        rf(b, hx - 4, hy, hx - 1, hy + 2, WH)
        rf(b, hx + 1, hy, hx + 4, hy + 2, WH)
        pset(b, hx - 2, hy + 1, K)
        pset(b, hx + 3, hy + 1, K)
        pset(b, hx - 3, hy, WH)
        pset(b, hx + 2, hy, WH)

    # nose
    pset(b, hx, hy + 2, BR if skin == PC else DK)

    # mouth
    if mouth == "open":
        rf(b, hx - 2, hy + 3, hx + 2, hy + 5, K)
        rf(b, hx - 1, hy + 4, hx + 1, hy + 4, WH)
    elif mouth == "hurt":
        rf(b, hx - 1, hy + 4, hx + 2, hy + 5, K)
    elif mouth == "smirk":
        pset(b, hx, hy + 4, RD)
        pset(b, hx + 1, hy + 4, RD)
        pset(b, hx + 2, hy + 3, RD)
    else:  # grit
        rf(b, hx - 2, hy + 4, hx + 2, hy + 4, K)
        pset(b, hx - 1, hy + 4, WH)
        pset(b, hx + 1, hy + 4, WH)

    outline(b, ox, oy, 20, 28)


def build_sheet():
    b = blank()
    frames = ["idle", "idle2", "jab", "punch", "upper", "hit", "super"]
    # Broner
    for i, pose in enumerate(frames):
        x, y = (i % 6) * 20, (i // 6) * 28
        paint_boxer(b, x, y, PC, PK, YL, YL, False, pose)
    # Deen
    for i, pose in enumerate(frames):
        x, y = (i % 6) * 20, 56 + (i // 6) * 28
        paint_boxer(b, x, y, BR, RD, OR, OR, True, pose)
    return b


def sheet_to_gfx(buf):
    return "\n".join("".join(f"{buf[y][x]:x}" for x in range(128)) for y in range(128)) + "\n"


def main():
    gfx = sheet_to_gfx(build_sheet())
    Path(__file__).resolve().parents[1].joinpath("tools", "fighters.gfx.txt").write_text(
        gfx, encoding="utf-8"
    )
    print("sprites ok", sum(1 for c in gfx if c not in "0\n"))


if __name__ == "__main__":
    main()
