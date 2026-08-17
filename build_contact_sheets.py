from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

source_dir = Path('/home/ubuntu/upload')
out_dir = Path('/home/ubuntu/image-review')
out_dir.mkdir(parents=True, exist_ok=True)
files = sorted([p for p in source_dir.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}])
thumb_w, thumb_h = 220, 170
label_h = 34
cols = 5
font = ImageFont.load_default()
for sheet_index in range(0, len(files), 25):
    batch = files[sheet_index:sheet_index + 25]
    rows = (len(batch) + cols - 1) // cols
    canvas = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + label_h)), '#eee9df')
    draw = ImageDraw.Draw(canvas)
    for pos, path in enumerate(batch):
        x = (pos % cols) * thumb_w
        y = (pos // cols) * (thumb_h + label_h)
        try:
            with Image.open(path) as source:
                image = ImageOps.exif_transpose(source).convert('RGB')
                image.thumbnail((thumb_w - 12, thumb_h - 12))
                tile = Image.new('RGB', (thumb_w - 12, thumb_h - 12), '#d5cec2')
                tile.paste(image, ((tile.width - image.width) // 2, (tile.height - image.height) // 2))
                canvas.paste(tile, (x + 6, y + 6))
        except Exception:
            draw.rectangle((x + 6, y + 6, x + thumb_w - 6, y + thumb_h - 6), fill='#b64a32')
        draw.text((x + 7, y + thumb_h + 4), path.name[:31], fill='#222522', font=font)
    canvas.save(out_dir / f'contact-{sheet_index // 25 + 1}.jpg', quality=88)
print(f'Created {((len(files) + 24) // 25)} sheets for {len(files)} images')
