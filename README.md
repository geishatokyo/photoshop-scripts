芸者東京エンターテインメント株式会社の業務で使用するPhotoshopScriptです。

## 動作確認環境

Macbook Pro Sierra 10.12.3 + Adobe Photoshop CC

## 導入方法

"""/Applications/Adobe Photoshop CC 2017/Presets/Scripts"""でこのレポジトリをクローンすればOKです。
この文章で導入方法がわからない人は、勉強して下さい。

※エンジニアは、ちゃんとhttps://ではなくgit@のほうでcloneして下さい。

### Macでの導入と更新

Mac(ターミナルで)

    $ 新規作成
    cd "/Applications/Adobe Photoshop CC 2017/Presets/Scripts"
    git clone https://github.com/geishatokyo/photoshop-scripts.git
    # ↑のコマンドが失敗した場合は下のコマンドを実行してみて下さい。
    sudo git clone https://github.com/geishatokyo/photoshop-scripts.git

    # 最新版への更新
    cd "/Applications/Adobe Photoshop CC 2017/Presets/Scripts/photosho-scripts"
    git pull
    (sudo git pull)


### Windowsでの導入と更新

#### Step1 アクセス権限変更

C:\program files\Adobe\Adobe Photoshop CC 2017\Presets/Scripts <br />
のディレクトリの

* 「読み取り専用」設定の解除
* Usersに対して「書き込み」または「フルコントロール」の権限付与

を行って下さい。<br />
変更は、下のURLを参考にして下さい。 <br />
https://www2.mouse-jp.co.jp/ssl/user_support2/sc_faq_documents.asp?FaqID=10494



#### Step2 gitのクローン

マシン内検索で、「コマンドプロンプト」を検索して、コマンドプロンプトを起動して下さい。

Win(コマンドプロンプトで)

    # 新規作成
    cd "C:\program files\Adobe\Adobe Photoshop CC 2017\Presets/Scripts"
    git clone https://github.com/geishatokyo/photoshop-scripts.git
    
    # 最新版への更新
    cd "C:\program files\Adobe\Adobe Photoshop CC 2017\Presets/Scripts/photoshop-scripts"
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


### cdとgitとsudoって何？

cd = change directoryで、ディレクトリの移動を行っている
git gitのコマンド。その後に色々つけることで、gitを使える
sudo 管理者権限でコマンドを実行出来る

### Gitが入っていない場合は？

キーワードを書いておきます。わからないならググって下さい。日本語の導入記事が大量にあります。
Macの場合は、「brew install」または、 「SourceTree」を入れて下さい。
Windowsの場合は、「Tortoise git」を入れて下さい。(ちゃんと入れればコマンドプロンプトでも使えるようになっています)

### gitを入れずにとりあえず使って見るには？

この右側あたりにあるDownload ZIPをクリックしてzipをダウンロードしてきて、<br />
導入方法に書かれているパスに解凍してください。<br />
または、js/jsxファイルを手動でダウンロードしてきてもOKです。


## コマンドの実行方法

Photoshopのメニューから、ファイル＞スクリプトを選ぶと、以下のコマンドが実行できます。

* avatar exporter
* ui structure_exporter

## 詳細説明

詳しい説明に関しては[Wiki](https://github.com/geishatokyo/photoshop-scripts/wiki)に記載があります。使用するスクリプトに関する説明を確認しておいて下さい。


## 各種コマンドの簡単な説明

### avatar exporter.jsx

キャンパスの大きさのまま、Layer毎に個別画像として保存します。
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


### ui structure exporter.jsx

各画像を、トリミングして画像保存します。また、UIの構造情報も同時に出力します。<br />
avatar exporter.jsxの@付きレイヤー書き出しモードで動作します、。<br />

### layer generator.jsx

conf/layer_gen/ のファイルにリストされているレイヤーで存在しないレイヤーが合った場合に、作成する。また、ログにはリストに存在しないレイヤーも出力しています。

## 謝辞

image_exporter.jsxは、https://github.com/knockknock-jp/psdexporter-jsx を参考に作りました。<br />
knockknock-jp様、ありがとうございます。
