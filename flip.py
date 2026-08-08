import os
from PIL import Image

# Dictionary of which sprites need to be flipped horizontally to face LEFT
FLIP_MAP = {
    'broner_sprite.jpg': False,
    'broner_punches.jpg': True,
    
    'deen_sprite.jpg': True,
    'deen_punches.jpg': False,
    
    'ryan_sprite.jpg': False,
    'ryan_punches.jpg': False,
    
    'n3on_sprite.jpg': True,
    'n3on_punches.jpg': True,
    
    'rayj_sprite.jpg': True,
    'rayj_punches.jpg': True,
    
    'blueface_sprite.jpg': True,
    'blueface_punches.jpg': True,
    
    'chrisean_sprite.jpg': True,
    'chrisean_punches.jpg': True,
    
    'rampage_sprite.jpg': False,
    'rampage_punches.jpg': True,
    
    'adin_sprite.jpg': False,
    'adin_punches.jpg': True,
    
    'charleston_sprite.jpg': True,
    'charleston_punches.jpg': True,
    
    'walid_sprite.jpg': True,
    'walid_punches.jpg': True,
    
    'abrown_sprite.jpg': False,
    'abrown_punches.jpg': True,
    
    'tank_sprite.jpg': True,
    'tank_punches.jpg': True,
    
    'floyd_sprite.jpg': False,
    'floyd_punches.jpg': True,
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
