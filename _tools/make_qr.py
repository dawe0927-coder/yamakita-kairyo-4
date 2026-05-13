r"""公開URLのQRコードPNGを生成して Z:\09_公開HP\_release\ に出力。"""
from pathlib import Path
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

URL = "https://dawe0927-coder.github.io/yamakita-kairyo-4/"
OUT_DIR = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
               r"\09_公開HP\_release")
OUT_DIR.mkdir(parents=True, exist_ok=True)

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=14,
    border=4,
)
qr.add_data(URL)
qr.make(fit=True)

img_plain = qr.make_image(fill_color="#0B1733", back_color="#FFFFFF")
out_plain = OUT_DIR / "qr_plain.png"
img_plain.save(out_plain)
print(f"  -> {out_plain.name}  {out_plain.stat().st_size//1024}KB")

img_styled = qr.make_image(
    image_factory=StyledPilImage,
    module_drawer=RoundedModuleDrawer(),
    color_mask=SolidFillColorMask(front_color=(11, 23, 51), back_color=(255, 255, 255)),
)
out_styled = OUT_DIR / "qr_styled.png"
img_styled.save(out_styled)
print(f"  -> {out_styled.name}  {out_styled.stat().st_size//1024}KB")

print(f"\nURL  : {URL}")
print(f"OUT  : {OUT_DIR}")
