from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path
import numpy as np, shutil, datetime

root = Path('/Users/elfguy/alba/cosmetic-commerce')
rep = root / 'public/coupang/images/whitening-cream/versions/v1/representative'
rejected = root / 'public/coupang/images/whitening-cream/versions/v1/rejected'
rejected.mkdir(parents=True, exist_ok=True)
ts = datetime.datetime.now().strftime('%Y%m%dT%H%M%SZ')
cur = rep / '01.png'
if cur.exists():
    shutil.copy2(cur, rejected / f'01-before-drive-original-ratio-preserve-{ts}.png')

base_path = root / 'public/drive-originals/whitening-tone-care-cream/downloaded/톤케어크림.png'
badge_src_path = root / 'public/coupang/images/aqua-lotion/versions/v4/representative/01.png'

# Product base: use Google Drive original pixels at 1000x1000. No resize, no warp.
canvas = Image.open(base_path).convert('RGBA')

# Source badge: exact approved aqua-lotion v4 badge style/pixels, extracted without copying white bg rectangle.
src = Image.open(badge_src_path).convert('RGBA')
crop_box = (30, 30, 415, 405)
badge = src.crop(crop_box).convert('RGBA')
arr = np.array(badge)
r = arr[:, :, 0].astype(float)
g = arr[:, :, 1].astype(float)
b = arr[:, :, 2].astype(float)
mx = np.maximum.reduce([r, g, b])
mn = np.minimum.reduce([r, g, b])
sat = np.where(mx == 0, 0, (mx - mn) / mx)
cond_sat = sat > 0.16
cond_not_white = mx < 252
cond_green = np.logical_and(g > r + 8, g > b * 0.70)
cond_blue = np.logical_and(b > r + 8, g > r + 8)
mask = np.logical_and(np.logical_and(cond_sat, cond_not_white), np.logical_or(cond_green, cond_blue))
alpha = Image.fromarray((mask * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(0.45))
badge.putalpha(alpha)
bbox = badge.getbbox()
if not bbox:
    raise RuntimeError('badge extraction failed')
badge = badge.crop(bbox)

# Target badge size: small enough not to cover the jar top; still same visual identity.
scale = 260 / badge.width
badge = badge.resize((round(badge.width * scale), round(badge.height * scale)), Image.Resampling.LANCZOS)
pos = (42, 28)
canvas.alpha_composite(badge, pos)
canvas.convert('RGB').save(cur, quality=95)

# Save source original for attachment/direct link proof.
source_copy = rep / '01-drive-original-source.png'
Image.open(base_path).convert('RGB').save(source_copy, quality=95)

# Save badge crop source for QA.
Image.open(badge_src_path).convert('RGB').crop(crop_box).save(rep / '01-aqua-badge-source-crop.png', quality=95)

# QA sheet: original vs final vs badge source.
imgs = []
for p, label in [
    (base_path, 'DRIVE ORIGINAL (ratio source)'),
    (cur, 'FINAL 01'),
    (badge_src_path, 'AQUA V4 BADGE SOURCE'),
]:
    im = Image.open(p).convert('RGB')
    im.thumbnail((360, 360), Image.Resampling.LANCZOS)
    pane = Image.new('RGB', (380, 410), 'white')
    pane.paste(im, ((380 - im.width) // 2, 30 + (360 - im.height) // 2))
    d = ImageDraw.Draw(pane)
    d.text((12, 10), label, fill=(20, 20, 20))
    imgs.append(pane)
qa = Image.new('RGB', (380 * len(imgs), 410), 'white')
for i, im in enumerate(imgs):
    qa.paste(im, (i * 380, 0))
qa.save(rep / '01-drive-original-ratio-qa.png', quality=95)

# Contact sheet 01-05.
thumbs = []
for i in range(1, 6):
    p = rep / f'{i:02d}.png'
    im = Image.open(p).convert('RGB')
    im.thumbnail((360, 360), Image.Resampling.LANCZOS)
    pane = Image.new('RGB', (360, 410), 'white')
    pane.paste(im, ((360 - im.width) // 2, 30 + (360 - im.height) // 2))
    ImageDraw.Draw(pane).text((12, 10), p.name, fill=(20, 20, 20))
    thumbs.append(pane)
sheet = Image.new('RGB', (360 * len(thumbs), 410), 'white')
for i, im in enumerate(thumbs):
    sheet.paste(im, (360 * i, 0))
sheet.save(rep / 'contact-01-05.png', quality=95)

print('final', cur, Image.open(cur).size, cur.stat().st_size)
print('source', source_copy, source_copy.stat().st_size)
print('qa', rep / '01-drive-original-ratio-qa.png')
print('contact', rep / 'contact-01-05.png')
print('backup', rejected / f'01-before-drive-original-ratio-preserve-{ts}.png')
