from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import shutil, datetime

root = Path('/Users/elfguy/alba/cosmetic-commerce')
img_path = root / 'public/coupang/images/aqua-lotion/versions/v4/detail/11.png'
# Start from the GPT Images output before the too-obvious local patch.
source = root / 'public/coupang/images/aqua-lotion/versions/v4/rejected/11-before-local-typo-fix-nulleoseo-20260604122435.png'
rejected = root / 'public/coupang/images/aqua-lotion/versions/v4/rejected'
rejected.mkdir(parents=True, exist_ok=True)
ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
backup = rejected / f'11-before-subtle-typo-fix-{ts}.png'
shutil.copy2(img_path, backup)

im = Image.open(source).convert('RGBA')
d = ImageDraw.Draw(im)
font_path = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
font_card = ImageFont.truetype(font_path, 16)
font_step = ImageFont.truetype(font_path, 15)
fill = (44, 44, 44, 255)
# sampled card/background whites from the GPT image, not pure white
card_bg = (251, 252, 253, 255)
step_bg = (248, 252, 253, 255)


def center_text(text, y, font, x1, x2):
    bbox = d.textbbox((0, 0), text, font=font)
    x = x1 + (x2 - x1 - (bbox[2] - bbox[0])) // 2
    d.text((x, y), text, font=font, fill=fill)


# OPEN card: cover the two body lines plus residual underline/ghost text, preserve title and image.
d.rectangle((245, 846, 405, 916), fill=card_bg)
center_text('OPEN 방향으로 돌린 후', 856, font_card, 228, 416)
center_text('눌러서 사용하세요', 881, font_card, 228, 416)

# Bottom mini-step 3 caption area only. Match the size of the neighboring 1/2 captions.
d.rectangle((292, 1224, 422, 1298), fill=step_bg)
center_text('3. 눌러서', 1235, font_step, 288, 423)
center_text('사용하세요.', 1259, font_step, 288, 423)

im.convert('RGB').save(img_path, 'PNG', optimize=True)
print({'fixed': str(img_path), 'source': str(source), 'backup_current_bad_patch': str(backup)})
