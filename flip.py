import os
from PIL import Image

FLIP_MAP = {
    'rampage_punches.jpg': True,
}

assets_dir = 'assets'

for filename, needs_flip in FLIP_MAP.items():
    if needs_flip:
        filepath = os.path.join(assets_dir, filename)
        if os.path.exists(filepath):
            try:
                img = Image.open(filepath)
                flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
                flipped.save(filepath, quality=95)
                print(f"Flipped {filename}")
            except Exception as e:
                print(f"Error flipping {filename}: {e}")
        else:
            print(f"Warning: {filename} not found.")

print("Done flipping sprites.")
