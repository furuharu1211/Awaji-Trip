# AWAJI FAMILY TRIP 2026

GitHub Pagesで公開できる、HTML / CSS / Vanilla JavaScriptのみの家族旅行用静的サイトです。

## フォルダ構成

```text
travel-awaji/
├── index.html
├── schedule.html
├── sightseeing.html
├── hotel.html
├── belongings.html
├── members.html
├── gallery.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    ├── hero/
    ├── hotel/
    ├── sightseeing/
    └── gallery/
```

## 最初に用意するとよい画像

### images/hero/
- hero-01.jpg
- hero-02.jpg
- hero-03.jpg
- hero-04.jpg
- hero-05.jpg

### images/hotel/
- hotel-01.jpg ～ hotel-05.jpg
- hotel-room.jpg
- hotel-dining.jpg
- hotel-bath.jpg

### images/sightseeing/
- sightseeing-main-01.jpg
- sightseeing-main-02.jpg
- sightseeing-recommend-01.jpg ～ sightseeing-recommend-05.jpg
- schedule-lunch.jpg（必要なら）
- schedule-spot.jpg（必要なら）

### images/gallery/
- photo-01.jpg 以降、好きな枚数

## ローカル確認

最も簡単なのは `index.html` をブラウザで開く方法です。
VS Codeを使う場合は Live Server 拡張機能を使うと、保存時に自動更新されて便利です。

## GitHub Pages公開

1. GitHubで新しいリポジトリを作成（例: `travel-awaji`）
2. このフォルダ内のファイルをすべてpush
3. GitHubのリポジトリで `Settings` → `Pages`
4. `Build and deployment` の Source を `Deploy from a branch` にする
5. Branch を `main`、Folder を `/ (root)` にして `Save`
6. 数分後、表示された公開URLへアクセス

※ リポジトリをPublicにすれば、GitHub FreeでもPagesを利用しやすいです。家族情報を載せる場合は、公開範囲に注意してください。
