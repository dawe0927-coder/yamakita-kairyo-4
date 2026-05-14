# Codexレビュー依頼 ── 山北第4改良工事 現場専用HP（AIっぽさを抜く）

## 公開状態
- 公開URL: https://dawe0927-coder.github.io/yamakita-kairyo-4/
- リポジトリ: `C:\Users\N2508-1\ClaudeCode\yamakita-site\`
- 公開先: GitHub Pages (`dawe0927-coder/yamakita-kairyo-4`)

## ゴール
**伝統的な中堅ゼネコン（鹿島・大成・清水建設）のコーポレートサイト水準**まで、AI生成丸出しの装飾を引き算する。
近隣住民（高齢者含む）へ工事情報を伝えるのが主目的。サイバーパンク/未来感は不要。
**信頼感・読みやすさ・落ち着きが最優先**。

## ❌ 抜くべき「AIっぽさ」要素（私が自己分析した一次リスト）

これらが現状のHPに散在しています。Codexの判断で**削除／簡素化／日本語化**してください。
過剰検出ではなく、全削除前提でOK。

### 装飾コード臭
- セクション見出しの `// 01` `// 02` などのコード擬装プレフィックス
- 英字エイブロー `YAMAKITA #4 ROAD IMPROVEMENT · FY2025`
- 統計カードの英字ラベル `SECTION LENGTH / EXCAVATION / ICT LEVEL / BIM/CIM LOD`
- 写真タグの英字 `MILESTONE / SURVEY / REPORT / CLEARING`
- バッジ系英字 `LATEST / WEEKLY / SCROLL / OFFICIAL NOTICE / SITE OFFICE / PROJECT MANAGER`
- お問い合わせの `TEL` 装飾、現場代理人カードの `M01 M02` 番号、運行ルール `01-06` 番号
- 工事概要箇条書きの `▸` 矢印プレフィックス

### 過剰なアニメーション
- ヒーロー画像の Ken Burns ズーム（`@keyframes kenburns`）
- 進捗バーのシマー（`@keyframes shimmer`）
- LATESTバッジの発光（`@keyframes blink`）
- SCROLL インジケーターのパルス（`@keyframes pulse`）
- 特徴カードのコニックグラデーション回転（`@keyframes spin`）
- ライトボックスの過剰なフェードイン

### 過剰なグラフィック装飾
- 全画面メッシュグリッド背景（`.bg-fx::before` の格子）
- ダンプ運行アラートの斜めストライプ背景
- ガラスモーフィズム（`backdrop-filter: blur`）の多用
- ネオン発光 box-shadow（`--shadow-glow`, `--shadow-cyan`）
- グラデーション3色構成（Navy + Orange + **Cyan**） → **Cyanは削除**して2色に
- 各所のオレンジ縦バー・ホバーで伸びるバー演出

### モノスペースフォント装飾
- `font-family: "Consolas", "Menlo", monospace` を英字ラベルに多用 → 全部除去
- 工期表示 `2026.03.02 ─ 2026.09.30` のような区切り文字 → 普通の日本語表記に

## ✅ 残してよい要素
- Navy（#0B1733〜#1B2A4A 系）とオレンジ系の2色配色
- IntersectionObserverによる控えめなフェードイン（transform抑制）
- セクション見出し下のオレンジアクセント1本線
- カードの薄いシャドウ
- ライトボックス（写真クリックで拡大）
- レスポンシブ（375px幅対応）
- アクセシビリティ（alt属性、コントラスト比、`prefers-reduced-motion`）

## 構造（変更不可・触らない）

- セクション順: 概要 → 完成イメージ → ダンプ運行管理 → 進捗（マイルストーン+週次進捗ハイライト）→ 施工体制 → お知らせ → 連絡先
- データ駆動（`data/*.json` を `fetch()` で読み込む）→ HTML側のテンプレを変えてもよいが、JSON構造は維持
- 鴻治組本社電話 082-822-5211 / 鴻治組公式 https://koujigumi.jp/

## 依頼内容

`C:\Users\N2508-1\ClaudeCode\yamakita-site\` 配下を直接編集してください。

### 主な対象ファイル
- `index.html` — 英字ラベル・セクション番号・スクロールインジケーター削除
- `assets/css/style.css` — 装飾過剰要素を全面リファイン（ファイル丸ごと書き直してOK）
- `assets/js/main.js` — `renderProject`等の英字テンプレ文字列を日本語化
- `data/project.json` — `highlights[]` の `label` を日本語に
- `data/news.json` — `signage[]` の `label` を日本語に or 削除
- `data/team.json` — `members[].tagEn` 削除
- `data/dump.json` — そのままで可（番号は HTML/CSS側で抑える）

### 期待する出力
1. 上記ファイルへの **直接の Edit**
2. 完了後、変更点を「カテゴリ別」に箇条書きでまとめた `_review/codex_review_result.md` を新規作成
3. 反論レビュー（Codexから見て**さらに**抜くべき箇所が3つ以上あれば指摘）

## 検証
- `cd C:\Users\N2508-1\ClaudeCode\yamakita-site && python -m http.server 8765` でローカル動作確認
- スマホ幅(375px)・PC幅(1280px)両方で見て、伝統的ゼネコンらしい落ち着きが出ているかチェック
