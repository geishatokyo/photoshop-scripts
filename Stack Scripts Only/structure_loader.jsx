

var ComponentType = {
    Panel : "Panel",
    Text : "Text",
    Image: "Image",
    Button: "Button",
    ListView: "ListView",
    ListViewItem: "ListViewItem",
    CheckBox: "CheckBox",
    Window: "Window",
    InputText: "InputText",

    None : "None"
};


var StructureLoader = function() {

    this.load = function(e) {
        return _loadRoot(activeDocument);
    }

    function _loadRoot(doc) {

        var children = [];
        var _window = {
            type: "Window",
            width: doc.width.as(g_SizeUnit),
            height: doc.height.as(g_SizeUnit),
            children : children
        };

        for(var i = 0;i < doc.layers.length;i++) {
            var l = doc.layers[i];
            _loadLayer(_window, l);
        }

        _reposition(_window);

        return _window;

    }

    function _loadLayer(parent, layer) {
        if( !layer.visible) return null;

        var nameObj = nameRule.parseName(layer.name);
        if(nameObj == null) {
            if( layer.typename == "LayerSet"){
                for(var i = 0;i < layer.layers.length;i++) {
                    var l = layer.layers[i];
                    _loadLayer(parent, l);
                }
            }
            return;
        }

        var componentType = typeGuesser.guess(layer);

        if(componentType == ComponentType.None){
            return;
        }else {
            var obj = {
                type : componentType,
                layer : layer
            };
            _setCommonProps(obj, layer);

            switch(componentType) {
                case ComponentType.Text:
                    _setTextProps(obj, layer);
                break;
                case ComponentType.ListView:
                    obj.children = [];
                    _setListViewProps(obj, layer);
                break;
                case ComponentType.ListViewItem:
                case ComponentType.Panel:
                    obj.children = [];
                    for(var i = 0;i < layer.layers.length;i++) {
                        var l = layer.layers[i];
                        _loadLayer(obj, l);
                    }
                    _findTextLayers(obj, layer);
                break;
                case ComponentType.Button:
                case ComponentType.Image:
                case ComponentType.InputText:
                    _findTextLayers(obj, layer);
                break;
                case ComponentType.None:
                    return;
                break;
                default:
                break;
            }

            parent.children.push(obj);

        }
    }

    /**
      共通の要素を設定する
    */
    function _setCommonProps(obj, layer){

        // name
        var nameObj = nameRule.parseName(layer.name);
        if(nameObj != null){
            obj.name = nameObj.name;
        }

        // position
        var bounds = layer.bounds;
        var left = bounds[0].as(g_SizeUnit);
        var top = bounds[1].as(g_SizeUnit);
        var right = bounds[2].as(g_SizeUnit);
        var bottom = bounds[3].as(g_SizeUnit);
        obj.x = left;
        obj.y = top;
        obj.width = right - left;
        obj.height = bottom - top;

        return obj;
    }

    /**
      Textに関する要素を設定する
    */
    function _setTextProps(obj, layer) {
        // TextLayerの場合は、素直に設定
        if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            var textItem = layer.textItem;

            obj.text = textItem.contents;
            obj.fontSize = textItem.size.as(g_SizeUnit);
            obj.layer = layer;

        }else if(layer.typename == "LayerSet"){
            // LayerSetがTextとして扱われている場合は、
            // 一番最初のテキスト要素をテキスト情報として取得する
            var firstTextLayer = null;

            for(var i = 0;i < layer.layers.length; i++){
                var l = layer.layers[i];
                if(l.typename == "ArtLayer" && l.kind == LayerKind.TEXT){
                    firstTextLayer = l;
                    break;
                }
            } 
            if(firstTextLayer != null){
                _setTextProps(obj, firstTextLayer);
            }else {
                throw new Error("No TextLayer in LayerSet:" + layer.name);
            }

        }
    }
    
    /**
      ListViewに関係する要素を設定する
     */
    function _setListViewProps(obj, layer) {
        for(var i = 0;i < layer.layers.length; i++){
            var l = layer.layers[i];
            _loadLayer(obj, l);
        }

        var listViewItem = null;
        for(var i = 0;i < obj.children.length;i++){
            var child = obj.children[i];
            if(child.type == ComponentType.ListViewItem) {
                listViewItem = child;
                break;
            }
        }
        if(listViewItem == null){
            for(var i = 0;i < obj.children.length;i++){
                var child = obj.children[i];
                if(child.type == ComponentType.Panel) {
                    listViewItem = child;
                    break;
                }
            }
        }
        if(listViewItem == null){
            if(obj.children.length > 0){
                listViewItem = obj.children[0];
            }
        } 

        if(listViewItem == null) {
            throw new Error("No ListViewItem in ListView:" + layer.name);
        }

        obj.listViewItem = listViewItem;

        // ListViewItemの要素を画像に取り込まないようにする
        var ignoreLayers = [];
        for(var i = 0;i < obj.children.length;i++){
            ignoreLayers.push(obj.children[i].layer);
        }
        obj.ignoreLayers = ignoreLayers;

        obj.children = null;
        delete(obj.children);


    }

    /*
     子レイヤーに含まれるText要素を、子要素としてぶら下げる
     */
    function _findTextLayers(obj, layer) {

        if(layer.typename == "LayerSet"){
            var children = [];
            var variableIndex = 0;
            for(var i = 0; i < layer.layers.length; i++) {
                var l = layer.layers[i];
                if(l.typename == "ArtLayer" && l.kind == LayerKind.TEXT){

                    var n = nameRule.parseName(l.name);

                    var name = null;
                    if( n != null){
                        name = n.name;
                    }else {
                        // 名前が設定されていない場合は、親の名前＋Label＋連番
                        name = obj.name + "Label";
                        if(variableIndex > 0){
                            name += variableIndex;
                        }
                        variableIndex += 1;
                    }

                    var label = {
                        type: ComponentType.Text,
                        name: name,
                        layer: l
                    };
                    _setCommonProps(label, l);
                    _setTextProps(label, l);
                    children.push(label);
                }
            }

            if(children.length > 0){
                obj.children = children;
            }
        }else if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            _setTextProps(obj,layer);
        }
    }

    /*
     Positionが絶対値なので、親からの相対位置に変更する
    */
    function _reposition(structure) {
        for(var i = 0;i < structure.children.length;i++){
            var child = structure.children[i];
            _setOffset(null, child);
        }
    }

    /*
     Offset化を再帰的に行う
     */
    function _setOffset(parent, my) {
        if(my.children){
            for(var i = 0;i < my.children.length;i++){
                var child = my.children[i];
                _setOffset(my, child);
            }
        }
        if(my.listViewItem) {
            _setOffset(my, my.listViewItem);
        }

        if(parent != null){
            var newX = my.x - parent.x;
            var newY = my.y - parent.y;
            my.x = newX;
            my.y = newY;
        }   
    }


}



