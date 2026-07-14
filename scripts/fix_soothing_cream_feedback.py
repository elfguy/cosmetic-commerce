from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import shutil

ROOT = Path(__file__).resolve().parents[1]
DETAIL = ROOT / 'public/coupang/images/soothing-cream/versions/v1/detail'
BACKUP = DETAIL / 'backup-before-review-feedback-20260623'
BACKUP.mkdir(exist_ok=True)

FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

def load_font(size, index=0):
    return ImageFont.truetype(FONT_PATH, size=size, index=index)

def text_width(draw, text, font):
    if not text:
        return 0
    return draw.textbbox((0, 0), text, font=font)[2]

def wrap_korean(draw, text, font, max_width):
    # token-aware wrap, then char fallback for very long Korean ingredient names.
    tokens = []
    for part in text.split(', '):
        token = part + ', '
        tokens.append(token)
    if tokens:
        tokens[-1] = tokens[-1].rstrip(', ')
    lines = []
    line = ''
    for token in tokens:
        cand = line + token
        if text_width(draw, cand, font) <= max_width:
            line = cand
            continue
        if line:
            lines.append(line.rstrip())
            line = ''
        # token too long? split by chars
        if text_width(draw, token, font) > max_width:
            buf = ''
            for ch in token:
                if text_width(draw, buf + ch, font) <= max_width:
                    buf += ch
                else:
                    lines.append(buf.rstrip())
                    buf = ch
            line = buf
        else:
            line = token
    if line:
        lines.append(line.rstrip())
    return lines

def fix_detail_14(out_path=None):
    p = DETAIL / '14.png'
    backup_file = BACKUP / '14-before-feedback.png'
    if not backup_file.exists():
        shutil.copy2(p, backup_file)
    im = Image.open(backup_file).convert('RGB')
    draw = ImageDraw.Draw(im)
    # Ingredient value-cell area only. Keep table borders and left label intact.
    x0, y0, x1, y1 = 229, 650, 719, 994
    patch = Image.new('RGB', (x1-x0, y1-y0), (249, 250, 248))
    im.paste(patch, (x0, y0))
    fill = (49, 52, 49)
    ingredients = (
        '정제수, 글리세린, 부틸렌글라이콜, 글리세릴글루코사이드, 프로판다이올, 카프릴릭/카프릭트라이글리세라이드, '
        '다이프로필렌글라이콜, 소듐폴리아크릴레이트, 마카다미아씨오일, 글리세릴스테아레이트에스이, '
        '하이드록시아세토페논, 해바라기씨오일, 1,2-헥산다이올, 솔비탄스테아레이트, 카프릴릴글라이콜, '
        '세테아릴알코올, 시어버터, 소듐하이알루로네이트(1,000ppm), 카보머, 로즈힙열매오일, '
        '글루코오스, 토코페롤, 다이포타슘글리시리제이트, 소듐디엔에이(50ppm), '
        '하이드록시프로필트라이모늄하이알루로네이트(50ppm), 소듐아세틸레이티드하이알루로네이트(5ppm), '
        '하이드롤라이즈드하이알루로닉애씨드(5ppm), 하이알루로닉애씨드(1.25ppm), '
        '소듐하이알루로네이트크로스폴리머(0.5ppm), 하이드롤라이즈드소듐하이알루로네이트(0.5ppm), '
        '포타슘하이알루로네이트(0.1ppm)'
    )
    # Fit the longer corrected ingredient list within the existing cell only.
    for size, line_h in [(19, 25), (18, 24), (17, 23), (16, 22), (15, 21)]:
        font = load_font(size, 0)
        lines = wrap_korean(draw, ingredients, font, x1-x0-8)
        if len(lines) * line_h <= (y1-y0-4):
            break
    y = y0 + 2
    for line in lines:
        draw.text((x0, y), line, font=font, fill=fill)
        y += line_h
    out = Path(out_path) if out_path else p
    im.save(out, 'PNG')
    return out, lines, y, size, line_h

def fix_detail_10(out_path=None):
    p = DETAIL / '10.png'
    backup_file = BACKUP / '10-before-feedback.png'
    if not backup_file.exists():
        shutil.copy2(p, backup_file)
    im = Image.open(backup_file).convert('RGB')
    # Work at 3x for smoother patch edges/needle.
    scale = 3
    hi = im.resize((im.width * scale, im.height * scale), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(hi)
    def S(v): return int(round(v * scale))
    # Remove only the green "pH 5.6" capsule. Keep surrounding pH5.0~pH6.5 range text.
    # Fill with the warm off-white gauge/card background so no number remains.
    bg = (244, 249, 239)
    d.rounded_rectangle([S(488), S(640), S(615), S(694)], radius=S(28), fill=bg)
    # Reconnect the gauge needle through the cleaned area so it does not look erased.
    needle = (86, 154, 89)
    d.line([S(558), S(606), S(550), S(692)], fill=needle, width=S(3))
    # Lightly soften the patched capsule edge by blending only the local patch boundary.
    out_im = hi.resize(im.size, Image.Resampling.LANCZOS)
    out = Path(out_path) if out_path else p
    out_im.save(out, 'PNG')
    return out

if __name__ == '__main__':
    out, lines, y, size, line_h = fix_detail_14()
    print('wrote', out)
    print('font_size', size, 'line_h', line_h, 'lines', len(lines), 'last_y', y)
    for line in lines:
        print(line)
    out10 = fix_detail_10()
    print('wrote', out10)
