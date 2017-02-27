//
// ==================== Class ==================== //
//
if(typeof JSON!=='object'){JSON={};}(function(){'use strict';function f(n){return n<10?'0'+n:n;}function this_value(){return this.valueOf();}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};Boolean.prototype.toJSON=this_value;Number.prototype.toJSON=this_value;String.prototype.toJSON=this_value;}var cx,escapable,gap,indent,meta,rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){escapable=/[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());



//
// ----- ダイアログ
//
var DialogManager = function () {

    var _window;
    var _imageCheckboxExport;
    var _layerFilterModeList;
    var _imageEdittextDirectory;
    var _imageRadiobuttonPng;
    var _imageRadiobuttonJpg;
    var _imageRadiobuttonGif;
    var _imageDropdownlistJpgCompress;

    var _uiPositionExport;

    var _htmlCheckboxExport;
    var _htmlEdittextDirectory;
    var _htmlEdittextName;
    var _htmlDropdownlistDoctype;
    var _cssCheckboxExport;
    var _cssEdittextDirectory;
    var _cssEdittextName;
    var _cssCheckboxLayout;
    var _otherEdittextColor;
    var _otherDropdownlistCharaset;
    var _okBtn;
    var _cancelBtn;
    var _isExportImages = true;
    var _isExportUIPosition = true;
    var _isExportHtml = true;
    var _isExportCss = true;
    var _layerFilterMode = 0;
    var _imageFolderPath = null;
    var _htmlFolderPath = null;
    var _cssFolderPath = null;
    var _htmlFileName = null;
    var _cssFileName = null;
    var _encodeInfo = null;
    var _jpegCompressRate = null;
    var _htmlDoctype = null;
    var _htmlTitle = null;
    var _defaultFileType = null;
    var _isAbsolute = true;
    var _rootPathFromHtml = "";
    var _rootPathFromCss = "";
    var _isRelativePath = true;

    // 初期化
    this.init = function () {
        var totalY = 0;
        var totalX = 20;
        // ウィンドウ作成
        _window = new Window("dialog", "画像出力", _getPosition({x:200, y:200, w:400, h:400}));
        // 画像ファイル設定
        totalY = 20;
        totalX = 20;
        _imageCheckboxExport = _window.add("checkbox", _getPosition({x:totalX, y:totalY, w:320, h:40}), "画像ファイルを書き出す");
        _imageCheckboxExport.value = true;

        var imagePanel = _window.add("panel", _getPosition({x:20, y:totalY + 20, w:350, h:180}), "画像ファイル設定");

        imagePanel.add("statictext", _getPosition({x:20, y:20, w:100, h:20}), "出力レイヤー");
        _layerFilterModeList = imagePanel.add("dropdownlist", _getPosition({x:130, y:20, w:200, h:20}), ["@付きのレイヤー","Saveレイヤー内のレイヤー"]);
        _layerFilterModeList.selection = 0;

        imagePanel.add("statictext", _getPosition({x:20, y:50, w:100, h:20}), "ディレクトリ :").justify = "right";
        _imageEdittextDirectory = imagePanel.add("edittext", _getPosition({x:130, y:50, w:200, h:20}), "images");
        imagePanel.add("statictext", _getPosition({x:20, y:80, w:100, h:20}), "ファイル形式 :").justify = "right";
        _imageRadiobuttonPng = imagePanel.add("radiobutton", _getPosition({x:130, y:80, w:50, h:20}), "PNG");
        _imageRadiobuttonPng.value = true;
        _imageRadiobuttonJpg = imagePanel.add("radiobutton", _getPosition({x:190, y:80, w:50, h:20}), "JPEG");
        _imageRadiobuttonJpg.value = false;
        _imageRadiobuttonGif = imagePanel.add("radiobutton", _getPosition({x:250, y:80, w:50, h:20}), "GIF");
        _imageRadiobuttonGif.value = false;
        imagePanel.add("statictext", _getPosition({x:20, y:110, w:100, h:20}), "JPEG画質 :").justify = "right";
        _imageDropdownlistJpgCompress = imagePanel.add("dropdownlist", _getPosition({x:130, y:110, w:200, h:20}), ["100 （最高画質）", "90", "80 （高画質）", "70", "60 （やや高画質）", "50", "40", "30 （中画質）", "20", "10 （低画質）"]);
        _imageDropdownlistJpgCompress.selection = 2;

        // その他オプション
        totalY = 220;
        totalX = 20;
        _window.add("statictext", _getPosition({x:totalX, y:totalY, w:90, h:20}), "背景色 :").justify = "right";
        _otherEdittextColor = _window.add("edittext", _getPosition({x:120, y:totalY, w:200, h:20}), "#ffffff");
        // OKボタン
        totalY = 300;
        _okBtn = _window.add("button", _getPosition({x:90, y:totalY, w:100, h:30}), "OK", { name:"ok" });
        _okBtn.onClick = function () {
            _close({flg:true});
        };
        // CANCELボタン
        _cancelBtn = _window.add("button", _getPosition({x:200, y:totalY, w:100, h:30}), "Cancel", { name:"cancel" });
        _cancelBtn.onClick = function () {
            _close({flg:false});
        };
        // コピーライト
        _window.add("statictext", _getPosition({x:20, y:totalY + 50, w:350, h:20}), "Developed : @knockknockjp").justify = "right";
        _window.add("statictext", _getPosition({x:20, y:totalY + 70, w:350, h:20}), "URL : http://www.knockknock.jp").justify = "right";
        _window.add("statictext", _getPosition({x:20, y:totalY + 90, w:350, h:20}), "e-Mail : nishida@knockknock.jp").justify = "right";
    };

    // 開く
    this.open = function () {
        _window.show();
    };

    // 画像ファイルを書き出すか否か
    this.getIsExportImages = function () {
        return _isExportImages;
    };

    this.getLayerFilterMode = function() {
        return _layerFilterMode;
    }

    // HTMLファイルを書き出すか否か
    this.getIsExportHtml = function () {
        return _isExportHtml;
    };

    // HTMLファイルを書き出すか否か
    this.getIsExportCss = function () {
        return _isExportCss;
    };

    // 画像ファイル格納場所
    this.getImageFolderPath = function () {
        return _imageFolderPath;
    };

    // HTMLファイル格納場所
    this.getHtmlFolderPath = function () {
        return _htmlFolderPath;
    };

    // CSSファイル格納場所
    this.getCssFolderPath = function () {
        return _cssFolderPath;
    };

    // HTMLファイル名
    this.getHtmlFileName = function () {
        return _htmlFileName;
    };

    // CSSファイル名
    this.getCssFileName = function () {
        return _cssFileName;
    };

    // エンコード
    this.getEncodeInfo = function () {
        return _encodeInfo;
    };

    // JPEG圧縮率
    this.getJpegCompressRate = function () {
        return _jpegCompressRate;
    };

    // HTMLドキュメント形式
    this.getHtmlDoctype = function () {
        return _htmlDoctype;
    };

    // HTMLタイトル
    this.getHtmlTitle = function () {
        return _htmlTitle;
    };

    // デフォルト画像形式
    this.getDefaultFileType = function () {
        return _defaultFileType;
    };

    // 背景カラー
    this.getOtherBgColor = function () {
        return _otherBgColor;
    };

    // 絶対配置
    this.getIsAbsolute = function () {
        return _isAbsolute;
    };

    // HTMLファイルから見たルートパス
    this.getRootPathFromHtml = function () {
        return _rootPathFromHtml;
    };

    // CSSファイルから見たルートパス
    this.getRootPathFromCss = function () {
        return _rootPathFromCss;
    };

    // 絶対パスか否か
    this.getIsRelativePath = function () {
        return _isRelativePath;
    };

    // 閉じる
    function _close(e) {
        if (e.flg) {
            try{
                var str = "";
                var selection = "";
                // 画像ファイルを書き出すか否か
                _isExportImages = _imageCheckboxExport.value;

                // Layerのフィルター
                for(var i = 0; i < _layerFilterModeList.items.length; i++) {
                    if( _layerFilterModeList.selection == _layerFilterModeList.items[i]) {
                        _layerFilterMode = i;
                        break;
                    }
                }
                // 画像ファイル格納場所
                _imageFolderPath = _setDirectoryText({str:_imageEdittextDirectory.text});
                // 背景カラー
                _otherBgColor = getHexColorTextUtil(_otherEdittextColor.text);
                // JPEG圧縮率
                _jpegCompressRate = 80;
                selection = String(_imageDropdownlistJpgCompress.selection);
                switch (selection) {
                    case "100 （最高画質）":
                        _jpegCompressRate = 100;
                        break;
                    case "90":
                        _jpegCompressRate = 90;
                        break;
                    case "80 （高画質）":
                        _jpegCompressRate = 80;
                        break;
                    case "70":
                        _jpegCompressRate = 70;
                        break;
                    case "60 （やや高画質）":
                        _jpegCompressRate = 60;
                        break;
                    case "50":
                        _jpegCompressRate = 50;
                        break;
                    case "40":
                        _jpegCompressRate = 40;
                        break;
                    case "30 （中画質）":
                        _jpegCompressRate = 30;
                        break;
                    case "20":
                        _jpegCompressRate = 20;
                        break;
                    case "10 （低画質）":
                        _jpegCompressRate = 10;
                        break;
                }
                _window.close();
                // エラーチェックイベント
                checkErrorEvent();
            } catch(e) {
                alert(e);
            }
        } else {
            _window.close();
            alert("取り消しました");
        }
    }

    // アイテム位置情報取得
    function _getPosition(e) {
        return [ e.x, e.y, e.w + e.x, e.h + e.y ];
    }

    // ディレクトリテキスト作成
    function _setDirectoryText(e) {
        var str = String(e.str);
        var str2 = "";
        var flg = false;
        var flg2 = false;
        var length = str.length;
        for (var i = 0; i < length; i++) {
            if (!flg && String(str[i]).match(/[^0-9A-Za-z_-]+/) == null) {
                flg = true;
            }
            if (flg && String(str[i]).match(/[^0-9A-Za-z_.\/-]+/) == null) {
                if (String(str[i]).match(/[^\/]+/) == null) {
                    if (flg2) {
                        return str2.substr(0, str2.length - 1);
                    } else {
                        str2 += str[i];
                    }
                    flg2 = true;
                } else {
                    str2 += str[i];
                    flg2 = false;
                }
            }
        }
        if (str2.charAt(str2.length - 1) == "/") {
            str2 = str2.substr(0, str2.length - 1);
        }
        return str2;
    }

    // ファイル名テキスト作成
    function _setFileNameText(e) {
        var str = String(e.str);
        var str2 = "";
        var flg = false;
        var length = str.length;
        for (var i = 0; i < length; i++) {
            if (!flg && String(str[i]).match(/[^0-9A-Za-z_-]+/) == null) {
                flg = true;
            }
            if (flg && String(str[i]).match(/[^0-9A-Za-z_.-]+/) == null) {
                str2 += str[i];
            }
        }
        if (str2.charAt(0) == ".") {
            str2 = str2.slice(1);
        }
        str2 = str2.split(".")[0];
        return str2;
    }

    // ルートへのパス取得
    function _getRootPath(e) {
        if (dialogManager.getIsRelativePath()) {
            var path = e.path;
            var depth = 0;
            if (path != "") {
                depth = String(path).split("/").length;
            }
            var str = "";
            var length = depth;
            for (var i = 0; i < length; i++) {
                str += "../";
            }
        } else {
            str = "/";
        }
        return str;
    }

};

//
// ----- エラー管理
//
var ErrorChecker = function () {

    var _errorMsgSave;
    var _errorMsgDuplicate;
    var _errorMsgName;
    var _errorMsgExist;

    var _layerName;

    // 初期化
    this.init = function () {
        _errorMsgSave = "";
        _errorMsgDuplicate = "";
        _errorMsgName = "";
        _errorMsgExist = "";
        _layerName = "";
    };

    // チェック
    this.check = function (e) {
        _checkSave();
        _checkDuplicate({
            item:activeDocument,
            name:""
        });

        /*_checkName({
            item:activeDocument,
            name:""
        });*/
        _checkExist({
            item:activeDocument,
            name:""
        });
        var msg = "";
        if (_errorMsgSave != "" || _errorMsgDuplicate != "" || _errorMsgName != "" || _errorMsgExist != "") {
            msg = "以下のエラーがあります。\n\n";
            if (_errorMsgSave != "") msg += _errorMsgSave;
            if (_errorMsgDuplicate != "") msg += "■レイヤー及びレイヤーセットの名称でIDに重複しているものがあります。\n\n" + _errorMsgDuplicate;
            if (_errorMsgName != "") msg += "■レイヤー及びレイヤーセットの名称でIDに使用出来ない文字列が存在します。\n\n" + _errorMsgName;
            if (_errorMsgExist != "") msg += "■表示範囲に要素がないレイヤー及びレイヤーセットが存在します。\n\n" + _errorMsgExist;
        }
        if (msg != "") {
            alert(msg);
        } else {
            // 書き出し開始イベント
            try{
                startExportEvent();
            }catch(e) {
                alert(e);
            }
        }
    };

    // 保存チェック
    function _checkSave() {
        if (!activeDocument || !activeDocument.path) {
            _errorMsgSave += "■実行するには、PSDドキュメントを保存する必要があります。\n\n";
        }
        var fileName = String(activeDocument.fullName);
        fileName = fileName.substring(fileName.lastIndexOf("/") + 1, fileName.length);
        if (fileName.match(/[^0-9A-Za-z_.:-]+/) != null) {
            _errorMsgSave += "■PSDドキュメントを半角英数で保存する必要があります。\n\n";
        }
    }

    // 重複チェック
    function _checkDuplicate(e) {

        var layerNames = {};

        layerFilter.foreachLayer( function(layer) {
            var saveName = layerFilter.getSaveLayerName(layer);
            var name = layer.name;
            if(layerNames[saveName] != undefined){
                _errorMsgDuplicate += " ファイル名 :  " + saveName + " レイヤー名:" + name + " \n\n";
            } else {
                layerNames[saveName] = 1;
            }
        });

    }

    // IDチェック
    function _checkName(e) {
        var item = e.item;
        var name = e.name;

        layerFilter.foreachLayer(function(layer) {
            var layerName = layerFilter.getSaveLayerName({name:layer.name});
            if (layerName.match(/[^0-9A-Za-z_.:-]+/) != null) {
                if(layer.typename == "LayerSet"){
                    _errorMsgName += "  レイヤーセット :  " + layer.name + "\n\n";
                }else{
                    _errorMsgName += "	レイヤー :  " + layer.name + "\n\n";
                }
            }
        });
    }

    // 表示要素チェック
    function _checkExist(e) {
        var item = e.item;
        var name = e.name;
        var documentHeight = activeDocument.height.value;
        var documentWidth = activeDocument.width.value;
        layerFilter.foreachLayer(function(layer) {

            var x1 = parseInt(layer.bounds[0]);
            var y1 = parseInt(layer.bounds[1]);
            var x2 = parseInt(layer.bounds[2]);
            var y2 = parseInt(layer.bounds[3]);
            if (( x2 - x1 ) <= 0 || ( y2 - y1 ) <= 0 || x2 <= 0 || y2 <= 0 || documentWidth <= x1 || documentHeight <= y1) {
                var typename = " レイヤー :  ";
                if(layer.typename == "LayerSet") {
                    typename = " レイヤーセット :  "
                }
                _errorMsgExist += typename + name + "/" + layer.name + "\n\n";
            }

        });
    }

};

var LayerFilter = function() {


    var layers = null;
    var self = this;
  

    this.foreachLayer = function(loopFunc) {
        var layers = self.getLayers();
        for(var i = 0;i < layers.length; i++){
            loopFunc(layers[i]);
        }
    }
    /**
     * 出力対象になるArtLayerまたは、LayerSetのリストを返す
     */
    this.getLayers = function() {
        if(layers != null){
            return self.layers;
        }


        layers = [];

        var layers = layers;

        if(dialogManager.getLayerFilterMode() == 0){
            _findLayers({ item: activeDocument}, function(layer) {
                layer.isTarget = true;
                layer.info = {};
                layers.push(layer);
            });
        }else {
            _listUpLayersInSaveLayerSet(activeDocument, function(layer){
                layer.isTarget = true;
                layer.info = {};
                layers.push(layer);
            });
        }

        return layers;
    }


    this.getSaveLayerName = function(item) {
        if(dialogManager.getLayerFilterMode() == 0){
            return _getAfterAdMark(item);
        }else {
            return _getName(item);
        }
    }

    function _findLayers(e, listener) {


        var item = e.item;
        // レイヤー
        var length = item.artLayers.length;
        for (var i = 0; i < length; i++) {
            var artLayer = item.artLayers[ i ];
            if(artLayer.visible && _isExportTargetLayer(artLayer)){
                listener(artLayer);
            }
        }
        // レイヤーセット
        var length = item.layerSets.length;
        for (var i = 0; i < length; i++) {
            var layerSet = item.layerSets[ i ];
            if(layerSet.visible) {
                if(_isExportTargetLayer(layerSet)){
                    listener(layerSet);
                }else {
                    // 再帰
                    _findLayers({
                        item:layerSet
                    }, listener);
                }
            } 
        }
    }

    function _isExportTargetLayer(e) {
        return e ? e.name.indexOf("@") >= 0 : false;
    }

    /**
      Saveと名前の付けられたLayerSet直下のArtLayerとLayerSetを出力する
     */
    function _listUpLayersInSaveLayerSet(activeDocument, listener) {

        var saveDir = activeDocument.layerSets.getByName("Save");
        _listUpRec(saveDir, listener);
    }

    function _listUpRec(layerSet, listener) {    

        var length = layerSet.artLayers.length;
        for(var i = 0; i < length; i++) {
            var artLayer = layerSet.artLayers[i];
            if(artLayer.visible){
                listener(artLayer);
            }
        }

        var length = layerSet.layerSets.length;
        for(var i = 0; i < length; i++) {
            var ls = layerSet.layerSets[i];
            if(ls.visible){
                // 子にLayerSetを持たないLayerSetは、画像として出力
                if(ls.layerSets.length == 0){
                    listener(ls);
                }else{
                    // それ以外は、中に入ってチェック
                    _listUpRec(ls, listener);
                }
            }
        }
    }


    //
    // ----- レイヤー名の@マークから後ろを取得
    //
    function _getAfterAdMark(e) { 
        var str = (e) ? e.name : "";
        var filename = String(str).substring(str.indexOf("@") + 1);
        return filename;
    }

    function _getName(e) {
        return (e) ? e.name : "";
    }

}


//
// ----- 画像出力
//
var ImageExporter = function () {


    var hiddenLayers = [];
    // 初期化
    this.init = function () {
    };

    // 出力
    this.export = function (e) {
        // 画像フォルダ作成
        createDirectoryUtil({path:dialogManager.getImageFolderPath()});

        var targetLayers = layerFilter.getLayers();

        for(var i = 0;i < targetLayers.length; i++){
            var layer = targetLayers[i];
            layer.visible = false;
        }

        _hideLayers({
            item:activeDocument
        });

        for(var i = 0; i < targetLayers.length; i++){
            _export(targetLayers[i]);
        }


        _revertHideLayers();
        for(var i = 0; i < targetLayers.length; i++){
            targetLayers[i].visible = true;
        }
    };

    // レイヤー非表示
    function _hideLayers(e) {
        var item = e.item;
        //alert(JSON.stringify(item));
        // レイヤー
        var length = item.artLayers.length;
        for (var i = 0; i < length; i++) {
            var artLayer = item.artLayers[ i ];
            if(artLayer.visible){
                artLayer.visible = false;
                hiddenLayers.push(artLayer);
            }
        }
        // レイヤーセット
        var length = item.layerSets.length;
        for (var i = 0; i < length; i++) {
            var layerSet = item.layerSets[ i ];
            // 再帰
            if( layerSet.visible) {
                _hideLayers({
                    item:layerSet
                });
            }
        }
    }

    // レイヤー非表示化を戻す
    function _revertHideLayers() {
        for( var i = 0; i < hiddenLayers.length; i++) {
            var layer = hiddenLayers[i];
            layer.visible = true;
        }
        hiddenLayers = [];
    }


    // 出力
    function _export(artLayer) {
        if (artLayer.typename == "LayerSet" || artLayer.kind == LayerKind.NORMAL) {


            // 表示
            artLayer.visible = true;

            // Web用保存して閉じる
            var optionObj = new ExportOptionsSaveForWeb();
            var color = getLayerColorUtil({name:artLayer.name});
            if (!color) {
                color = dialogManager.getOtherBgColor();
            }
            // マットカラー
            optionObj.matteColor = new RGBColor();
            optionObj.matteColor.hexValue = color;
            switch (getFileInfoFromFileNameUtil({name:artLayer.name}).type) {
                // PNG保存
                case FILE_KEY_PNG:
                    optionObj.format = SaveDocumentType.PNG;
                    optionObj.PNG8 = false;
                    optionObj.transparency = true;
                    optionObj.interlaced = false;
                    optionObj.optimized = true;
                    break;
                // JPEG保存
                case FILE_KEY_JPG:
                    optionObj.format = SaveDocumentType.JPEG;
                    optionObj.interlaced = false;
                    optionObj.optimized = true;
                    optionObj.quality = dialogManager.getJpegCompressRate();
                    break;
                // GIF保存
                case FILE_KEY_GIF:
                    optionObj.format = SaveDocumentType.COMPUSERVEGIF;
                    optionObj.transparency = true;
                    optionObj.colorReduction = ColorReductionType.ADAPTIVE;
                    optionObj.colors = 256;
                    optionObj.dither = Dither.DIFFUSION; // ディザーの種類
                    optionObj.ditherAmount = 100; // ディザーの割合
                    break;
            }
            var imageFileName = layerFilter.getSaveLayerName({name:artLayer.name}) + getFileInfoFromFileNameUtil({name:artLayer.name}).ext;
            var imageFilePath = getPathInfoImagesUtil().folderPathFull + "/" + layerFilter.getSaveLayerName({name:artLayer.name}) + getFileInfoFromFileNameUtil({name:artLayer.name}).ext;
            var fileObj = new File(imageFilePath);
            activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, optionObj);

            // 非表示
            artLayer.visible = false;
            artLayer.info.imageFileName = imageFileName;
        }
    }



};

