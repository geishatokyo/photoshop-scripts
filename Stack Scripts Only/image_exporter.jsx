


//
// ----- 画像出力
//
var ImageExporter = function () {

    if(!pathSetting) {
        throw new Error("Need PathSetting instance");
    }
    var self = this;

    this.pathSetting = pathSetting;


    this.getImagePath = function(name, layer, additionalIgnoreLayers) {

        var additionalInvisibled = undefined;
        // 追加無視レイヤーの不可視化
        if(additionalIgnoreLayers){
            additionalInvisibled = additionalIgnoreLayers.filter(function(layer){
                if(layer.visible){
                    layer.visible = false;
                    return true;
                }else return false;
            });
        }

        // 可視の子要素がない場合は、画像を出力しない
        var isEmpty = _countVisibleChildren(layer) == 0;

        if(additionalInvisibled){
            additionalInvisibled.foreach(function(layer){
                layer.visible = true;
            });
        }

        if(isEmpty) return null;

        var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
        layer.image = imagePath.name;
        return imagePath;
    }


    this.exportAsPNG = function(name, layer, additionalIgnoreLayers) {

        // *****
        // 1. 必要なレイヤー以外を不可視状態に
        // 2. Documentをコピーし、表示範囲でCrop
        // 3. コピーしたDocumentをPNGとして保存
        // の手順で出力している
        // *****

        var additionalInvisibled = undefined;

        // 追加無視レイヤーの不可視化
        if(additionalIgnoreLayers){
            additionalInvisibled = additionalIgnoreLayers.filter(function(layer){
                if(layer.visible){
                    layer.visible = false;
                    return true;
                }else return false;
            });
        }

        // 可視の子要素がない場合は、画像を出力しない
        if(_countVisibleChildren(layer) == 0) {
            if(additionalInvisibled){
                additionalInvisibled.foreach(function(layer){
                    layer.visible = true;
                });
            }
            return null;
        }

        // 不可視化
    	var invisibled = _makeAllLayersInvisible();
    	var visibled = _makeLayersVisible(layer, invisibled);

        // コピーしてCrop
        var baseDoc = app.activeDocument;
        baseDoc.activeLayer = layer;
        var cloneDoc = baseDoc.duplicate(name);
        cloneDoc.crop(layer.bounds);

        // 出力
        var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
        _exportToPNG(imagePath, cloneDoc);
        layer.image = imagePath.name;

        app.activeDocument = baseDoc;
        cloneDoc.close(SaveOptions.DONOTSAVECHANGES);

        // 不可視状態の復帰
    	for(var i = 0;i < invisibled.length;i ++) {
    		invisibled[i].visible = true;
    	}
        if(additionalInvisibled){
            additionalInvisibled.foreach(function(layer){
                layer.visible = true;
            });
        }

        return imagePath;

    };


    function _makeAllLayersInvisible() {
    	var invisibledLayers = [];
    	var doc = app.activeDocument;
    	for(var i = 0;i < doc.layers.length;i ++){
    		var l = doc.layers[i];
    		_makeInvisible(l, invisibledLayers);
    	}
    	return invisibledLayers;
    }

    function _makeInvisible(layer, changedLayers) {
    	if(!layer.visible) return;
    	if(layer.typename == "ArtLayer"){
			layer.visible = false;
			changedLayers.push(layer);
    	}else{
	    	for(var i = 0;i < layer.layers.length;i ++){
	    		var l = layer.layers[i];
	    		_makeInvisible(l, changedLayers);
	    	}

    	}
    }
    /*
    
    @param layer   再帰的にvisibleにするレイヤー
    @param targets Visible化する対象。このリストに含まれているものだけVisible=trueに変更する
    @return visibleが変更されたレイヤーのリスト
     */
    function _makeLayersVisible(layer, targets) {
		var visibledLayers = [];
		_makeVisible(layer, visibledLayers, targets);
		return visibledLayers;
    }
    function _makeVisible(layer, changedLayers, targets) {
    	if(layer.typename == "ArtLayer"){
            if(layer.kind != LayerKind.TEXT &&
                targets.contains(layer)) {
			    layer.visible = true;
			    changedLayers.push(layer);
            }
    	}else{
	    	for(var i = 0;i < layer.layers.length;i ++){
	    		var l = layer.layers[i];
	    		_makeVisible(l, changedLayers, targets);
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