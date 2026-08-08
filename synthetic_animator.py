import os
from PIL import Image

def build_synthetic_master(prefix, is_p2=False):
    asset_dir = r"C:\Users\admin-beats\Documents\antigravity\lucid-fermi\assets"
    
    idle_path = os.path.join(asset_dir, f"{prefix}_sprite.jpg")
    punches_path = os.path.join(asset_dir, f"{prefix}_punches.jpg")
    
    idle_img = Image.open(idle_path).convert('RGB')
    idle_img = idle_img.resize((256, 256), Image.Resampling.LANCZOS)
    
    punches_img = Image.open(punches_path).convert('RGB')
    p_w, p_h = punches_img.size
    qw, qh = p_w // 2, p_h // 2
    
    jab_img = punches_img.crop((0, 0, qw, qh)).resize((256, 256), Image.Resampling.LANCZOS)
    straight_img = punches_img.crop((qw, 0, p_w, qh)).resize((256, 256), Image.Resampling.LANCZOS)
    hook_img = punches_img.crop((0, qh, qw, p_h)).resize((256, 256), Image.Resampling.LANCZOS)
    upper_img = punches_img.crop((qw, qh, p_w, p_h)).resize((256, 256), Image.Resampling.LANCZOS)
    
    bg_color = (0, 0, 0)
    
    # Invert physics for P2 because the HTML canvas flips the sprite horizontally.
    # What is CCW (lean back) for P1 must be CW (lean forward) for P2 before flipping,
    # so that after flipping it becomes a lean back!
    m = -1 if is_p2 else 1
    
    def generate_animation_strip(base_frame, action):
        frames = []
        if action == "idle":
            f1 = base_frame.copy()
            f2 = Image.new('RGB', (256, 256), bg_color)
            f2.paste(base_frame, (0, 6))
            f3 = Image.new('RGB', (256, 256), bg_color)
            f3.paste(base_frame, (0, 12))
            f4 = Image.new('RGB', (256, 256), bg_color)
            f4.paste(base_frame, (0, 6))
            frames = [f1, f2, f3, f4]
            
        elif action == "punch":
            # Windup (lean back)
            f1 = idle_img.rotate(5 * m, fillcolor=bg_color, center=(128, 200))
            # Half-extend (pull back arm)
            f2 = Image.new('RGB', (256, 256), bg_color)
            f2.paste(base_frame, (-10 * m, 0))
            # Full extension
            f3 = base_frame.copy()
            # Retract (lean slightly forward)
            f4 = idle_img.rotate(-2 * m, fillcolor=bg_color, center=(128, 200))
            frames = [f1, f2, f3, f4]
            
        elif action == "dodge":
            # Dodge (lean back)
            f1 = idle_img.copy()
            f2 = idle_img.rotate(10 * m, fillcolor=bg_color, center=(128, 200))
            f3 = idle_img.rotate(20 * m, fillcolor=bg_color, center=(128, 200))
            f4 = idle_img.rotate(10 * m, fillcolor=bg_color, center=(128, 200))
            frames = [f1, f2, f3, f4]
            
        elif action == "block":
            f1 = idle_img.copy()
            f2 = idle_img.copy()
            frames = [f1, f2, f1, f2]
            
        return frames

    master_img = Image.new('RGB', (256 * 4, 256 * 6))
    
    strips = [
        generate_animation_strip(idle_img, "idle"),
        generate_animation_strip(jab_img, "punch"),
        generate_animation_strip(straight_img, "punch"),
        generate_animation_strip(hook_img, "punch"),
        generate_animation_strip(idle_img, "dodge"),
        generate_animation_strip(idle_img, "block")
    ]
    
    for row_idx, strip in enumerate(strips):
        for col_idx, frame in enumerate(strip):
            master_img.paste(frame, (col_idx * 256, row_idx * 256))
            
    out_path = os.path.join(asset_dir, f"{prefix}_master.jpg")
    master_img.save(out_path, quality=100)
    print(f"Synthesized master grid: {out_path}")

if __name__ == "__main__":
    build_synthetic_master("broner", is_p2=False)
    build_synthetic_master("deen", is_p2=True)
