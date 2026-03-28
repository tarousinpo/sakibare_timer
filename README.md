# sakibare_timer

先バレの音がするドパ中用タイマー（非営利）

## 機能

- 1ページで複数のタイマーを追加・同時実行できます
- 各タイマーは「分」「秒」をキーボードまたはスマホのソフトキーで入力できます
- 各タイマーに Start / Stop / Reset ボタンがあります
- 0:00 になると `docs/sounds/` 内の MP3 をランダムで 1 つ選んでループ再生します
- Stop ボタンを押すまで音が鳴り続けます（複数タイマーが同時に鳴っても OK）
- PC・スマホ両対応のレスポンシブデザイン

## GitHub Pages の公開手順

1. このリポジトリを GitHub 上で開く
2. **Settings** → **Pages** に移動
3. Source（Build and deployment）を以下に設定する
   - Branch: `main`
   - Folder: `/docs`
4. **Save** を押す
5. しばらく待つと `https://<username>.github.io/<repository>/` で公開されます

## 音声ファイルの追加方法

`docs/sounds/` フォルダに MP3 ファイルを置き、`docs/sounds/manifest.json` にファイル名を追記してください。
詳細は [`docs/sounds/README.md`](docs/sounds/README.md) を参照してください。

```json
{
  "sounds": [
    "alarm1.mp3",
    "alarm2.mp3"
  ]
}
```

## ローカル確認

`docs/` フォルダを任意のローカルサーバで配信してください。
例（Python 3）:

```bash
cd docs
python3 -m http.server 8080
# → http://localhost:8080 で確認
```

> ※ `file://` で直接開くと `fetch()` の CORS 制限で manifest が読めないため、
> ローカルサーバ経由での確認を推奨します。

## ファイル構成

```
docs/
├── index.html          # メインページ
├── style.css           # スタイルシート
├── app.js              # タイマーロジック
└── sounds/
    ├── manifest.json   # 再生するMP3ファイル名の一覧
    └── README.md       # 音声ファイル追加の説明
```
