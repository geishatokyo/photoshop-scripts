

$.level = 1;
$.localize = true;

// Load libraries

var g_LibFolderPath = new File($.fileName).path + "/Stack Scripts Only/";

$.evalFile(new File(g_LibFolderPath + "util.jsx"));
$.evalFile(new File(g_LibFolderPath + "serialize.jsx"));
$.evalFile(new File(g_LibFolderPath + "image_exporter.jsx"));
$.evalFile(new File(g_LibFolderPath + "structure_loader.jsx"));

var g_SizeUnit = "px";


function exportPNGs(node) {

    switch(node.type) {
        case ComponentType.Image:
        case ComponentType.Button:
            var imagePath = imageExporter.exportAsPNG(node.name, node.layer);
        break;
        case ComponentType.Panel:
        case ComponentType.Window:
            for(var i = 0; i < node.children.length; i++) {
                var c = node.children[i];
                exportPNGs(c);
            }
        break;
        case ComponentType.ListView:
        break;
        default:

        break;
    }
}



function main() {

    var structure = structureLoader.load();
    // alert(JSON.stringify(copyExcluding(structure, ["layer","ignoreLayers"])));

    //exportPNGs(structure);
    var jsonPath = pathSetting.exportDir + "/structure.json";
    saveToJsonFile(jsonPath, copyExcluding(structure, ["layer","ignoreLayers"]));

    alert("完了");

}


main();