//
// ----- 情報抽出
//
var InfoManager = function () {

    var _layerInfoArr;

    // 初期化
    this.init = function () {
        _layerInfoArr = [];
    };

    // 抽出
    this.extract = function (e) {
        _extract({
            item:activeDocument,
            infoArr:_layerInfoArr,
            top:0,
            left:0
        });
    };

    // レイヤー情報取得
    this.getLayerInfo = function () {
        return _layerInfoArr;
    };

    // 抽出
    function _extract(e) {
        var item = e.item;
        var infoArr = e.infoArr;
        var left = e.left;
        var top = e.top;
        var length = item.layers.length;
        for (var i = 0; i < length; i++) {
            var layer = item.layers[ i ];
            var layoutInfoObj = null;
            var totalInfoObj = null;
            var layerName = layer.name;//layerFilter.getSaveLayerName({name:layer.name});
            if (layer.kind == LayerKind.NORMAL) {
                if (String(layer.name).charAt(0) == OPTION_KEY_BGIMAGE) {
                    // 背景レイヤー
                    layoutInfoObj = _getLayoutInfo({item:layer});
                    totalInfoObj = {
                        type:TYPE_KEY_BG,
                        name:layerName,
                        top:layoutInfoObj.top - top,
                        left:layoutInfoObj.left - left,
                        width:layoutInfoObj.width,
                        height:layoutInfoObj.height,
                        file:getFileInfoFromFileNameUtil({name:layer.name}).type,
                        text:null,
                        alt: "",
                        color: getLayerColorUtil({name:layer.name})
                    };
                    infoArr.push(totalInfoObj);
                } else {
                    // 通常レイヤー
                    layoutInfoObj = _getLayoutInfo({item:layer});
                    totalInfoObj = {
                        type:TYPE_KEY_NORMAL,
                        name:layerName,
                        top:layoutInfoObj.top - top,
                        left:layoutInfoObj.left - left,
                        width:layoutInfoObj.width,
                        height:layoutInfoObj.height,
                        file:getFileInfoFromFileNameUtil({name:layer.name}).type,
                        text:null,
                        alt: getLayerAltUtil({name:layer.name}),
                        color: getLayerColorUtil({name:layer.name})
                    };
                    infoArr.push(totalInfoObj);
                }
            } else if (layer.kind == LayerKind.TEXT) {
                // テキストレイヤー
                layoutInfoObj = _getLayoutInfo({item:layer});
                var size = null;
                var align = null;
                var color = null;
                var bold = false;
                var italic = false;
                try {
                    if (layer.textItem.size) {
                        size = String(layer.textItem.size).replace(" pt", "px");
                    }
                } catch(e) {
                }
                try {
                    if (layer.textItem.justification) {
                        align = layer.textItem.justification;
                    }
                } catch(e) {
                }
                try {
                    if (layer.textItem.color.rgb.hexValue) {
                        color = "#" + layer.textItem.color.rgb.hexValue;
                    }
                } catch(e) {
                }
                try {
                    if (layer.textItem.fauxBold) {
                        bold = layer.textItem.fauxBold;
                    }
                } catch(e) {
                }
                try {
                    if (layer.textItem.fauxItalic) {
                        italic = layer.textItem.fauxItalic;
                    }
                } catch(e) {
                }
                totalInfoObj = {
                    type:TYPE_KEY_TEXT,
                    name:layerName,
                    top:layoutInfoObj.top - top,
                    left:layoutInfoObj.left - left,
                    width:layoutInfoObj.width,
                    height:layoutInfoObj.height,
                    file:null,
                    text:{
                        contents:layer.textItem.contents,
                        size:size,
                        align:align,
                        color:color,
                        bold:bold,
                        italic:italic
                    },
                    alt: "",
                    color: getLayerColorUtil({name:layer.name})
                };
                infoArr.push(totalInfoObj);
            } else if (layer.kind == undefined) {
                // レイヤーセット
                layoutInfoObj = _getLayoutInfo({item:layer});
                totalInfoObj = {
                    type:TYPE_KEY_GROUP,
                    name:layerName,
                    top:layoutInfoObj.top - top,
                    left:layoutInfoObj.left - left,
                    width:layoutInfoObj.width,
                    height:layoutInfoObj.height,
                    file:null,
                    text:null,
                    alt: "",
                    color: getLayerColorUtil({name:layer.name})
                };
                infoArr.push(totalInfoObj);
                infoArr[layerName] = [];
                // 再帰
                _extract({
                    item:layer,
                    infoArr:infoArr[layerName],
                    top:layoutInfoObj.top,
                    left:layoutInfoObj.left
                });
            }
        }
    }

    // レイアウト情報を取得
    function _getLayoutInfo(e) {
        var item = e.item;
        // マスクが存在するかどうか
        if (hasChannelMaskByName(item.name) || hasVectorMaskByName(item.name)) {
            // レイヤーをアクティブにする
            activeDocument.activeLayer = item;
            // マスクを選択
            var idslct = charIDToTypeID( "slct" );
            var desc78 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref49 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idChnl = charIDToTypeID( "Chnl" );
            var idMsk = charIDToTypeID( "Msk " );
            ref49.putEnumerated( idChnl, idChnl, idMsk );
            desc78.putReference( idnull, ref49 );
            var idMkVs = charIDToTypeID( "MkVs" );
            desc78.putBoolean( idMkVs, false );
            executeAction( idslct, desc78, DialogModes.NO );
            // マスクの範囲を選択
            var idsetd = charIDToTypeID( "setd" );
            var desc79 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref50 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idfsel = charIDToTypeID( "fsel" );
            ref50.putProperty( idChnl, idfsel );
            desc79.putReference( idnull, ref50 );
            var idT = charIDToTypeID( "T   " );
            var ref51 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref51.putEnumerated( idChnl, idOrdn, idTrgt );
            desc79.putReference( idT, ref51 );
            executeAction( idsetd, desc79, DialogModes.NO );
            // 選択範囲を抽出
            var arr = activeDocument.selection.bounds;
            var x1 = parseInt(arr[0]);
            var y1 = parseInt(arr[1]);
            var x2 = parseInt(arr[2]);
            var y2 = parseInt(arr[3]);
        } else {
            var bounds = item.bounds;
            var x1 = parseInt(bounds[0]);
            var y1 = parseInt(bounds[1]);
            var x2 = parseInt(bounds[2]);
            var y2 = parseInt(bounds[3]);
        }
        var top = y1;
        if (top < 0) top = 0;
        var left = x1;
        if (left < 0) left = 0;
        var width = x2 - x1;
        if (width < 0) width = 0;
        var height = y2 - y1;
        if (height < 0) height = 0;
        return {
            top:top,
            left:left,
            width:width,
            height:height
        };
    }

    function _traceInfoArr(e) {
        var arr = e.arr;
        var length = arr.length;
        for (var i = 0; i < length; i++) {
            alert(arr[i].name);
            if (arr[i].type == TYPE_KEY_GROUP) {
                // 再帰処理
                _traceInfoArr({arr:arr[arr[i].name]});
            }
        }
    }

};



