from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import shutil, datetime

root = Path('/Users/elfguy/alba/cosmetic-commerce')
img_path = root / 'public/coupang/images/aqua-lotion/versions/v4/detail/11.png'
rejected = root / 'public/coupang/images/aqua-lotion/versions/v4/rejected'
rejected.mkdir(parents=True, exist_ok=True)
ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
backup = rejected / f'11-before-local-typo-fix-nulleoseo-{ts}.png'
shutil.copy2(img_path, backup)

im = Image.open(img_path).convert('RGBA')
d = ImageDraw.Draw(im)

font_path = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
font_small = ImageFont.truetype(font_path, 15)
font_step = ImageFont.truetype(font_path, 12)
fill = (30, 34, 38, 255)
white = (255, 255, 255, 255)

# Patch OPEN card body text: replace the incorrect "놀러서/놀려서 사용하세요" area.
# Keep the card title and surrounding image untouched.
d.rounded_rectangle((247, 854, 397, 904), radius=6, fill=white)
d.text((251, 858), 'OPEN 방향으로 돌린 후', font=font_small, fill=fill)
d.text((277, 880), '눌러서 사용하세요.', font=font_small, fill=fill)

# Patch bottom mini step 3 text.
d.rounded_rectangle((305, 1230, 413, 1280), radius=5, fill=white)
d.text((318, 1235), '3. 눌러서', font=font_step, fill=fill)
d.text((329, 1253), '사용하세요.', font=font_step, fill=fill)

im.convert('RGB').save(img_path, 'PNG', optimize=True)
print({'fixed': str(img_path), 'backup': str(backup)})
