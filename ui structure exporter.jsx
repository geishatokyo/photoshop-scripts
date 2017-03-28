

$.level = 1;
$.localize = true;

// Load libraries

var g_LibFolderPath = new File($.fileName).path + "/Stack Scripts Only/";

$.evalFile(new File(g_LibFolderPath + "util.jsx"));
$.evalFile(new File(g_LibFolderPath + "serialize.jsx"));
$.evalFile(new File(g_LibFolderPath + "image_exporter.jsx"));
$.evalFile(new File(g_LibFolderPath + "structure_loader.jsx"));
$.evalFile(new File(g_LibFolderPath + "setting_dialog.jsx"));

var g_SizeUnit = "px";



var UIStructureExporter = function(setting){

    var exportAsPNG = undefined;

    this.export = function() {
        var structure = structureLoader.load();
        if(setting.exportImage) {
            exportAsPNG = imageExporter.exportAsPNG;
        }else{
            exportAsPNG = imageExporter.getImagePath;
        }

        imageExporter.dontExportTextLayer = !setting.includeTextToImage;

        _exportPNGs(structure);
        if(setting.exportStructure) {
            var jsonPath = pathSetting.exportDir + "/structure.json";
            saveToJsonFile(jsonPath, copyExcluding(structure, ["layer","ignoreLayers"]));
        }

    }


    function _exportPNGs(node) {

        switch(node.type) {
            case ComponentType.Image:
            case ComponentType.Button:
                var imagePath = exportAsPNG(node.name, node.layer, node.ignoreLayers);
                if(imagePath != null) node.image = imagePath.name;
            break;
            case ComponentType.Panel:
            case ComponentType.Window:
                for(var i = 0; i < node.children.length; i++) {
                    var c = node.children[i];
                    _exportPNGs(c);
                }
            break;
            case ComponentType.ListView:
                // ListViewの背景を出力
                // ListViewItemの要素は描画しない
                var imagePath = exportAsPNG(node.name, node.layer, node.ignoreLayers);
                if(imagePath != null) node.image = imagePath.name;

                // ListViewItemの要素の描画を行う
                _exportPNGs(node.listViewItem);

                if(node.children) node.children.foreach(function(c){
                    _exportPNGs(c);
                });


            break;
            case ComponentType.ListViewItem:
                var imagePath = exportAsPNG(node.name, node.layer, node.ignoreLayers);
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

    dialog.addLabel("詳細設定");
    dialog.addCheckbox("includeTextToImage","TextLayerも画像に含める", false)

    dialog.show(onDialogClosed);

}

function onDialogClosed(ok, setting) {
    if(ok) {
        var uIStructureExporter = new UIStructureExporter(setting);
        uIStructureExporter.export();
        alert("完了");
    }
}


function main() {
    showSettingDialog();

}


main();