//
// ==================== Action ==================== //
//

// 定数
var OPTION_KEY_BGIMAGE = "*"; // オプションキー（背景レイヤー）
var OPTION_KEY_ALT = "@"; // オプションキー（ALTタグ）
var OPTION_KEY_COLOR = "#"; // オプションキー（背景色）
var INDENT_VALUE = "    "; // Jadeのインデント使用文字
var TYPE_KEY_BG = "bg"; // タイプキー（背景レイヤー）
var TYPE_KEY_NORMAL = "normal"; // タイプキー（通常レイヤー）
var TYPE_KEY_TEXT = "text"; // タイプキー（テキストレイヤー）
var TYPE_KEY_GROUP = "group"; // タイプキー（レイヤーセット）
var FILE_KEY_PNG = "png"; // ファイルキー（PNG）
var FILE_KEY_JPG = "jpg"; // ファイルキー（JPEG）
var FILE_KEY_GIF = "gif"; // ファイルキー（GIF）
var HTML_KEY_HTML5 = "html5"; // HTMLキー（html5）
var HTML_KEY_XHTML = "xhtml"; // HTMLキー（xhtml）
var HTML_KEY_HTML4 = "html4"; // HTMLキー（html4.01）
var HTML_KEY_JADE = "jade"; // HTMLキー（jade）
// インスタンス
var dialogManager = new DialogManager();
var errorChecker = new ErrorChecker();
var layerFilter = new LayerFilter();
var imageExporter = new ImageExporter();
// プロパティ
var exportRoot; // 出力先ルートディレクトリ


