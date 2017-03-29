

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

    VarText: "VarText",
    VarImage: "VarImage",

    None : "None"
};


var StructureLoader = function() {

    this.load = function(e) {
        return _loadRoot(activeDocument);
    };

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

        _postConstruction(_window);

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
                case ComponentType.VarText:
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
                case ComponentType.VarImage:
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
    function _setTextProps(obj, layer, isButtonText) {
        // TextLayerの場合は、素直に設定
        if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            var textItem = layer.textItem;

            obj.text = textItem.contents.replace("\r","\n");
            obj.fontSize = textItem.size.as(g_SizeUnit);
            obj.fontColor = textItem.color.rgb.hexValue;
            obj.layer = layer;

            if(isButtonText){
                obj.textAlign = "center";
            }

            // TextLayerは位置情報が微妙なので、再計算
            var newHeight = obj.fontSize * 1.5;
            var newWidth = obj.width * 2;
            var newY = obj.y + obj.height - obj.fontSize * 0.5 - newHeight * 0.5;
            if(obj.textAlign == "center"){
                var newX = obj.x + obj.width * 0.5 - newWidth * 0.5;
                obj.x = newX;
            }
            obj.y = newY;
            obj.height = newHeight;
            obj.width = newWidth;


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
                _setTextProps(obj, firstTextLayer, isButtonText);
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
        // ListViewItemが無い場合、一番はじめのPanel要素をListViewItemにする
        if(listViewItem == null){
            for(var i = 0;i < obj.children.length;i++){
                var child = obj.children[i];
                if(child.type == ComponentType.Panel) {
                    listViewItem = child;
                    break;
                }
            }
        }
        // Panelも無い場合、一番最初の子供要素をListViewItemにする
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

                    var componentType = ComponentType.Text;
                    if(typeGuesser.maybeVaribale(l)){
                        componentType = ComponentType.VarText;
                    }

                    var label = {
                        type: componentType,
                        name: name,
                        layer: l
                    };
                    _setCommonProps(label, l);
                    _setTextProps(label, l, obj.type == ComponentType.Button);
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
      構造構築化の処理
    */
    function _postConstruction(_window) {
        var components = [];
        enumerateElements(_window, components);


        findVariables(null, _window, components);
        _reposition(_window)

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


    /*
    変数に当たるものを見つける
    */
    function findVariables(parent, component, allComponents) {
        if(component.type == ComponentType.Text){
            // すぐ左側にTextが存在する場合は、変数の可能性が高い
            var lefts = _findLeftTexts(component, allComponents);
            if(lefts.length > 0 && lefts.length % 2 == 1){ // 連続する場合、ラベル、変数が連続するとして認識する
                component.type = ComponentType.VarText;
            }
        }
        if(component.children){
            for(var i = 0;i < component.children.length; i++){
                findVariables(component, component.children[i], allComponents);
            }
        }
        if(component.listViewItem){
            findVariables(component, component.listViewItem, allComponents);
        }

    }

    /*
     指定したコンポーネントの左側にあるY座標がだいたい同じ位置のTextコンポーネントを取得する
     */
    function _findLeftTexts(comp, components){
        var centerY = comp.y + comp.height * 0.5;

        var leftComponents = [];
        for(var i = 0;i < components.length; i++){
            var c = components[i];
            if( c.type != ComponentType.Text &&
                c.type != ComponentType.VarText){
                continue;
            }
            if( c.x >= comp.x){
                continue;
            }

            var _centerY = c.y + c.height * 0.5;
            if( Math.abs(_centerY - centerY) < 5) {
                leftComponents.push(c);
            }
        }
        /*leftComponents.sort(function(c){
            return c.x;
        });*/

        return leftComponents;
    }




    function enumerateElements(component, list) {
        list.push(component);
        if(component.children){
            for(var i = 0;i < component.children.length; i++){
                enumerateElements(component.children[i], list);
            }
        }
        if(component.listViewItem){
            enumerateElements(component.listViewItem, list);
        }
    }


};



var NameRule = function() {


    /*

    
      @return such {
        fullname: "レイヤー@layer?hoge=fuga",
        name: "layer",
        layerName: "レイヤー",
        query : {
          hoge: "fuga"
        }
      }
    */
    this.parseName = function(layerName) {
        if(layerName.name) {
            layerName = layerName.name;
        }
        var parsedObject = {
            fullname: layerName
        };

        // クエリのパース
        var i = layerName.indexOf("?");
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


        // 名前のパース
        i = layerName.indexOf("@");
        if(i < 0) {
            return null;
        }

        parsedObject.name = layerName.substring(i + 1); 
        parsedObject.layerName = layerName.substring(0,i);

        return parsedObject;
    };
};

var TypeGuesser = function() {

    var VarTextNames = [
        "vartext",
        "var_text"
    ];
    var VarImageNames = [
        "varimage",
        "var_image"
    ];

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
        "input_text",
        "inputtext",
        "textarea",
        "text_area",
        "入力"
    ];

    var ListViewNames = [
        "list",
        "list_view",
        "リスト",
        "listview"
    ];
    var CheckBoxNames = [
        "checkbox",
        "チェックボックス"
    ];

    var TypeChecks = [
        [VarTextNames, ComponentType.VarText],
        [VarImageNames, ComponentType.VarImage],
        [ButtonNames, ComponentType.Button],
        [PanelNames, ComponentType.Panel],
        [InputTextNames, ComponentType.InputText],
        [ListViewItemNames, ComponentType.ListViewItem],
        [ListViewNames, ComponentType.ListView],
        [CheckBoxNames, ComponentType.CheckBox]
    ];

    var VariableKeywords = [
        "変数",
        "variable"
    ];
    var VariableEndKeywords = [
        "name",
        "名前",
        "名",
        "thumb",
        "thumbnail"
    ];


    var self = this;

    this.defaultComponentType = ComponentType.Image;

    this.guess = function(layer) {
        var nameObj = nameRule.parseName(layer.name);
        if(nameObj == null) return ComponentType.None;

        if(nameObj.query.type != undefined){
            return nameObj.query.type;
        }

        var componentType = self.defaultComponentType;

        if(layer.kind == LayerKind.TEXT) {
            componentType = ComponentType.Text;
        }else {
            for(var i = 0;i < TypeChecks.length; i++){
                var t = TypeChecks[i];
                if(_containsOne(layer.name, t[0])){
                    componentType = t[1];
                    break;
                }
            }
        }

        if(componentType == ComponentType.Image){

            if(maybeThumbnail(layer)){
                componentType = ComponentType.VarImage;
            } else if( _maybeVariable(nameObj)){
                componentType = ComponentType.VarImage;
            }   
        }else if(componentType == ComponentType.Text) {
            if(_maybeVariable(nameObj)){
                componentType = ComponentType.VarText;
            }
        }



        return componentType;
    };

    this.maybeVaribale = function(layer) {
        var nameObj = nameRule.parseName(layer.name);
        if(nameObj == null) return false;
        return _maybeVariable(nameObj);
    };

    var ThumbnailSizeMinRatio = 1.0 / 15;

    /**
     サムネイルであるかどうかを判断する
     基本的に一定以上の大きさの正方形の画像の場合をサムネイルと判断する
     */
    function maybeThumbnail(layer) {
        var doc = layer.parent;

        var layerW = getWidth(layer.bounds);
        var layerH = getHeight(layer.bounds);

        if(layerW == layerH) {
            return layerH  > ThumbnailSizeMinRatio * doc.height;
        }else{
            return false;
        }

    }
    function _maybeVariable(nameObject) {
        if(!nameObject) return false;
        if(_containsOne(nameObject.fullname, VariableKeywords)){
            return true;
        }else {
            var name = nameObject.name.toLowerCase();
            var layerName = nameObject.layerName.toLowerCase();
            for(var i = 0; i < VariableEndKeywords.length;i ++){
                var keyword = VariableEndKeywords[i];
                if(name.endsWith(keyword)){
                    return true;
                }
                if(layerName.endsWith(keyword)){
                    return true;
                }
            }
            return false;
        }
    }

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
function getWidth(bounds){
    return bounds[2].as(g_SizeUnit) - bounds[0].as(g_SizeUnit);
}

function getHeight(bounds){
    return bounds[3].as(g_SizeUnit) - bounds[1].as(g_SizeUnit);
}

var nameRule = new NameRule();
var typeGuesser = new TypeGuesser();
var structureLoader = new StructureLoader();

