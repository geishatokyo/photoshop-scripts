芸者東京エンターテインメント株式会社の業務で使用するPhotoshopScriptです。

## 動作確認環境

Macbook Pro Sierra 10.12.3 + Adobe Photoshop CC

## 導入方法

Mac

    /Applications/Adobe Photoshop CC 2017/Presets/Scripts

Win

    C:\program files\Adobe Photoshop CC 2017\Presets/Scripts

(Photoshopのバージョンによってパスはかわることがあるので、パスは自分の環境で確認して下さい)

に移動し、このレポジトリを

    git clone git@github.com:geishatokyo/photoshop-scripts.git gte-scripts
    
のコマンドでチェックアウトしてください。
gte-scriptsの部分はディレクトリ名なので、好きな名前に変更して大丈夫です。
チェックアウトが完了したら、Photoshopを再起動してください。

## 更新方法

cloneしたディレクトリで

    git pull

を実行してください。


## gitが入っていない場合の導入方法

この右側あたりにあるDownload ZIPをクリックしてzipをダウンロードしてきて、
導入方法に書かれているパスに解凍してください。
または、js/jsxファイルを手動でダウンロードしてきてもOKです。



## 各種コマンドの説明

### image_exporter.jsx

2種類のモードで動作します

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


## 謝辞

image_exporter.jsxは、https://github.com/knockknock-jp/psdexporter-jsxを参考に作りました。<br />
knockknock-jp様、ありがとうございます。