try {
    // 初期化
    initEvent();
    // ダイアログ開く
    openDialogEvent();
}catch(e) {
    alert(e);
}

//
// ==================== Event ==================== //
//

//
// ----- 初期化
//
function initEvent(e) {
    try{
        // プロパティ初期化
        exportRoot = activeDocument.path + "/" + String(activeDocument.name).substring(0, String(activeDocument.name).length - 4);
        // インスタンス初期化
        dialogManager.init();
        errorChecker.init();
        imageExporter.init();
    }catch(e) {
        alert(e);
    }
}

//
// ----- ダイアログ開く
//
function openDialogEvent(e) {
    // ダイアログ開く
    dialogManager.open();
}

//
// ----- エラーチェック
//
function checkErrorEvent(e) {
    // エラーチェック
    errorChecker.check();
}

//
// ----- 書き出し開始
//
function startExportEvent(e) {
    // ルートフォルダ作成
    try{
        var folderObj = new Folder(exportRoot);
        folderObj.create();
        // 画像出力
        imageExporter.export();
    
        // 書き出し終了イベント
        completeExportEvent();
    } catch (e) {
        alert(e);
    }
}

//
// ----- 書き出し終了
//
function completeExportEvent(e) {
    alert("終了しました。");
}

//
// ==================== Util ==================== //
//

