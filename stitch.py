import os
from PIL import Image

def stitch_sprites(prefix, output_filename):
    brain_dir = r"C:\Users\admin-beats\.gemini\antigravity\brain\11b98ff1-61dc-43d0-a0f4-da17ab16d5df"
    
    def get_file(action):
        for f in os.listdir(brain_dir):
            if f.startswith(f"{prefix}_{action}_") and f.endswith(".jpg"):
                return os.path.join(brain_dir, f)
        raise FileNotFoundError(f"Could not find {prefix}_{action}")

    actions = ["idle", "jab", "straight", "hook", "dodge", "block"]
    images = []
    
    for action in actions:
        path = get_file(action)
        img = Image.open(path)
        images.append(img)
        
    w, h = images[0].size
    master = Image.new('RGB', (w, h * 6))
    
    for i, img in enumerate(images):
        if img.size != (w, h):
            img = img.resize((w, h), Image.Resampling.LANCZOS)
        master.paste(img, (0, i * h))
        
    out_path = os.path.join(r"C:\Users\admin-beats\Documents\antigravity\lucid-fermi\assets", output_filename)
    master.save(out_path, quality=95)
    print(f"Saved {out_path}")

if __name__ == "__main__":
    stitch_sprites("broner", "broner_master.jpg")
    stitch_sprites("deen", "deen_master.jpg")
