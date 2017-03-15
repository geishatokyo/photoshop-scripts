


//
// ----- 画像出力
//
var ImageExporter = function () {

    if(!pathSetting) {
        throw new Error("Need PathSetting instance");
    }
    var self = this;

    this.pathSetting = pathSetting;

    this.exportAsPNG = function(name, layer) {

        // 可視の子要素がない場合は、画像を出力しない
        if(_countVisibleChildren(layer) == 0) {
            return null;
        }

    	var invisibled = _makeAllLayersInvisible();
    	var visibled = _makeLayersVisible(layer);

        var baseDoc = app.activeDocument;
        baseDoc.activeLayer = layer;

        var cloneDoc = baseDoc.duplicate(name);

        cloneDoc.crop(layer.bounds);

        var imagePath = new File( pathSetting.imageExportDir + "/" + name + ".png");
        _exportToPNG(imagePath, cloneDoc);

        app.activeDocument = baseDoc;
        cloneDoc.close(SaveOptions.DONOTSAVECHANGES);

    	for(var i = 0;i < invisibled.length;i ++) {
    		invisibled[i].visible = true;
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
    function _makeLayersVisible(layer) {
		var visibledLayers = [];
		_makeVisible(layer, visibledLayers);
		return visibledLayers;
    }
    function _makeVisible(layer, changedLayers) {
    	if(layer.typename == "ArtLayer"){
            if(layer.kind != LayerKind.TEXT) {
			    layer.visible = true;
			    changedLayers.push(layer);
            }
    	}else{
	    	for(var i = 0;i < layer.layers.length;i ++){
	    		var l = layer.layers[i];
	    		_makeVisible(l, changedLayers);
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
                c += _countVisibleChildren(layer);
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