//
// ----- 画像パス情報取得
//
function getPathInfoImagesUtil(e) {
    var folderPathFull = "";
    var folderPathHtml = "";
    var folderPathCss = "";
    if (dialogManager.getImageFolderPath() == "") {
        folderPathFull = exportRoot;
        folderPathHtml = dialogManager.getRootPathFromHtml();
        folderPathCss = dialogManager.getRootPathFromCss();
    } else {
        folderPathFull = exportRoot + "/" + dialogManager.getImageFolderPath();
        folderPathHtml = dialogManager.getRootPathFromHtml() + dialogManager.getImageFolderPath() + "/";
        folderPathCss = dialogManager.getRootPathFromCss() + dialogManager.getImageFolderPath() + "/";
    }
    return {
        folderPathFull:folderPathFull,
        folderPathHtml:folderPathHtml,
        folderPathCss:folderPathCss
    };
}

//
// ----- HTMLパス情報取得
//
function getPathInfoHtmlUtil(e) {
    var fullPath = "";
    var folderPath = "";
    var fileName = "";
    var srcPath = "";
    var ext = "";
    if (dialogManager.getHtmlDoctype() != HTML_KEY_JADE) {
        ext = ".html";
    } else {
        ext = ".jade";
    }
    if (dialogManager.getHtmlFolderPath() == "") {
        fullPath = exportRoot + "/" + dialogManager.getHtmlFileName() + ext;
        folderPath = exportRoot;
        fileName = dialogManager.getHtmlFileName() + ext;
        srcPath = dialogManager.getRootPathFromHtml() + dialogManager.getHtmlFileName() + ext;
    } else {
        fullPath = exportRoot + "/" + dialogManager.getHtmlFolderPath() + "/" + dialogManager.getHtmlFileName() + ext;
        folderPath = exportRoot + "/" + dialogManager.getHtmlFolderPath();
        fileName = dialogManager.getHtmlFileName() + ext;
        srcPath = dialogManager.getRootPathFromHtml() + dialogManager.getHtmlFolderPath() + "/" + dialogManager.getHtmlFileName() + ext;
    }
    return {
        fullPath:fullPath,
        folderPath:folderPath,
        fileName:fileName,
        srcPath:srcPath
    };
}

