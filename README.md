芸者東京エンターテインメント株式会社の業務で使用するPhotoshopScriptです。

## 動作確認環境

Macbook Pro Sierra 10.12.3 + Adobe Photoshop CC

## 導入方法

※エンジニアは、ちゃんとhttps://ではなくgit@のほうでcloneして下さい。

### CUIでの導入と更新(推奨)


Mac(ターミナルで)

    // 新規作成
    cd "/Applications/Adobe Photoshop CC 2017/Presets/Scripts"
    git clone https://github.com/geishatokyo/photoshop-scripts.git
    // ↑のコマンドが失敗した場合は下のコマンドを実行してみて下さい。
    sudo git clone https://github.com/geishatokyo/photoshop-scripts.git

    // 最新版への更新
    cd "/Applications/Adobe Photoshop CC 2017/Presets/Scripts"
    git pull
    (sudo git pull)


Win(コマンドプロンプトで)

    // 新規作成
    cd "C:\program files\Adobe Photoshop CC 2017\Presets/Scripts"
    git clone https://github.com/geishatokyo/photoshop-scripts.git

    // 最新版への更新
    cd "C:\program files\Adobe Photoshop CC 2017\Presets/Scripts"
    git pull

(Photoshopのバージョンによってパスはかわることがあるので、パスは自分の環境で確認して下さい)

### SourceTreeでの導入と更新

新規レポジトリを、

    URL: https://github.com/geishatokyo/photoshop-scripts.git
    保存するパス: /Applications/Adobe Photoshop CC 2017/Presets/Scripts/photoshop-scripts
            Windowsは C:\program files\Adobe Photoshop CC 2017\Presets/Scripts/photoshop-scripts
    名前: photoshop-scripts

で作成して下さい。
更新は、「プル」ボタンを押せば出来ます。


### gitが入っていない場合の導入、更新方法

この右側あたりにあるDownload ZIPをクリックしてzipをダウンロードしてきて、<br />
導入方法に書かれているパスに解凍してください。<br />
または、js/jsxファイルを手動でダウンロードしてきてもOKです。


## コマンドの実行方法

Photoshopのメニューから、ファイル＞スクリプトを選ぶと、以下のコマンドが実行できます。

* avatar_exporter
* image_exporter


## 各種コマンドの説明

### image_exporter.jsx

各画像の透明部分をトリミングした画像を出力します。
2種類のモードで動作します。<br />
コマンドを実行したら、ダイアログが表示されるので、そこで切り替えて下さい。


#### 1. @付きレイヤー書き出しモード(推奨)

レイヤー名の後ろに@filenameが付いているレイヤーを、すべて個別の画像に保存します。

```
例
レイヤー1@hoge
グループ1@group
 - 子レイヤー1
 - 子レイヤー2
@fuga
レイヤー2
```

のようなレイヤーがあった場合、

* レイヤー1を、hoge.pngのファイル名で保存
* レイヤーセットに@を付けた場合は、その子レイヤーである子レイヤー1と子レイヤー2を結合したものを、group.pngのファイル名で保存
* @fugaをfuga.pngのファイル名で保存

の３つの画像が保存されます。レイヤー2はファイル名が設定されていないので、保存されません。


#### 2. Saveレイヤーの子レイヤー書き出しモード

Saveと名前を付けたレイヤーの子要素を、個別の画像として保存します。

```
例
Save
- hoge
- fuga
  - 子レイヤー1
  - 子レイヤー2
```

* hogeレイヤーは、hoge.pngのファイル名で保存
* fugaレイヤーセットは、子レイヤー1と子レイヤー2を結合したものをfuga.pngのファイル名で保存

の2つの画像が保存されます。


### avatar_exporter.jsx

各画像を、キャンバスのサイズのまま出力します。<br />
image_exporter.jsxと同様に、2種類の出力モードで動作します。<br />
詳細は、image_exporterの説明を読んで下さい。<br />
コマンドを実行したら、ダイアログが表示されるので、そこで切り替えて下さい。


## 謝辞

image_exporter.jsxは、https://github.com/knockknock-jp/psdexporter-jsx を参考に作りました。<br />
knockknock-jp様、ありがとうございます。
