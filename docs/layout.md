# Screen layout (128×128)

```
y=0..7     top bar: ROUND / VS names
y=8..11    thin accent
y=12..95   playfield band
y=96..127  next pieces + hints + pause
```

## Wells

| | P1 (left) | P2 (right) |
| --- | --- | --- |
| Origin (x,y) | (2, 14) | (86, 14) |
| Cell | 6×6 | 6×6 |
| Cols×rows | 6×12 | 6×12 |
| Pixel size | 36×72 | 36×72 |

Kill column = local col 3 (x offset 18 within well).

## Center stage

- Region: x **40–85**, y **20–90**
- Two chibis facing: P1 at ~44, P2 at ~64 (mirrored)
- Attack FX as short flashes between them

## Next previews

- P1 next: x=2, y=100
- P2 next: x=86, y=100
- Each shows 2 gem cells

## Title / select / result

Full-screen text + palette bars; select uses two large chibi previews.