//
// ----- CSSパス情報取得
//
function getPathInfoCssUtil(e) {
    var fullPath = "";
    var folderPath = "";
    var fileName = "";
    var srcPath = "";
    if (dialogManager.getCssFolderPath() == "") {
        fullPath = exportRoot + "/" + dialogManager.getCssFileName() + ".css";
        folderPath = exportRoot;
        fileName = dialogManager.getCssFileName() + ".css";
        srcPath = dialogManager.getRootPathFromHtml() + dialogManager.getCssFileName() + ".css";
    } else {
        fullPath = exportRoot + "/" + dialogManager.getCssFolderPath() + "/" + dialogManager.getCssFileName() + ".css";
        folderPath = exportRoot + "/" + dialogManager.getCssFolderPath();
        fileName = dialogManager.getCssFileName() + ".css";
        srcPath = dialogManager.getRootPathFromHtml() + dialogManager.getCssFolderPath() + "/" + dialogManager.getCssFileName() + ".css";
    }
    return {
        fullPath:fullPath,
        folderPath:folderPath,
        fileName:fileName,
        srcPath:srcPath
    };
}



//
// ----- ALT値取得
//
function getLayerAltUtil(e) {
    var str = (e) ? e.name : "";
    var index = String(str).indexOf(OPTION_KEY_ALT);
    if (1 <= index) {
        str = String(str).substr(index + 1, String(str).length - 1);
        index = String(str).indexOf(OPTION_KEY_COLOR);
        if (1 <= index) {
            return String(str).substr(0, index);
        } else {
            return str;
        }
    } else {
        return "";
    }
}

