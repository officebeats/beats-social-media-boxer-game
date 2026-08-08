import os
import cv2
import numpy as np

def extract_frames(image_path, num_frames=4, out_size=256):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read {image_path}")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Determine background (check corners)
    corners = [gray[0,0], gray[0,-1], gray[-1,0], gray[-1,-1]]
    bg_color = int(np.median(corners))
    
    # Threshold
    if bg_color > 127: # White background
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    else: # Black background
        _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        
    # Morphological operations to merge parts of the same sprite
    kernel = np.ones((15,15), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter by area and get bounding rects
    rects = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w > 50 and h > 100: # Minimum size for a boxer
            rects.append((x, y, w, h))
            
    if len(rects) == 0:
        # Fallback: just return black frames
        print(f"Warning: No contours found in {image_path}. Using fallback.")
        return [np.zeros((out_size, out_size, 3), dtype=np.uint8)] * num_frames
        
    # Group by Y to find rows
    rects.sort(key=lambda r: r[1])
    
    rows = []
    current_row = [rects[0]]
    for r in rects[1:]:
        if abs(r[1] - current_row[-1][1]) < 100: # Same row
            current_row.append(r)
        else:
            rows.append(current_row)
            current_row = [r]
    rows.append(current_row)
    
    # Find the row with the most frames, or the top row if they all have the same
    best_row = max(rows, key=len)
    if len(best_row) > num_frames:
        best_row.sort(key=lambda r: r[0])
        best_row = best_row[:num_frames]
    
    # Sort left to right
    best_row.sort(key=lambda r: r[0])
    
    while len(best_row) < num_frames:
        best_row.append(best_row[-1])
        
    frames = []
    for (x, y, w, h) in best_row:
        sprite = img[y:y+h, x:x+w]
        scale = min((out_size * 0.8) / w, (out_size * 0.8) / h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(sprite, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        square = np.zeros((out_size, out_size, 3), dtype=np.uint8)
        start_x = (out_size - new_w) // 2
        start_y = (out_size - new_h) // 2
        
        square[:] = (255, 255, 255) if bg_color > 127 else (0, 0, 0)
        square[start_y:start_y+new_h, start_x:start_x+new_w] = resized
        frames.append(square)
        
    return frames

def build_master_sheet(prefix, output_filename):
    brain_dir = r"C:\Users\admin-beats\.gemini\antigravity\brain\11b98ff1-61dc-43d0-a0f4-da17ab16d5df"
    
    def get_file(action):
        for f in os.listdir(brain_dir):
            if f.startswith(f"{prefix}_{action}_") and f.endswith(".jpg"):
                return os.path.join(brain_dir, f)
        raise FileNotFoundError(f"Could not find {prefix}_{action}")

    actions = ["idle", "jab", "straight", "hook", "dodge", "block"]
    out_size = 256
    
    master_img = np.zeros((out_size * 6, out_size * 4, 3), dtype=np.uint8)
    
    for row_idx, action in enumerate(actions):
        path = get_file(action)
        frames = extract_frames(path, num_frames=4, out_size=out_size)
        for col_idx, frame in enumerate(frames):
            y = row_idx * out_size
            x = col_idx * out_size
            master_img[y:y+out_size, x:x+out_size] = frame
            
    out_path = os.path.join(r"C:\Users\admin-beats\Documents\antigravity\lucid-fermi\assets", output_filename)
    cv2.imwrite(out_path, master_img)
    print(f"Saved optimized spritesheet: {out_path}")

if __name__ == "__main__":
    build_master_sheet("broner", "broner_master.jpg")
    build_master_sheet("deen", "deen_master.jpg")
