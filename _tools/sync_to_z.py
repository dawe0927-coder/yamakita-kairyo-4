r"""C:\Users\N2508-1\ClaudeCode\yamakita-site\ を
Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良\09_公開HP\_source\ にミラー同期。

除外: .git/, .vscode/, .claude/, node_modules/, _tools/, desktop.ini
"""
from pathlib import Path
import shutil

SRC = Path(r"C:\Users\N2508-1\ClaudeCode\yamakita-site")
DST = Path(r"Z:\鴻治組ストレージ\02_土木部門\02_施工中工事\1250040_山北改良"
           r"\09_公開HP\_source")

EXCLUDE_DIRS = {".git", ".vscode", ".claude", "node_modules", "_tools", "__pycache__"}
EXCLUDE_FILES = {"desktop.ini", ".DS_Store", "Thumbs.db"}


def should_skip(path: Path, relative_root: Path) -> bool:
    rel_parts = path.relative_to(relative_root).parts
    return any(part in EXCLUDE_DIRS for part in rel_parts)


def sync():
    if not SRC.exists():
        raise SystemExit(f"Source not found: {SRC}")
    DST.mkdir(parents=True, exist_ok=True)

    copied, deleted = 0, 0
    src_files: set[Path] = set()

    for path in SRC.rglob("*"):
        if should_skip(path, SRC):
            continue
        if path.is_file():
            if path.name in EXCLUDE_FILES:
                continue
            rel = path.relative_to(SRC)
            dst_path = DST / rel
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            if (not dst_path.exists()
                    or dst_path.stat().st_size != path.stat().st_size
                    or int(dst_path.stat().st_mtime) != int(path.stat().st_mtime)):
                shutil.copy2(path, dst_path)
                copied += 1
            src_files.add(rel)

    for path in DST.rglob("*"):
        if path.is_file():
            if path.name in EXCLUDE_FILES:
                continue
            rel = path.relative_to(DST)
            if rel not in src_files:
                try:
                    path.unlink()
                    deleted += 1
                except OSError as e:
                    print(f"  ! cannot delete: {path} ({e})")

    for path in sorted(DST.rglob("*"), key=lambda p: -len(p.parts)):
        if path.is_dir():
            try:
                next(path.iterdir())
            except StopIteration:
                try:
                    path.rmdir()
                except OSError:
                    pass
            except Exception:
                pass

    print(f"sync done. copied={copied}  deleted={deleted}")


if __name__ == "__main__":
    sync()
