


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
            // コピーしてCrop
            baseDoc.activeLayer = layer;
            var cloneDoc = baseDoc.duplicate(name);
            cloneDoc.crop(layer.bounds);

            // 出力
            var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
            _exportToPNG(imagePath, cloneDoc);
            layer.image = imagePath.name;

            app.activeDocument = baseDoc;
            cloneDoc.close(SaveOptions.DONOTSAVECHANGES);
            return imagePath;
        });

    };

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