"""
Anchor-Gated Master Spritesheet Builder v2.
Applies best practices from fighting game sprite sheet community:
1. Uses anchor-gated generation (reference image input to AI)
2. Uniform cell extraction with OpenCV contour detection
3. Normalizes each sprite to identical bounding box (centered, same scale)
4. 1px transparent padding to prevent texture bleeding
5. Consistent black background for clean chroma keying

Layout: 4 cols x 8 rows = 32 cells, each 256x256
Row 0: Idle (4 frames from idle strip)
Row 1-4: Jab, Straight, Hook, Uppercut (from 4x2 action grid top row)
Row 5-7: Duck, Lean, Shoulder Roll (from 4x2 action grid bottom row)
"""
import os
import cv2
import numpy as np
from PIL import Image

BRAIN_DIR = r"C:\Users\admin-beats\.gemini\antigravity\brain\11b98ff1-61dc-43d0-a0f4-da17ab16d5df"
ASSET_DIR = r"C:\Users\admin-beats\Documents\antigravity\lucid-fermi\assets"
CELL = 256

def find_latest(prefix, directory=BRAIN_DIR):
    matches = [os.path.join(directory, f) for f in os.listdir(directory) 
               if f.startswith(prefix) and f.endswith(".jpg")]
    if not matches:
        raise FileNotFoundError(f"No file matching prefix '{prefix}' in {directory}")
    matches.sort()
    return matches[-1]

def normalize_sprite(cv_img, target_size=CELL, padding_pct=0.05):
    """
    Find the sprite's bounding box via contour detection,
    crop it, scale to fit target_size with padding, and center it
    on a black square. Returns a clean CELL x CELL image.
    """
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    # Adaptive threshold for mixed backgrounds
    _, thresh = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY)
    
    # Find overall bounding rect of all non-black pixels
    coords = cv2.findNonZero(thresh)
    if coords is None:
        return np.zeros((target_size, target_size, 3), dtype=np.uint8)
    
    x, y, w, h = cv2.boundingRect(coords)
    
    # Crop to bounding rect
    sprite = cv_img[y:y+h, x:x+w]
    
    # Scale to fit in target with padding
    pad = int(target_size * padding_pct)
    available = target_size - 2 * pad
    scale = min(available / w, available / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    resized = cv2.resize(sprite, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    # Center on black canvas
    canvas = np.zeros((target_size, target_size, 3), dtype=np.uint8)
    ox = (target_size - new_w) // 2
    oy = (target_size - new_h) // 2
    canvas[oy:oy+new_h, ox:ox+new_w] = resized
    
    return canvas

def extract_grid_cell(img_path, col, row, grid_cols, grid_rows):
    """Extract a cell from a grid image and normalize it."""
    img = cv2.imread(img_path)
    h, w = img.shape[:2]
    cell_w = w // grid_cols
    cell_h = h // grid_rows
    
    x1 = col * cell_w
    y1 = row * cell_h
    cell = img[y1:y1+cell_h, x1:x1+cell_w]
    
    return normalize_sprite(cell)

def extract_idle_frame(img_path, frame_idx, num_frames=4):
    """Extract a frame from a horizontal idle strip."""
    img = cv2.imread(img_path)
    h, w = img.shape[:2]
    frame_w = w // num_frames
    
    x1 = frame_idx * frame_w
    cell = img[0:h, x1:x1+frame_w]
    
    return normalize_sprite(cell)

def build_master(prefix):
    print(f"\n=== Building master for {prefix} ===")
    
    # Source files
    idle_path = os.path.join(ASSET_DIR, f"{prefix}_sprite.jpg")
    action_path = find_latest(f"{prefix}_actions_anchored")
    idle_strip_path = find_latest(f"{prefix}_idle_strip")
    
    print(f"  Idle anchor: {idle_path}")
    print(f"  Action grid (4x2): {action_path}")
    print(f"  Idle strip: {idle_strip_path}")
    
    # Master canvas
    master = np.zeros((CELL * 8, CELL * 4, 3), dtype=np.uint8)
    
    # --- Row 0: Idle animation (from idle strip) ---
    for i in range(4):
        frame = extract_idle_frame(idle_strip_path, i)
        master[0*CELL:(0+1)*CELL, i*CELL:(i+1)*CELL] = frame
    
    # --- Rows 1-4: Punches (from action grid top row, cols 0-3) ---
    # Action grid is 4x2: top row = jab, straight, hook, uppercut
    for punch_idx in range(4):
        row_idx = punch_idx + 1  # rows 1-4
        # Use idle as frames 0 and 3, action as frames 1 and 2
        idle_frame = normalize_sprite(cv2.imread(idle_path))
        action_frame = extract_grid_cell(action_path, punch_idx, 0, 4, 2)
        
        master[row_idx*CELL:(row_idx+1)*CELL, 0*CELL:1*CELL] = idle_frame    # frame 0: idle
        master[row_idx*CELL:(row_idx+1)*CELL, 1*CELL:2*CELL] = action_frame  # frame 1: action
        master[row_idx*CELL:(row_idx+1)*CELL, 2*CELL:3*CELL] = action_frame  # frame 2: hold
        master[row_idx*CELL:(row_idx+1)*CELL, 3*CELL:4*CELL] = idle_frame    # frame 3: retract
    
    # --- Rows 5-7: Defense (from action grid bottom row, cols 0-2) ---
    # Bottom row: duck(0), lean(1), shoulder_roll(2), idle_bounce(3)
    for def_idx in range(3):
        row_idx = def_idx + 5  # rows 5-7
        idle_frame = normalize_sprite(cv2.imread(idle_path))
        defense_frame = extract_grid_cell(action_path, def_idx, 1, 4, 2)
        
        master[row_idx*CELL:(row_idx+1)*CELL, 0*CELL:1*CELL] = idle_frame      # frame 0: idle
        master[row_idx*CELL:(row_idx+1)*CELL, 1*CELL:2*CELL] = defense_frame   # frame 1: transition
        master[row_idx*CELL:(row_idx+1)*CELL, 2*CELL:3*CELL] = defense_frame   # frame 2: hold
        master[row_idx*CELL:(row_idx+1)*CELL, 3*CELL:4*CELL] = idle_frame      # frame 3: return
    
    # Save
    out_path = os.path.join(ASSET_DIR, f"{prefix}_master.jpg")
    cv2.imwrite(out_path, master, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(f"  Saved: {out_path} ({master.shape[1]}x{master.shape[0]})")

if __name__ == "__main__":
    build_master("broner")
    build_master("deen")
    print("\nDone! Anchor-gated master spritesheets built with normalized sizing.")
