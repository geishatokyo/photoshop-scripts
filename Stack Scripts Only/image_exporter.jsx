


//
// ----- 画像出力
//
var ImageExporter = function () {

    if(!pathSetting) {
        throw new Error("Need PathSetting instance");
    }
    var self = this;

    this.pathSetting = pathSetting;

    /*
    TextLayerの出力を抑制する
    */
    this.dontExportTextLayer = true;

    /*
    PNG出力はせずに、保存先のファイルパスだけを返す
    可視な子レイヤーが存在しないLayerSetの場合は、画像は出力されずnullが帰る
    @param name 保存ファイル名
    @param layer 出力するレイヤー
    @param additionalIgnoreLayers 出力するレイヤーの子要素の内、出力しないレイヤー
    @return 保存されたファイルのパス
    */
    this.getImagePath = function(name, layer, additionalIgnoreLayers) {

        return _scope(layer, additionalIgnoreLayers, function() {
            name = camelToSnake(name); // ファイル名はスネークケースに(CamelCaseの場合、)
            var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
            layer.image = imagePath.name;
            return imagePath;
        });
    }

    /*
    指定したLayerをPNGとして出力する。
    可視な子レイヤーが存在しないLayerSetの場合は、画像は出力されずnullが帰る
    @param name 保存ファイル名
    @param layer 出力するレイヤー
    @param additionalIgnoreLayers 出力するレイヤーの子要素の内、出力しないレイヤー
    @return 保存されたファイルのパス
    */
    this.exportAsPNG = function(name, layer, additionalIgnoreLayers) {

        var baseDoc = app.activeDocument;
        // *****
        // 1. 必要なレイヤー以外を不可視状態に
        // 2. Documentをコピーし、表示範囲でCrop
        // 3. コピーしたDocumentをPNGとして保存
        // の手順で出力している
        // *****
        return _scope(layer, additionalIgnoreLayers, function() {
            name = camelToSnake(name);
            // コピーしてCrop
            baseDoc.activeLayer = layer;
            var cloneDoc = baseDoc.duplicate(name);
            cloneDoc.crop(layer.bounds);
            // 出力
            var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
            log("Export " + imagePath);
            _exportToPNG(imagePath, cloneDoc);
            layer.image = imagePath.name;

            app.activeDocument = baseDoc;
            cloneDoc.close(SaveOptions.DONOTSAVECHANGES);
            return imagePath;
        });

    };

    var SpecialWords = [
        "OK",
        "NG",
        "HTTP"
    ];

    /*
    CamelCaseをSnakeCaseに変更する
    ファイル名が大文字、小文字混じりの場合、svnやgitで問題を起こしやすいためファイル名はSnakeCaseに変える
    */
    function camelToSnake(name){
        if(!name) return "";
        if(name.length == 0) return "";
        var _name = "";
        for(var i = 0;i < name.length;i++){
            var s = name.substring(i);

            // 大文字から構成される略語を処理
            var isStartWithSpecialWord = false;
            for(var j = 0;j < SpecialWords.length;j++){
                var sw = SpecialWords[j];
                if(s.startsWith(sw)){
                    i += sw.length - 1;
                    _name += "_" + sw.toLowerCase() + "_";
                    isStartWithSpecialWord = true;
                    break;
                }
            }
            if(isStartWithSpecialWord){
                continue;
            }

            current = name.substring(i, i+1);
            if (current.match(/[A-Z]+/)) {
                if( _name.endsWith("_")){
                    // _が連続しないように
                    _name += current.toLowerCase();
                } else {
                    _name += "_" + current.toLowerCase();
                }
            } else {
                _name += current;
            }
        }
        if(_name.substring(0,1) == "_") {
            return _name.substring(1);
        } else {
            return _name;
        }
    }

    /*
    Layerの不可視化と復元を行う。
    @param scopeFunc 実際の挟み込みたい処理
    */
    function _scope(layer, additionalIgnoreLayers, scopeFunc) {


        var additionalInvisibled = undefined;

        
        var invisibled = _makeInvisibleExcept(layer);
        // 追加無視レイヤーの不可視化
        if(additionalIgnoreLayers){
            additionalInvisibled = additionalIgnoreLayers.filter(function(layer){
                if(layer.visible){
                    layer.visible = false;
                    return true;
                }else return false;
            });
        }

        var value = null;
        // 可視の子要素がない場合は、画像を出力しない
        if(_countVisibleChildren(layer) == 0) {
            log("No visible layers in " + layer.name);
            // do nothing
        }else {
            value = scopeFunc();
        }


        // 不可視状態の復帰
        for(var i = 0;i < invisibled.length;i ++) {
            invisibled[i].visible = true;
        }
        if(additionalInvisibled){
            additionalInvisibled.foreach(function(layer){
                layer.visible = true;
            });
        }

        return value;
    }

    /**
    visibleLayerで指定したレイヤー以外を不可視化する
    */
    function _makeInvisibleExcept(visibleLayer) {
        var invisibledLayers = [];
        var doc = app.activeDocument;
        for(var i = 0;i < doc.layers.length;i ++){
            var l = doc.layers[i];
            _rec_makeInvisibleExcept(l, visibleLayer, invisibledLayers);
        }
        return invisibledLayers;
    }
    function _rec_makeInvisibleExcept(layer, visibleLayer, changedLayers) {
        if(layer === visibleLayer){

            // TextLayerの出力をしない場合、追加でチェック
            if(self.dontExportTextLayer){
                _rec_makeTextLayersInvisible(layer, changedLayers);
            }
            return true;
        }
        if(!layer.visible) return false;


        if(layer.typename == "LayerSet"){
            var existsVisibleLayer = false;
            for(var i = 0;i < layer.layers.length;i ++){
                var l = layer.layers[i];
                existsVisibleLayer |= _rec_makeInvisibleExcept(l, visibleLayer, changedLayers);
            }
            if(!existsVisibleLayer) {
                layer.visible = false;
                changedLayers.push(layer);
            }
            return true;

        }else { // ArtLayer
            layer.visible = false;
            changedLayers.push(layer);
            return false;
        }

    }
    function _rec_makeTextLayersInvisible(layer, changedLayers){
        if(!layer.visible) return;
        if(layer.kind == LayerKind.TEXT){
            layer.visible = false;
            changedLayers.push(layer);
        }else if(layer.typename == "LayerSet"){
            for(var i = 0;i < layer.layers.length;i++){
                var l = layer.layers[i];
                _rec_makeTextLayersInvisible(l, changedLayers);
            }
        }
    }


    function _exportToPNG(path, doc) {

        /*var optionObj = new PNGSaveOptions();
        optionObj.interlaced = false;
        doc.saveAs(path, optionObj, true, Extension.LOWERCASE);*/

        
        var options = new ExportOptionsSaveForWeb();
        // PNGで保存
        options.format = SaveDocumentType.PNG;
        // 最適化有効
        options.optimized = true;
        options.PNG8 = false;
        // インターレース無効
        options.interlaced = false;

        doc.exportDocument(path, ExportType.SAVEFORWEB, options);

    }

    function _countVisibleChildren(layer){
        if(!layer.visible) {
            return 0;
        }
        if(layer.typename == "LayerSet"){
            var c = 0;
            for(var i = 0; i < layer.layers.length;i++){
                c += _countVisibleChildren(layer.layers[i]);
            }
            return c;
        }else {
            if(layer.visible){
                 return 1;
            }else return 0;
        }
    }



};

var imageExporter = new ImageExporter();