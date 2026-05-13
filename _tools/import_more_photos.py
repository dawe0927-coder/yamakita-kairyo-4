r"""3月・4月各日付の空撮写真をHP用に取り込む。

- ヒーロースライド候補（hero/ 配下に複数枚）
- 進捗ギャラリー月別アルバム（progress/YYYY-MM/）
"""
from pathlib import Path
from PIL import Image, ImageOps

SRC_ROOT = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
                r"\01_発注者関係\05_PHOTO（写真）\02.空撮写真")
DST = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img")

HERO_DIR = DST / "hero"
PROG_DIR = DST / "progress"

HERO_DIR.mkdir(parents=True, exist_ok=True)
PROG_DIR.mkdir(parents=True, exist_ok=True)


def resize(src: Path, dst: Path, max_w: int, quality: int = 84):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        if w > max_w:
            new_h = int(h * max_w / w)
            im = im.resize((max_w, new_h), Image.LANCZOS)
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  -> {dst.relative_to(DST)}  {im.size}  {dst.stat().st_size//1024}KB")


def make_thumb(src: Path, dst: Path, size=(800, 600), quality: int = 78):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im = ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.5))
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


# ============ HERO slides ============
# 4日付それぞれから「画になる」1枚目を選び、hero/ に複数枚配置
hero_picks = [
    ("2026.03.02_着工前写真",       "DJI_20260302120104_0001_V.JPG", "hero_01_pre.jpg"),
    ("2026.04.20_伐採状況",         "DJI_20260420145509_0001_V.JPG", "hero_02_cut.jpg"),
    ("2026.04.24_看板設置完了",     "DJI_20260424140443_0001_V.JPG", "hero_03_signboard.jpg"),
    ("2026.04.28_4月履行報告用空撮", "DJI_20260428145713_0001_V.JPG", "hero_04_apr.jpg"),
]
print("[HERO]")
for folder, fname, outname in hero_picks:
    src = SRC_ROOT / folder / fname
    if src.exists():
        resize(src, HERO_DIR / outname, max_w=1600, quality=85)


# ============ Progress 月別アルバム ============
# 3月アルバム = 着工前 + 根株調査 計4枚
# 4月アルバム = 伐採 + 看板 + 履行報告空撮 計6枚（既存 aerial_01〜04 と重複させない）
month_picks = {
    "2026-03": [
        ("2026.03.02_着工前写真",  "DJI_20260302120104_0001_V.JPG", "aerial_01.jpg", "着工前 工区全景（3/2）"),
        ("2026.03.02_着工前写真",  "DJI_20260302120216_0004_V.JPG", "aerial_02.jpg", "着工前の現場（3/2）"),
        ("2026.03.31_根株調査",    "DJI_20260331153002_0001_V.JPG", "aerial_03.jpg", "根株調査（3/31）"),
        ("2026.03.31_根株調査",    "DJI_20260331153250_0004_V.JPG", "aerial_04.jpg", "根株調査 別アングル（3/31）"),
    ],
    "2026-04": [
        # 既存の 4/28 空撮4枚はそのまま、aerial_05〜以降に伐採・看板を追加
        ("2026.04.20_伐採状況",     "DJI_20260420145509_0001_V.JPG", "aerial_05.jpg", "伐採状況（4/20）"),
        ("2026.04.20_伐採状況",     "DJI_20260420145918_0008_V.JPG", "aerial_06.jpg", "伐採進捗（4/20）"),
        ("2026.04.24_看板設置完了", "DJI_20260424140443_0001_V.JPG", "aerial_07.jpg", "工事看板設置完了（4/24）"),
        ("2026.04.24_看板設置完了", "DJI_20260424140636_0005_V.JPG", "aerial_08.jpg", "看板周辺の現場状況（4/24）"),
    ],
}

for month, picks in month_picks.items():
    out_dir = PROG_DIR / month
    thumb_dir = out_dir / "_thumb"
    out_dir.mkdir(parents=True, exist_ok=True)
    thumb_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n[PROGRESS {month}]")
    for folder, fname, outname, caption in picks:
        src = SRC_ROOT / folder / fname
        if not src.exists():
            print(f"  MISS: {src}")
            continue
        out_full = out_dir / outname
        out_thumb = thumb_dir / outname
        resize(src, out_full, max_w=1600, quality=82)
        make_thumb(out_full, out_thumb, size=(800, 600), quality=78)

print("\nDONE.")