//
// ----- 背景色取得
//
function getLayerColorUtil(e) {
    var str = (e) ? e.name : "";
    var index = String(str).indexOf(OPTION_KEY_COLOR);
    if (1 <= index) {
        str = String(str).substr(index + 1, String(str).length - 1);
        index = String(str).indexOf(OPTION_KEY_ALT);
        if (1 <= index) {
            str = String(str).substr(0, index);
        }
        return getHexColorTextUtil(str);
    } else {
        return null;
    }
}

//
// ----- ファイルタイプから拡張子取得
//
function getExtFromFileTypeUtil(e) {
    var str = (e || e.file) ? e.file : dialogManager.getDefaultFileType();
    switch (str) {
        case FILE_KEY_PNG:
            return ".png";
            break;
        case FILE_KEY_JPG:
            return ".jpg";
            break;
        case FILE_KEY_GIF:
            return ".gif";
            break;
    }
}

//
// ----- ファイル名から拡張子取得
//
function getFileInfoFromFileNameUtil(e) {
    var str = String(e.name);
    if (0 < str.lastIndexOf(".png")) {
        return {
            type:FILE_KEY_PNG,
            ext:".png"
        };
    } else if (0 < str.lastIndexOf(".jpg")) {
        return {
            type:FILE_KEY_JPG,
            ext:".jpg"
        };
    } else if (0 < str.lastIndexOf(".gif")) {
        return {
            type:FILE_KEY_GIF,
            ext:".gif"
        };
    } else {
        return {
            type:dialogManager.getDefaultFileType(),
            ext:getExtFromFileTypeUtil({file:dialogManager.getDefaultFileType()})
        };
    }
}