var NameRule = function() {
    this.parseName = function(layerName) {
        if(layerName.name) {
            layerName = layerName.name;
        }

        var i = layerName.indexOf("?");

        var parsedObject = {};

        if(i >= 0) {
            var queryStr = layerName.substring(i + 1);
            layerName = layerName.substring(0,i);

            var query = {};
            var splits = queryStr.split("&");
            for(var i = 0;i < splits.length; i++) {
                var kv = splits[i].split("=")
                query[kv[0]] = kv[1]
            }
            parsedObject.query = query;

        }else{
            parsedObject.query = {};
        }


        i = layerName.indexOf("@");
        if(i < 0) {
            return null;
        }

        parsedObject.name = layerName.substring(i + 1); 

        return parsedObject;
    }
};

var TypeGuesser = function() {

    var ButtonNames = [
        "button",
        "btn",
        "ボタン"
    ];

    var PanelNames = [
        "panel",
        "パネル"
    ];
    var ListViewItemNames = [
        "listitem",
        "list_item",
        "list_view_item",
        "listviewitem"
    ];
    var InputTextNames = [
        "input",
        "textarea",
        "text_area",
        "入力"
    ];

    var ListViewNames = [
        "list",
        "list_view",
        "リスト"
    ];
    var CheckBoxNames = [
        "checkbox",
        "チェックボックス"
    ];

    var TypeChecks = [
        [ButtonNames, ComponentType.Button],
        [PanelNames, ComponentType.Panel],
        [InputTextNames, ComponentType.InputText],
        [ListViewItemNames, ComponentType.ListViewItem],
        [ListViewNames, ComponentType.ListView],
        [CheckBoxNames, ComponentType.CheckBox]
    ];

    var self = this;

    this.defaultComponentType = ComponentType.Image;

    this.guess = function(layer) {
        var nameObj = nameRule.parseName(layer.name);
        if(nameObj == null) return ComponentType.None;

        if(nameObj.query.type != undefined){
            return nameObj.query.type;
        }

        if(layer.kind == LayerKind.TEXT) {
            return ComponentType.Text;
        }

        for(var i = 0;i < TypeChecks.length; i++){
            var t = TypeChecks[i];
            if(_containsOne(layer.name, t[0])){
                return t[1];
            }
        }

        return self.defaultComponentType;
    };
    function _containsOne(str, candidates) {
        str = str.toLowerCase();
        for(var i in candidates){
            var cand = candidates[i];
            if(str.indexOf(cand) >= 0){
                return true;
            }
        }
        return false;
    }


};


var nameRule = new NameRule();
var typeGuesser = new TypeGuesser();
var structureLoader = new StructureLoader();

