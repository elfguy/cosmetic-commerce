from PIL import Image
from pathlib import Path
root = Path('/Users/elfguy/alba/cosmetic-commerce')
out = root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/reference'
out.mkdir(parents=True, exist_ok=True)
# User screenshots
neg = Image.open('/Users/elfguy/.hermes/image_cache/img_8a7f5d421d55.jpeg').convert('RGB')
pos = Image.open('/Users/elfguy/.hermes/image_cache/img_97da8c06fa73.jpeg').convert('RGB')
# Crop browser chrome and mobile nav bars; keep ecommerce content only.
# Negative STOP reference: content from y~270 to before bottom nav y~2355.
neg_crop = neg.crop((0, 270, neg.width, 2355))
neg_crop.save(out/'cut11-user-01-negative-stop-reference-cropped.png')
# Positive V3 08 reference: remove top browser/black bars and bottom nav, keep main content.
pos_crop = pos.crop((0, 420, pos.width, 2260))
pos_crop.save(out/'cut11-user-02-positive-v3-08-photo-reference-cropped.png')
# Tone board: current V7 contact if exists, plus adjacent 10 and current 11
for src_name, dst_name in [
    ('tmp-v7-01-10-contact-no-labels-v2.png','cut11-user-03-v7-tone-board.png'),
]:
    src = root/src_name
    if src.exists(): Image.open(src).convert('RGB').save(out/dst_name)
# adjacent approved cut 10
p10 = root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/10.png'
if p10.exists(): Image.open(p10).convert('RGB').save(out/'cut11-user-04-adjacent-cut10-tone.png')
# current 11 compare only
p11 = root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/11.png'
if p11.exists(): Image.open(p11).convert('RGB').save(out/'cut11-user-05-current-11-compare-only.png')
for p in sorted(out.glob('cut11-user-*')):
    im=Image.open(p)
    print(p, im.size)