//
// ----- ディレクトリ作成
//
function createDirectoryUtil(e) {
    // 画像フォルダ作成
    var path = e.path;
    var depth = 0;
    var directory = exportRoot;
    var arr = null;
    if (path != "") {
        arr = String(path).split("/");
        depth = arr.length;
    }
    if (0 < depth) {
        for (var i = 0; i < depth; i++) {
            directory += "/" + arr[i];
            var folderObj = new Folder(directory);
            folderObj.create();
        }
    }
    return folderObj;
}

//
// ----- レイヤーにチャンネルマスクが存在するかどうか
//
function hasChannelMaskByName(name){
    var ref = new ActionReference();
    ref.putName(charIDToTypeID("Lyr "), name);
    return executeActionGet(ref).getBoolean(stringIDToTypeID("hasUserMask"));
}

//
// ----- レイヤーにベクターマスクが存在するかどうか
//
function hasVectorMaskByName(name){
    var ref = new ActionReference();
    ref.putName(charIDToTypeID("Lyr "), name);
    return executeActionGet(ref).getBoolean(stringIDToTypeID("hasVectorMask"));
}

//
// ----- HexColorを取り出す
//
function getHexColorTextUtil(value) {
    var str = String(value).replace("#", "");
    str = String(/[0-9A-Fa-f]{6}/g.exec(str));
    if (!str) {
        str = "ffffff";
    }
    return str;
}
