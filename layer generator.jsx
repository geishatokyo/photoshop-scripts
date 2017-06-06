

$.level = 1;
$.localize = true;

versionOfScript = "0.0.1";

// Load libraries

var g_LibFolderPath = new File($.fileName).path + "/Stack Scripts Only/";

$.evalFile(new File(g_LibFolderPath + "util.jsx"));
$.evalFile(new File(g_LibFolderPath + "io.jsx"));
$.evalFile(new File(g_LibFolderPath + "serialize.jsx"));
$.evalFile(new File(g_LibFolderPath + "setting_dialog.jsx"));

var confFileDir = new File($.fileName).path + "/conf/layer_gen/";


var listOfConfigFiles = [
    ["Avatar_00001_re_55_v1_00001", "Avatar_00001_re_55_v1_00001"],
    ["Avatar_00001_re_55_v1_00002", "Avatar_00001_re_55_v1_00002"],
    ["Avatar_00001_re_55_v1_00003", "Avatar_00001_re_55_v1_00003"],
    ["Avatar_00001_re_55_v1_chibi", "Avatar_00001_re_55_v1_chibi"],
    ["Avatar_00001_re_55_v1_debu", "Avatar_00001_re_55_v1_debu"],
    ["Avatar_00001_re_55_v1_hoso", "Avatar_00001_re_55_v1_hoso"],
    ["Kinpo", "kinpo.txt"],
    ["サンプル", "sample.txt"]
];

var dropDownTexts = listOfConfigFiles.map(function(e) {
    return e[0];
});

var nameListFiles = listOfConfigFiles.map(function(e) {
    return e[1];
});

function showSettingDialog()
{
    
    var dialog = new SettingDialog("必要Layer自動生成");

    dialog.addDropdownList("layerNameListIndex","レイヤーリスト",dropDownTexts, 0);
    dialog.addShortText("exportDestination", "出力先レイヤーセット", "Save");

    dialog.show(onDialogClosed);
}

function onDialogClosed(ok, setting)
{
    if(ok) {
        try{
            layerMaker.exportDestination = setting.exportDestination;
            layerMaker.layerNames = loadList(getPath(setting.layerNameListIndex));
            layerMaker.generate();
            
            alert("完了");
            log("Success!");
        } catch(e){
            log(e);
            alert(e);
            log("Failed!");
        }

    } else {
        log("Canceled");
    }
}

function getPath(layerNameListIndex)
{
    if(nameListFiles.length <= layerNameListIndex){
        return confFileDir + nameListFiles[0];
    } else {
        var name = nameListFiles[layerNameListIndex];
        return confFileDir + name;
    }
}

function loadList(path) {
    log("Load list " + path);
    return readToLines(path).filter(function(s){
        return s.length > 0 && !s.startsWith("#");
    });
}


var LayerMaker = function()
{

    this.exportDestination = "Save";
    this.layerNames = [];
    var self = this;

    function findExportDestinationLayerSet() {
        return _findRec(app.activeDocument.layerSets);
    }
    function _findRec(layerSets) {
        for(var i = 0;i < layerSets.length; i++) {
            var l = layerSets[i];
            if(l.name == self.exportDestination) {
                log("Find LayerSet:" + l.name);
                return l;
            } else {
                _findRec(l);
            }
        }
        return null;
    }


    function listUpExistLayers(layerSet) 
    {
        var layerNameSet = {};
        _listUp(layerNameSet, layerSet );
        return layerNameSet;
    }
    function _listUp(layerSet, layer)
    {
        if(layer.layers){
            for(var i = 0;i < layer.layers.length; i++) {
                _listUp(layerSet, layer.layers[i]);
            }
        } else {
            layerSet[layer.name] = 1;
        }
    }

    this.generate = function()
    {
        var dest = findExportDestinationLayerSet();
        if(dest == null) {
            log("Can' find destination LayerSet:" + self.exportDestination);
            return false;
        }

        var layerNames = self.layerNames;
        var existLayers = listUpExistLayers(dest);

        var notExists = [];
        for(var i = 0;i < layerNames.length;i ++){
            var name = layerNames[i];
            if(existLayers[name] != 1){
                notExists.push(name);
            }
        }
        for(var i = 0;i < notExists.length;i++){
            var name = notExists[i];
            var newLayer = dest.artLayers.add();
            newLayer.name = name;
            log("Create new layer:" + name);
        }

        var names = {};
        for(var i = 0;i < layerNames.length;i ++){
            names[layerNames[i]] = 1;
        }

        log("----- Not listed layers -----");
        for(var k in existLayers){
            if(names[k] != 1) {
                log(k);
            }
        }
        log("-----------------------------");

    }
};


var layerMaker = new LayerMaker();

function main()
{
    clearLog();
    log("Script version = " + versionOfScript);
    showSettingDialog();

}

main();

