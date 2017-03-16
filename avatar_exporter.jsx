

$.level = 1;
$.localize = true;

// Load libraries

var g_LibFolderPath = new File($.fileName).path + "/Stack Scripts Only/";

$.evalFile(new File(g_LibFolderPath + "util.jsx"));
$.evalFile(new File(g_LibFolderPath + "serialize.jsx"));
$.evalFile(new File(g_LibFolderPath + "image_exporter.jsx"));
$.evalFile(new File(g_LibFolderPath + "structure_loader.jsx"));

var g_SizeUnit = "px";

var ExportImages = false;


var AvatarExporter = function(){

    var exportAsPNG = null;


    var exportAsPNG = undefined;
    if(ExportImages) {
        exportAsPNG = imageExporter.exportAsPNG;
    }else{
        exportAsPNG = imageExporter.getImagePath;
    }

    this.exportPNGs = _exportPNGs;

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


function main() {
    var avatarExporter = new AvatarExporter();
    var structure = structureLoader.load();
    // alert(JSON.stringify(copyExcluding(structure, ["layer","ignoreLayers"])));

    avatarExporter.exportPNGs(structure);
    var jsonPath = pathSetting.exportDir + "/structure.json";
    saveToJsonFile(jsonPath, copyExcluding(structure, ["layer","ignoreLayers"]));

    alert("完了");

}


main();


