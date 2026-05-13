r"""デジタルサイネージ素材をHP用にリサイズ取り込み。

source: Z:\1250040_山北改良\04_安全関係\31_デジタルサイネージ\
        - 工事のお知らせ（山北第4改良工事） サイネージ用_1_4.jpg
        - 工事のお知らせ（山北第4改良工事） サイネージ用_3.jpg
        - Gemini_Generated_Image_*.png/.jpg
target: assets/img/signage/, assets/img/image/
"""
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
           r"\04_安全関係\31_デジタルサイネージ")
DST_SIGN = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img\signage")
DST_IMAGE = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site\assets\img\image")

DST_SIGN.mkdir(parents=True, exist_ok=True)
DST_IMAGE.mkdir(parents=True, exist_ok=True)


def shrink(src: Path, dst: Path, max_w: int = 1400, quality: int = 82):
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


def thumb(src: Path, dst: Path, max_w: int = 800, quality: int = 78):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        if w > max_w:
            new_h = int(h * max_w / w)
            im = im.resize((max_w, new_h), Image.LANCZOS)
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  -> thumb/{dst.name}  {dst.stat().st_size//1024}KB")


def main():
    sign_files = [
        ("工事のお知らせ（山北第4改良工事） サイネージ用_1_4.jpg", "oshirase_main.jpg"),
        ("工事のお知らせ（山北第4改良工事） サイネージ用_3.jpg",   "oshirase_alt.jpg"),
    ]
    for src_name, dst_name in sign_files:
        src = SRC / src_name
        if src.exists():
            print(f"[signage] {src_name}")
            shrink(src, DST_SIGN / dst_name, max_w=1400, quality=85)
        else:
            print(f"  MISSING: {src}")

    gem_imgs = sorted(SRC.glob("Gemini_Generated_Image_*"))
    for i, src in enumerate(gem_imgs, start=1):
        out = DST_IMAGE / f"vision_{i:02d}.jpg"
        out_thumb = DST_IMAGE / f"_thumb_vision_{i:02d}.jpg"
        print(f"[image vision {i}] {src.name}")
        shrink(src, out, max_w=1600, quality=85)
        thumb(out, out_thumb, max_w=600, quality=78)

    print("\nDONE.")


if __name__ == "__main__":
    main()
