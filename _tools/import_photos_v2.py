r"""日付ベースで代表写真を1枚ずつ取り込む（重複排除版・空撮中心）。

target:
  assets/img/progress/<YYYY-MM-DD>/main.jpg, thumb.jpg
  assets/img/weekly/<YYYY-MM-DD>.jpg (週次カード用代表写真)
"""
from pathlib import Path
from PIL import Image, ImageOps

SRC_AERIAL = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
                  r"\01_発注者関係\05_PHOTO（写真）\02.空撮写真")
SRC_GROUND = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
                  r"\01_発注者関係\05_PHOTO（写真）\01.地上写真")
DST = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img")
PROG = DST / "progress"
WEEK = DST / "weekly"
HERO = DST / "hero"

for d in (PROG, WEEK, HERO):
    d.mkdir(parents=True, exist_ok=True)


def resize(src: Path, dst: Path, max_w: int = 1600, quality: int = 84):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        if im.width > max_w:
            new_h = int(im.height * max_w / im.width)
            im = im.resize((max_w, new_h), Image.LANCZOS)
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  -> {dst.relative_to(DST)}  {im.size}")


def thumb(src: Path, dst: Path, size=(800, 600), quality: int = 78):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im = ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.5))
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


def pick_first(folder: Path, glob: str = "DJI_*.JPG"):
    files = sorted(folder.glob(glob))
    return files[0] if files else None


def pick_first_any(folder: Path):
    for ext in ("*.JPG", "*.jpg", "*.jpeg", "*.png", "*.PNG"):
        files = sorted(folder.glob(ext))
        if files:
            return files[0]
    return None


def find_folder_by_date(parent: Path, year: int, month: int, day: int,
                        keyword: str | None = None):
    """フォルダ名先頭の日付に一致するもの探す。
    キーワードあれば名前部分一致でさらに絞る。"""
    patterns = (
        f"{year}.{month:02d}.{day:02d}",
        f"{year}.{month}.{day}",
        f"{year}.{month:02d}.{day}",
        f"{year}.{month}.{day:02d}",
    )
    candidates = []
    for entry in parent.iterdir():
        if not entry.is_dir():
            continue
        for pat in patterns:
            if entry.name.startswith(pat):
                candidates.append(entry)
                break
    if keyword:
        kw_hit = [c for c in candidates if keyword in c.name]
        if kw_hit:
            return kw_hit[0]
    return candidates[0] if candidates else None


# ============ HERO ============
hero_targets = [
    ("2026.03.02_着工前写真",        "hero_01_pre.jpg"),
    ("2026.04.20_伐採状況",          "hero_02_cut.jpg"),
    ("2026.04.24_看板設置完了",      "hero_03_signboard.jpg"),
    ("2026.04.28_4月履行報告用空撮",  "hero_04_apr.jpg"),
]
print("[HERO]")
for sub, out in hero_targets:
    src = pick_first(SRC_AERIAL / sub)
    if src:
        resize(src, HERO / out, max_w=1600, quality=85)


# ============ Progress (日付別 代表1枚) ============
# 空撮ベース・各日付1枚のみ
progress_aerial = [
    ("2026-03-02", "2026.03.02_着工前写真",         "着工前 工区全景"),
    ("2026-03-31", "2026.03.31_根株調査",           "根株調査"),
    ("2026-04-03", "2026.04.03_3月履行報告用空撮",   "3月履行報告 空撮"),
    ("2026-04-20", "2026.04.20_伐採状況",           "伐採状況"),
    ("2026-04-24", "2026.04.24_看板設置完了",       "工事看板設置完了"),
    ("2026-04-28", "2026.04.28_4月履行報告用空撮",   "4月履行報告 空撮"),
]

print("\n[PROGRESS aerial]")
for date_str, folder_name, caption in progress_aerial:
    src = pick_first(SRC_AERIAL / folder_name)
    if not src:
        print(f"  MISS: {folder_name}")
        continue
    out_dir = PROG / date_str
    out_dir.mkdir(parents=True, exist_ok=True)
    main = out_dir / "main.jpg"
    th = out_dir / "thumb.jpg"
    resize(src, main, max_w=1600, quality=82)
    thumb(main, th, size=(800, 600), quality=78)


# ============ Weekly (週次カード用) ============
# 各週の代表写真。日付プレフィックス＋キーワードでフォルダ探索。
weekly_picks = [
    ("2026-03-16", "ground", (2026, 3, 16), "事務所"),
    ("2026-03-23", "ground", (2026, 3, 23), "現地"),
    ("2026-04-01", "ground", (2026, 4, 1),  "除根"),
    ("2026-04-08", "ground", (2026, 4, 8),  "伐採"),
    ("2026-04-17", "ground", (2026, 4, 17), "トイレ"),
    ("2026-04-21", "ground", (2026, 4, 21), "土質"),
    ("2026-04-27", "ground", (2026, 4, 27), "伐採木"),
    ("2026-05-01", "ground", (2026, 5, 1),  "伐採木"),
    ("2026-05-07", "ground", (2026, 5, 7),  "積み込み"),
    ("2026-05-12", "ground", (2026, 5, 12), "引き渡し"),
]

print("\n[WEEKLY ground]")
for date_str, src_kind, (y, m, d), keyword in weekly_picks:
    parent = SRC_GROUND if src_kind == "ground" else SRC_AERIAL
    folder = find_folder_by_date(parent, y, m, d, keyword)
    if not folder:
        print(f"  MISS folder: {y}/{m}/{d} ({keyword})")
        continue
    src = pick_first_any(folder)
    if not src:
        print(f"  MISS file in: {folder}")
        continue
    out = WEEK / f"{date_str}.jpg"
    resize(src, out, max_w=1200, quality=80)
    print(f"     from: {folder.name}")

print("\nDONE.")
