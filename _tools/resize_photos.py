r"""空撮写真をHP用にリサイズ配置。

source:  Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良\
         01_発注者関係\05_PHOTO（写真）\02.空撮写真\2026.04.28_4月履行報告用空撮\
target:  C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img\
"""
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
           r"\01_発注者関係\05_PHOTO（写真）\02.空撮写真\2026.04.28_4月履行報告用空撮")
DST = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img")

HERO = DST / "hero" / "aerial.jpg"
PROG = DST / "progress" / "2026-04"
THUMB = PROG / "_thumb"

PROG.mkdir(parents=True, exist_ok=True)
THUMB.mkdir(parents=True, exist_ok=True)
HERO.parent.mkdir(parents=True, exist_ok=True)


def resize(src: Path, dst: Path, max_w: int, quality: int = 82):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        if w > max_w:
            new_h = int(h * max_w / w)
            im = im.resize((max_w, new_h), Image.LANCZOS)
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  -> {dst.name}  {im.size}  {dst.stat().st_size//1024}KB")


def make_thumb(src: Path, dst: Path, size=(800, 600), quality: int = 80):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im = ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.5))
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  -> thumb/{dst.name}  {dst.stat().st_size//1024}KB")


def main():
    sources = sorted([p for p in SRC.glob("DJI_*.JPG")])
    if not sources:
        raise SystemExit(f"No source photos found: {SRC}")

    print(f"[hero] {sources[0].name}")
    resize(sources[0], HERO, max_w=1600, quality=85)

    pick = sources[:4]
    for i, src in enumerate(pick, start=1):
        out = PROG / f"aerial_{i:02d}.jpg"
        thumb = THUMB / f"aerial_{i:02d}.jpg"
        print(f"[progress {i}] {src.name}")
        resize(src, out, max_w=1600, quality=82)
        make_thumb(out, thumb, size=(800, 600), quality=78)

    print("\nDONE.")


if __name__ == "__main__":
    main()
