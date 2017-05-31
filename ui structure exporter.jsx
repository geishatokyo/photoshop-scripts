

$.level = 1;
$.localize = true;

versionOfScript = "1.0.2";

// Load libraries

var g_LibFolderPath = new File($.fileName).path + "/Stack Scripts Only/";

$.evalFile(new File(g_LibFolderPath + "util.jsx"));
$.evalFile(new File(g_LibFolderPath + "serialize.jsx"));
$.evalFile(new File(g_LibFolderPath + "image_exporter.jsx"));
$.evalFile(new File(g_LibFolderPath + "structure_loader.jsx"));
$.evalFile(new File(g_LibFolderPath + "setting_dialog.jsx"));

var g_SizeUnit = "px";



var UIStructureExporter = function(setting){


    this.export = function() {
        log("Start parse structure");
        var structure = structureLoader.load();
        log("Validate names");
        layerNameValidator.fixAll(structure);

        imageExporter.dontExportTextLayer = !setting.includeTextToImage;
        log("Start exporting pngs");
        _exportPNGs(structure);
        if(setting.exportStructure) {
            log("Start exporting structure.json");
            var jsonPath = pathSetting.exportDir + "/structure.json";
            saveToJsonFile(jsonPath, copyExcluding(structure, ["meta"]));
        }

    }
    function _getExportFunction(node) {
        if(setting.exportImage){
            if(!setting.exportOnlySelectedLayers){
                return imageExporter.exportAsPNG;
            }else{
                if(_isSelectedLayer(node.meta.layer)){
                    return imageExporter.exportAsPNG;
                }else{
                    return imageExporter.getImagePath;
                }
            }
        } else {
            return imageExporter.getImagePath;
        }
    }
    function _isSelectedLayer(layer) {
        var selected = app.activeDocument.activeLayer;
        return _foreachLayer(selected, function(l) {
            if(l == layer){
                return true;
            }else {
                return false;
            }
        });
    }

    function _foreachLayer(layer, func) {
        var b = func(layer);
        if(b){
            return true;
        }
        if(layer.typename == "LayerSet"){
            for(var i = 0;i < layer.length;i ++){
                var l = layer[i];
                var b = _foreachLayer(l, func);
                if(b){
                    return true;
                }
            }
        }
        return false;
    }


    function _exportPNGs(node) {
        switch(node.type) {
            case ComponentType.Image:
            case ComponentType.Button:
            case ComponentType.InputText:
                var exportFunc = _getExportFunction(node);
                var imagePath = exportFunc(node.name, node.meta.layer, node.meta.invisibleLayers);
                if(imagePath != null) node.image = imagePath.name;
                
                if(node.children){
                    for(var i = 0; i < node.children.length; i++) {
                        var c = node.children[i];
                        _exportPNGs(c);
                    }
                }
            break;
            case ComponentType.Panel:
            case ComponentType.Window:
                if(node.children){
                    for(var i = 0; i < node.children.length; i++) {
                        var c = node.children[i];
                        _exportPNGs(c);
                    }
                }
            break;
            case ComponentType.ListView:
                // ListViewの背景を出力
                // ListViewItemの要素は描画しない
                var exportFunc = _getExportFunction(node);
                var imagePath = exportFunc(node.name, node.meta.layer, node.meta.invisibleLayers);
                if(imagePath != null) node.image = imagePath.name;

                // ListViewItemの要素の描画を行う
                _exportPNGs(node.listViewItem);

                if(node.children) node.children.foreach(function(c){
                    _exportPNGs(c);
                });


            break;
            case ComponentType.ListViewItem:
                var exportFunc = _getExportFunction(node);
                var imagePath = exportFunc(node.name, node.meta.layer, node.meta.invisibleLayers);
                if(imagePath != null) node.image = imagePath.name;

                for(var i = 0; i < node.children.length; i++) {
                    var c = node.children[i];
                    _exportPNGs(c);
                }

            break;
            default:
                
            break;
        }
    };

}

function showSettingDialog(func) {
    var dialog = new SettingDialog("UI配置ファイル書き出し");
    dialog.addCheckbox("exportImage","画像を書き出す",true);
    dialog.addCheckbox("exportStructure","UI配置ファイルを書き出す",true);
    dialog.withPanel("詳細設定", function(){
        dialog.addCheckbox("includeTextToImage","TextLayerも画像に含める", false);
    });
    dialog.withPanel("実行モード",function(){
        dialog.addCheckbox("exportOnlySelectedLayers","アクティブレイヤーだけを出力する", false);
    });

    dialog.show(onDialogClosed);

}

function onDialogClosed(ok, setting) {
    if(ok) {
        var uIStructureExporter = new UIStructureExporter(setting);
        try{
            uIStructureExporter.export();
            alert("完了");
            log("Success");
        }catch(e){
            alert("生成失敗:" + e);
            log("Error " + e);
            throw e;
        }
    }
}


function main() {
    clearLog();
    log("Version " + versionOfScript);
    showSettingDialog();
}




main();


