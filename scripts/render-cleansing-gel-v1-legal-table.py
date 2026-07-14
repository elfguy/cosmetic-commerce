from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse

ROOT = Path('/Users/elfguy/alba/cosmetic-commerce')
DEFAULT_SOURCE = ROOT / 'public/coupang/images/cleansing-gel/versions/v1/detail/13.png'
FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

INGREDIENTS = (
    '정제수, 라우릴글루코사이드, 글리세린, 다이소듐코코암포다이아세테이트, '
    '소듐라우로일글루타메이트, 소듐클로라이드, 코코-글루코사이드, '
    '아크릴레이트/C10-30알킬아크릴레이트크로스폴리머, 다이프로필렌글라이콜, '
    '하이드록시아세토페논, 카프릴릴글라이콜, 알란토인, 시트릭애씨드, 부틸렌글라이콜, '
    '헥실렌글라이콜, 다이소듐이디티에이, 1,2-헥산다이올, 다이포타슘글리시리제이트, '
    '밀싹추출물, 브로콜리추출물, 양배추추출물, 자주개자리추출물, 무씨추출물, 유채추출물, '
    '소듐하이알루로네이트, 하이드록시프로필트라이모늄하이알루로네이트, '
    '소듐아세틸레이티드하이알루로네이트, 하이드롤라이즈드하이알루로닉애씨드, '
    '하이알루로닉애씨드, 소듐하이알루로네이트크로스폴리머, '
    '하이드롤라이즈드소듐하이알루로네이트, 포타슘하이알루로네이트'
)


def wrap_ingredients(draw, text, font, max_width):
    # Keep each comma attached to the preceding ingredient so a wrapped line never starts with punctuation.
    parts = text.split(', ')
    tokens = [part + (',' if i < len(parts) - 1 else '') for i, part in enumerate(parts)]
    lines = []
    current = ''
    for token in tokens:
        candidate = token if not current else current + ' ' + token
        if not current or draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = token
    if current:
        lines.append(current)
    return lines


def render(source, output):
    image = Image.open(source).convert('RGB')
    if image.size != (780, 1360):
        raise ValueError(f'Expected 780x1360 source, got {image.size}')
    draw = ImageDraw.Draw(image)

    # Current V1 legal-table ingredient value cell. Preserve all grid lines and the left legal label.
    x0, y0, x1, y1 = 198, 577, 746, 966
    background = image.getpixel((720, 600))
    draw.rectangle((x0, y0, x1, y1), fill=background)

    text_color = (34, 34, 34)
    for size, line_height in [(21, 30), (20, 29), (19, 28), (18, 27), (17, 26)]:
        font = ImageFont.truetype(FONT_PATH, size=size, index=0)
        lines = wrap_ingredients(draw, INGREDIENTS, font, x1 - x0 - 20)
        if len(lines) * line_height <= y1 - y0 - 18:
            break
    y = y0 + 9
    for line in lines:
        draw.text((x0 + 9, y), line, font=font, fill=text_color)
        y += line_height

    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, 'PNG')
    return output, lines, size, line_height, y


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default=str(DEFAULT_SOURCE))
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    out, lines, size, line_height, end_y = render(Path(args.source), Path(args.output))
    print(out)
    print('font_size', size, 'line_height', line_height, 'lines', len(lines), 'end_y', end_y)
    print('contains_arg', '알지닌' in INGREDIENTS)
    print('contains_citric_acid', '시트릭애씨드' in INGREDIENTS)
