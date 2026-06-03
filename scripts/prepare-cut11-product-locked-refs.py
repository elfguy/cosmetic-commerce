from PIL import Image, ImageOps
from pathlib import Path
root=Path('/Users/elfguy/alba/cosmetic-commerce')
out=root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/reference'
out.mkdir(parents=True, exist_ok=True)
# Main product source: original representative 01 has exact label and pump.
src=Image.open(root/'public/coupang/images/aqua-lotion/versions/original/representative/01.png').convert('RGB')
# Crop out side badges and keep only bottle/pump. Coordinates based on 1000x1000 original.
prod=src.crop((310,70,660,925))
# Put on clean white canvas with margin so GPT sees full bottle shape.
canvas=Image.new('RGB',(520,980),'white')
prod.thumbnail((430,900), Image.LANCZOS)
canvas.paste(prod,((520-prod.width)//2,(980-prod.height)//2))
canvas.save(out/'cut11-product-lock-01-exact-yourskin-aqua-lotion.png')
# Also save the full original product hero as identity ref.
src.save(out/'cut11-product-lock-02-full-product-identity.png')
# Current candidate and tone/pump refs.
for srcp, dst in [
    (root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/detail/11.png', 'cut11-product-lock-03-current-layout-candidate.png'),
    (root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/reference/cut11-user-02-positive-v3-08-photo-reference-cropped.png', 'cut11-product-lock-04-positive-pump-photo-ref.png'),
    (root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/reference/cut11-user-01-negative-stop-reference-cropped.png', 'cut11-product-lock-05-negative-stop-ref.png'),
    (root/'public/coupang/images/aqua-lotion/versions/v7-sequential-780/reference/cut11-user-03-v7-tone-board.png', 'cut11-product-lock-06-v7-tone-board.png'),
]:
    if srcp.exists(): Image.open(srcp).convert('RGB').save(out/dst)
for p in sorted(out.glob('cut11-product-lock-*')):
    im=Image.open(p); print(p, im.size)
