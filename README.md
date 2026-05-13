# 令和7年度 福山道路 山北第4改良工事 — 現場専用HP

近隣の皆様向けに工事内容・進捗・お知らせをお伝えするための静的Webサイトです。

## 公開URL

- GitHub Pages: `https://<田中GitHubユーザー名>.github.io/yamakita-kairyo-4/` （初回push後に確定）

## 構成

```
yamakita-site/
├ index.html        トップページ（1ページ縦スクロール）
├ 404.html
├ assets/
│  ├ css/style.css  デザイン（Navy #1B2A4A / Orange #E87C3E）
│  ├ js/main.js     JSONを読み込んでDOMを生成
│  └ img/           写真・ロゴ・favicon
├ data/             ← ★ 更新はここのJSONを書き換えるだけ
│  ├ project.json   工事概要・連絡先
│  ├ progress.json  全体進捗率
│  ├ photos.json    月次写真ギャラリー
│  └ news.json      お知らせ一覧
└ docs/             住民配布PDF
```

## 更新方法（田中の運用）

VSCode/エディタを触らず、Claudeに依頼するだけでOK。

| やりたいこと | Claudeへの一言 |
| --- | --- |
| 今月の進捗写真を追加 | 「HPを更新して」→ 写真選定の対話に進みます |
| お知らせを追加（夜間作業・通行規制等） | 「HPにお知らせを追加して」 |
| 全体進捗率を更新 | 「HPの進捗率を○○%にして」 |
| 連絡先電話番号を変更 | 「HPの問い合わせ先電話番号を変えて」 |

Claudeが裏で行うこと:
1. `data/*.json` を編集
2. ローカルブラウザ確認案内（http://localhost:8000/）
3. `git add` → `git commit` → `git push`
4. Z:\1250040_山北改良\09_公開HP\_source\ へ robocopy ミラー

## ローカルで開く

```powershell
cd C:\Users\N2508-1\ClaudeCode\yamakita-site
python -m http.server 8000
# ブラウザで http://localhost:8000/ を開く
```

## デザインルール

- 色: Navy #1B2A4A（見出し・帯）／ Orange #E87C3E（アクセント）／ 背景 #FAFAF7
- フォント: Meiryo UI 系（Webフォント不使用＝オフラインでも崩れない）
- 本文 18px / line-height 1.8（高齢住民配慮）
- スマホファースト・全画像 alt 必須

## 公開可否ルール

`project_instagram_strategy.md` を準拠:
- 下請業者名・個人情報・契約金額は載せない
- 人物・車番・名札・近隣表札はぼかし
- 公表済み情報（発注者名・工期・工事内容）は掲載可

## 連絡先

- 現場代理人: 田中 大（株式会社鴻治組）
- 監理技術者: 上原 翔
