

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

    Prefab: "Prefab",

    None : "None"
};

// -- Component class --

var Component = function(componentType) /* Component */{
    this.type = componentType;

    // Json化の際に無視される
    this.meta = {
        layer : null,
        visibleLayers : [],
        invisibleLayers : []
    }
};

Component.prototype.isText = function(){
    return this.type == ComponentType.Text ||
        this.type == ComponentType.VarText;
};
Component.prototype.isImage = function(){
    return this.type == ComponentType.Image ||
        this.type == ComponentType.VarImage;
};
Component.prototype.hasOnlyTextChildren = function(){
    if(!this.children) return true;
    for(var i = 0;i < this.children.length;i++){
        var c = this.children[i];
        if(!c.isText()){
            return false;
        }
    }
    return true;
};
Component.prototype.addChild = function(child){
    if(!this.children) this.children = [];
    if(!child.name || child.name == "" || child.name == null){
        child.name = this.name + child.type + (this.children.length + 1);
    }
    this.children.push(child);
    if(child.meta.layer){
        this.meta.invisibleLayers.push(child.meta.layer);
    }
    if (child.meta.visibleLayers && this.meta.invisibleLayers) {
        var self = this;
        child.meta.visibleLayers.foreach(function(l){
            self.meta.invisibleLayers.push(l);
        });
    }
    return this;
};


// -- def end Component --

var StructureLoader = function() {

    this.load = function(e) {
        return _loadRoot(activeDocument);
    };

    function _loadRoot(doc) {

        var _window = new Component(ComponentType.Window);
        _window.width = doc.width.as(g_SizeUnit);
        _window.height = doc.height.as(g_SizeUnit);

        doc.visible = true;
        _findAndStartLoadLayers(_window, doc);

        _postConstruction(_window);

        //setDebugProps(l);

        return _window;

    }

    function setDebugProps(l){
        if(l.meta.layer != null){
            l.layer = l.meta.layer.name;
        }
        l.layerNames = l.meta.visibleLayers.map(function(e){return e.name;});
        l.ignoreLayerNames = l.meta.invisibleLayers.map(function(e){return e.name;});
        if(l.children != undefined){
            for(var i = 0;i < l.children.length;i++){
                setDebugProps(l.children[i]);
            }
        }
    }


    function _findAndStartLoadLayers(parent, layer) {
        if(!layer.visible) return;
        for(var i = 0;i < layer.layers.length; i++){
            var l = layer.layers[i];
            var nameObj = getNameObj(l);
            if(nameObj != null){
                _loadLayer2(parent, l);
            }else if(l.typename == "LayerSet"){
                _findAndStartLoadLayers(parent,l);
            }
        }
    }
    function getNameObj(layer){
        var nameObj = null;
        if(layer.nameObj){
            nameObj = layer.nameObj;
        } else {
            nameObj = nameRule.parseName(layer.name);
            layer.nameObj = nameObj;
        }
        return nameObj;
    }


    function _loadLayer2(parent, layer, ignoreNoNameLayers) {
        if(!layer.visible) return;

        if(layer.typename == "ArtLayer" && layer.kind == LayerKind.SMARTOBJECT){
            log("Layer " + layer.name + " is smart object.");
            
            var filename = getSmartObjectLinkPath(layer);
            if(filename != null){
                var c = new Component(ComponentType.Prefab);
                c.filename = filename;
                _setCommonProps(c, layer);
                if(!c.name){
                    c.name = filename;
                }
                parent.addChild(c);
            } else {
                log("Not file linked smart object:" + layer.name);
            }
            return;
        }

        var nameObj = getNameObj(layer);
        if(nameObj == null){
            // 名前付で無いレイヤー
            if(layer.typename == "ArtLayer"){
                var componentType = typeGuesser.guess(layer);
                if(layer.kind == LayerKind.TEXT){
                    var obj = new Component(componentType);
                    obj.meta.layer = layer;
                    obj.meta.visibleLayers.push(layer);
                    _setCommonProps(obj, layer);
                    _setTextProps(obj, layer, parent.ComponentType == ComponentType.Button);
                    
                    if(componentType == ComponentType.InputText){
                        _modifyInputText(obj);
                    }

                    parent.addChild(obj);
                } else {
                    parent.meta.visibleLayers.push(layer);
                }
            } else {
                if(!ignoreNoNameLayers){
                    for(var i = 0;i < layer.layers.length;i++){
                        var l = layer.layers[i];
                        _loadLayer2(parent,l);
                    }
                } else {
                    parent.meta.invisibleLayers.push(layer);
                }
            }
        } else {
            // 名前付きレイヤー
            if(layer.typename == "ArtLayer"){
                var componentType = typeGuesser.guess(layer);
                if(layer.kind == LayerKind.TEXT){
                    var obj = new Component(componentType);
                    obj.meta.layer = layer;
                    obj.meta.visibleLayers.push(layer);
                    _setCommonProps(obj, layer);
                    _setTextProps(obj, layer, parent.ComponentType == ComponentType.Button);
                    
                    parent.addChild(obj);
                } else {
                    var obj = new Component(componentType);
                    obj.meta.layer = layer;
                    obj.meta.visibleLayers.push(layer);
                    _setCommonProps(obj, layer);

                    parent.addChild(obj);
                }
            } else {
                // LayerSetの場合
                var componentType = typeGuesser.guess(layer);

                // 特殊処理が必要なコンポーネント
                if(componentType == ComponentType.ListView){
                    var obj = new Component(ComponentType.ListView);
                    obj.meta.layer = layer;
                    obj.meta.visibleLayers.push(layer);
                    _setCommonProps(obj, layer);

                    for(var i = 0;i < layer.layers.length;i++){
                        _loadLayer2(obj, layer.layers[i], true);
                    }
                    
                    _modifyListView(obj);

                    parent.addChild(obj);
                    
                    return;
                } else if(componentType == ComponentType.InputText){

                    var obj = new Component(ComponentType.InputText);
                    obj.meta.layer = layer;
                    obj.meta.visibleLayers.push(layer);
                    _setCommonProps(obj, layer);

                    for(var i = 0;i < layer.layers.length;i++){
                        _loadLayer2(obj, layer.layers[i], false);
                    }

                    _modifyInputText(obj);
                    parent.addChild(obj);

                    return;
                }

                // 汎用処理のコンポーネント

                var obj = new Component(componentType);
                obj.meta.layer = layer;
                if(obj.type == ComponentType.Panel){

                } else {
                    obj.meta.visibleLayers.push(layer);
                }
                _setCommonProps(obj, layer);
                for(var i = 0;i < layer.layers.length; i++){
                    var l = layer.layers[i];
                    _loadLayer2(obj, l);
                }


                if( obj.meta.visibleLayers.length == 0 && obj.children.length == 0) {
                    parent.meta.invisibleLayers.push(this);
                    return;
                } else {
                    if(obj.isImage() && !obj.hasOnlyTextChildren()){
                        var background = new Component(obj.type);
                        obj.type = ComponentType.Panel;
                        copyPropsForBG(obj,background);
                        
                        background.name = obj.name + "Background";
                        obj.meta.visibleLayers = [];

                        obj.addChild(background);

                        parent.addChild(obj);
                    } else if( obj.type == ComponentType.Panel && obj.meta.visibleLayers.length > 0){
                        // Panelの場合レイヤーが付いていたら、子要素化する
                        var background = new Component(ComponentType.Image);
                        copyPropsForBG(obj, background);

                        background.name = obj.name + "Background";
                        obj.meta.visibleLayers = [];

                        obj.addChild(background);

                        parent.addChild(obj);
                    } else {
                        parent.addChild(obj);
                    }

                }

            }
        }

    }
    function _modifyListView(obj) {

        var candidates = obj.children.filter(function(c){
            return c.type == ComponentType.ListViewItem;
        });
        if(candidates.length == 0){
            candidates = obj.children.filter(function(c){
                return c.type == ComponentType.Panel;
            });
        }

        if(candidates.length == 0 ){
            log(obj.name + " children = " + obj.children.map(function(c){
                return c.name;
            }).mkString(","))
            throw new Error("ListView:" + obj.name + " must have ListViewItem in children");
        }

        obj.listViewItem = candidates[0];
        obj.children = obj.children.filter(function(c){
            for(var i = 0;i < candidates.length;i++){
                var c2 = candidates[i];
                if(c.id == c2.id){
                    return false;
                }
            }
            return true;
        });
        candidates.foreach(function(e){
            if(e.meta.layer != null){
                obj.meta.invisibleLayers.push(e.meta.layer);
            }
        });



    }

    function _modifyInputText(obj){
        if( obj.children.length == 0){
            // おそらくTextLayer
            obj.placeholder = obj.text;
            obj.text = "";
            return;
        }
        // Placeholderの選択
        var textLayer = obj.children.find(function(e){
            return e.type == ComponentType.Text ||
              e.type == ComponentType.InputText;
        });
        if(textLayer) {
            obj.placeholder = textLayer.text;
            obj.fontSize = textLayer.fontSize;
            obj.fontColor = textLayer.fontColor;
            obj.fontName = textLayer.fontName;

            obj.text = "";
        } else {
            obj.placeholder = "";
            obj.text = "";
        }

        // 背景の統合
        obj.meta.invisibleLayers = [];
        obj.meta.visibleLayers = [];
        obj.children.foreach(function(e){
            // Image Componentのみ、出力対象にする
            if(e.type == ComponentType.Image){
                obj.meta.visibleLayers.push(e.meta.layer);
            } else {
                obj.meta.invisibleLayers.push(e.meta.layer);
            }
        });
        obj.children = [];

        return obj;
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
        var rect = boundsToRect(bounds);
        obj.x = rect.x;
        obj.y = rect.y;
        obj.width = rect.width;
        obj.height = rect.height;

        // クエリがある場合、その値で上書き
        if(nameObj != null && nameObj.query){
            for(var i in nameObj.query){
                obj[i] = nameObj.query[i];
            }
        }
        // 視覚効果無しのサイズも記録
        var noFxRect = getNoFXRect(layer);
        obj.noFxRect = noFxRect;

        return obj;
    }

    function boundsToRect(bounds) {

        var left = bounds[0].as(g_SizeUnit);
        var top = bounds[1].as(g_SizeUnit);
        var right = bounds[2].as(g_SizeUnit);
        var bottom = bounds[3].as(g_SizeUnit);
        
        var rect = {};
        rect.x = left;
        rect.y = top;
        rect.width = right - left;
        rect.height = bottom - top;
        return rect;
    }

    /**
     * 視覚効果を使用しない場合の元の画像サイズ、位置を取得する
     * @param {*} layer 
     */
    function getNoFXRect(layer) {
        var dropShadowDisabled = setDropShadowRec(layer,false);
        var rect = boundsToRect(layer.bounds);
        dropShadowDisabled.foreach(function(e){
            setDropShadow(e,true);
        });
        return rect;
    }

    function copyPropsForBG(from, to){
        // あとで相対座標に計算されるので、x,yもコピーしておく
        to.x = from.y;
        to.y = from.y;
        to.width = from.width;
        to.height = from.height;
        to.meta.layer = from.meta.layer;
        to.meta.visibleLayers = from.meta.visibleLayers;
    }

    function setDropShadowRec(layer, enabled){
        var list = [];
        function _innerRec(l) {
            if(l.visible){
                if(l.typename == "LayerSet"){
                    for(var i = 0;i < l.layers.length;i++){
                        _innerRec(l.layers[i]);
                    }
                }
                if(setDropShadow(l, enabled)){
                    list.push(l);
                }
            }
        }
        _innerRec(layer);
        return list;
    }

    function setDropShadow(layer, enabled){
        selectLayer(layer);
        if(isDropShadowEnabled() != enabled) {
            _setDropShadow(enabled);
            return true;
        } else {
            return false;
        }
    }

    function _setDropShadow(enabled) {
        var idType = "";
        if(enabled){
            idType = "Shw ";
        } else {
            idType = "Hd  ";
        }
        var idHd = charIDToTypeID( idType );
        var desc1614 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var list405 = new ActionList();
        var ref503 = new ActionReference();
        var idDrSh = charIDToTypeID( "DrSh" );
        ref503.putIndex( idDrSh, 1 );
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref503.putEnumerated( idLyr, idOrdn, idTrgt );
        list405.putReference( ref503 );
        desc1614.putList( idnull, list405 );
        executeAction( idHd, desc1614, DialogModes.NO );
    }
        /*
        今後のためにログ残し

        TypeID : CharID

        in Lyayer
1315774496:Nm  
1131180576:Clr 
1450402412:Vsbl
1298407456:Md  
1332765556:Opct
1283027529:LyrI
1232366921:ItmI
1131312160:Cnt 
1349677908:PrsT
1818654838:lfxv
1281713784:Lefx
1734503489:gblA
1113811815:Bckg
1417180192:Txt 

in Lefx
1399024672:Scl 
1148343144:DrSh
1540:
1541:
1542:
1544:

in DrSh

1701732706:enab
2637:
2638:
1298407456:Md  
1131180576:Clr 
1332765556:Opct
1969712231:uglg
1818322796:lagl
1148417134:Dstn
1131113844:Ckmt
1651275122:blur
1315926885:Nose
1097757761:AntA
1416785491:TrnS
1545:
        */
    function isDropShadowEnabled(){
        var ref = new ActionReference();  
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
        var desc = executeActionGet(ref);//.getObjectValue(stringIDToTypeID('DrSh'));  
        //var textSize =  desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle')).getDouble (stringIDToTypeID('size'));  
        
        var Lefx = charIDToTypeID("Lefx");
        var DrSh = charIDToTypeID("DrSh");
        if(desc.hasKey(Lefx)){
            desc = desc.getObjectValue(Lefx);
            if(desc.hasKey(DrSh)){
                desc = desc.getObjectValue(DrSh);

                var enabled = desc.getBoolean(charIDToTypeID("enab"));
                return enabled;
            } 
        }
        return false;

    }

    function getCorrectFontSize(textItem){
        var domTextSize = textItem.size;  
        var amTextSize = getTextSize();  
        alert("DOM text size = " + domTextSize +"\rAction Manager text size = "+amTextSize);  
    }
    /**
     * textItem.sizeで取れる値は初期設定値で、
     * LayerをScaleした場合、その情報が反映されていない。
     * そのため、正しい値を取得するにはActionReferenceを使用する必要がある
     */
    function getFontSize(layer){
        
        selectLayer(layer);
        // read font size
        var ref = new ActionReference();  
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
        var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));  
        var textSize =  desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).
            getObjectValue(stringIDToTypeID('textStyle')).
            getDouble (stringIDToTypeID('size'));  
        if (desc.hasKey(stringIDToTypeID('transform'))) {  
            var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID("yy") );  
            textSize = (textSize* mFactor).toFixed(2);  
        }  

        // 詳細のインスペクト用コード
        /*var t = desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle'))
        log("-- layer " + layer.name);
        log("Implied:" + t.getString(stringIDToTypeID("impliedFontSize")));
        log("Size:" + t.getString(stringIDToTypeID("size")));
        //log("AutoKern:" + t.getString(stringIDToTypeID("autoKern")));
        log(app.preferences.typeUnits);
        log("----- get keys ----");
        for(var i = 0;i < t.count; i++){
            var key = t.getKey(i);
            log(key + ": " + typeIDToStringID(key));
        }
        log("---- end -----")*/

        switch(app.preferences.typeUnits){
            case TypeUnits.PIXELS:
                log("Size   = " + textSize);
                return Number(textSize);
            case TypeUnits.POINTS:
                var pt = Number(textSize);
                // 1 pt = 1/72 inch
                // resolution unit = [ pixel / inch ];
                var px = pt / 72 * activeDocument.resolution;
                log("Size = " + px);
                return px;
            default:
                log("--- Unknown text unit size:" + app.preferences.TypeUnits);
                return Number(textSize);
        }

    }
    /**
     * Layer選択をする
     */
    function selectLayer(layer){
        
        var idslct = charIDToTypeID( "slct" );
        var ref = new ActionReference();  
        ref.putIdentifier(charIDToTypeID('Lyr '), layer.id);  
        var desc = new ActionDescriptor();  
        desc.putReference(charIDToTypeID("null"), ref );  
        desc.putBoolean( charIDToTypeID( "MkVs" ), false ); 

        executeAction( idslct, desc, DialogModes.NO );
    }

    /**
      Textに関する要素を設定する
    */
    function _setTextProps(obj, layer, isButtonText) {
        // TextLayerの場合は、素直に設定
        if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            var textItem = layer.textItem;

            obj.text = textItem.contents.replace("\r","\n");
            obj.fontSize = getFontSize(layer);
            obj.fontColor = textItem.color.rgb.hexValue;
            try{
                // 一度でもFontを設定した場合、ちゃんと取得出来る
                obj.fontName = textItem.font;
            }catch(e){
                // Fontの設定をしたことが無い場合例外が出るため、デフォルトのフォントを設定
                obj.fontName = "KozGoPr6N-Regular";
            }

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
            if(obj.children) {
                children = obj.children;
            }
            for(var i = 0;i < layer.layers.length; i++){
                var l = layer.layers[i];
                _addTextLayers(obj, children, l);
            }

            if(children.length > 0){
                obj.children = children;
            }
        }else if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            _setTextProps(obj,layer);
        }
    }
    function _addTextLayers(obj, list, layer) {

        if(layer.typename == "ArtLayer" && layer.kind == LayerKind.TEXT){
            list.find(function(e){
                return e.name == name;
            })

            var n = nameRule.parseName(layer.name);
            var name = null;
            if( n != null){
                name = n.name;
            }else {
                // 名前が設定されていない場合は、親の名前＋Label＋連番
                name = obj.name + "Label" + (list.length + 1);
            }
            // 同じ名前の要素が含まれていないかチェック
            var ele = list.find(function(e){
                return e.name == name;
            });
            if(ele != null){
                return;
            }

            var componentType = ComponentType.Text;
            if(typeGuesser.maybeVaribale(layer)){
                componentType = ComponentType.VarText;
            }

            var label = {
                type: componentType,
                name: name,
                layer: layer
            };
            _setCommonProps(label, layer);
            _setTextProps(label, layer, obj.type == ComponentType.Button);
            list.push(label);
        } else if(layer.typename == "LayerSet") {
            if(layer.name.indexOf("@") >= 0) return;
            for(var i = 0;i < layer.layers.length; i++){
                var l = layer.layers[i];
                _addTextLayers(obj, list, l);
            }
        }
    }

    function getSmartObjectLinkPath(layer) 
    {

        selectLayer(layer);

        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
        var layerDesc = executeActionGet(ref);

        var soDesc = layerDesc.getObjectValue(stringIDToTypeID('smartObject'));
        //_show(soDesc);
        var placedDesc = soDesc.getEnumerationValue(stringIDToTypeID('placed'));
        var path = soDesc.getString(stringIDToTypeID("fileReference"));
        return path;
    }
    function _show(desc)
    {
        log("---- keys of " + desc);
        for(var i = 0;i < desc.count; i++){
            var key = desc.getKey(i);
            log(typeIDToStringID(key));
        }
        log("#------#");
    }

    /*
      構造構築化の処理
    */
    function _postConstruction(_window) {
        var components = componentUtil.toList(_window);

        log(components.length + " components");

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
            if(my.noFxRect) {
                var newX = my.noFxRect.x - parent.x;
                var newY = my.noFxRect.y - parent.y;
                my.noFxRect.x = newX;
                my.noFxRect.y = newY;
            }
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


};


var Name = function(){
    this.layerName = "";
    this.name = "";
    this.fulname = "";
    this.query = {};
}

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
        "パネル",
        "group",
        "area"
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
    var PrefabNames = [
        "prefab"
    ];

    var TypeChecks = [
        [VarTextNames, ComponentType.VarText],
        [VarImageNames, ComponentType.VarImage],
        [ButtonNames, ComponentType.Button],
        [InputTextNames, ComponentType.InputText],
        [ListViewItemNames, ComponentType.ListViewItem],
        [ListViewNames, ComponentType.ListView],
        [CheckBoxNames, ComponentType.CheckBox],
        [PrefabNames, ComponentType.Prefab]
    ];
    var LayerSetTypeChecks = [
        [PanelNames, ComponentType.Panel]
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
        "thumbnail",
        "id",
        "var"
    ];


    var self = this;

    this.defaultComponentType = ComponentType.Image;

    this.guess = function(layer) {
        var nameObj = nameRule.parseName(layer.name);
        /*if(nameObj == null) {
            _maybeVariable(nameObj)
            if(layer.kind = LayerKind.TEXT){
                return ComponentType.Text;
            } else {
                return ComponentType.None;
            }
        }*/
        if(nameObj == null){
            nameObj = new Name();
            nameObj.fullname = layer.name;
            nameObj.name = layer.name;
        }

        if(nameObj.query.type != undefined){
            return nameObj.query.type;
        }

        var componentType = self.defaultComponentType;

        if(layer.kind == LayerKind.TEXT) {
            componentType = ComponentType.Text;
        }else {
            for(var i = 0;i < TypeChecks.length; i++){
                var t = TypeChecks[i];
                if(_endsWithOne(nameObj.name, t[0])){
                    componentType = t[1];
                    break;
                }
                if(_endsWithOne(nameObj.layerName, t[0])){
                    componentType = t[1];
                    break;
                }
            }
            if (layer.typename == "LayerSet") {
                for(var i = 0; i < LayerSetTypeChecks.length; i++){
                    var t = LayerSetTypeChecks[i];

                    if(_endsWithOne(nameObj.name, t[0])){
                        componentType = t[1];
                        break;
                    }
                    if(_endsWithOne(nameObj.layerName, t[0])){
                        componentType = t[1];
                        break;
                    }
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
    function _endsWithOne(str, candidates) {
        str = str.toLowerCase();
        for(var i in candidates){
            var cand = candidates[i];
            if( str.endsWith(cand)){
                return true;
            }
        }
        return false;
    }

    function hasAtMarkChild(layer) {
        if(layer.name.indexOf("@") >= 0){
            return true;
        }
        if(layer.typename == "LayerSet"){
            for(var i = 0;i < layer.layers.length; i++){
                if(hasAtMarkChild(layer.layers[i])){
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }


};

var LayerNameValidator = function() {

    var self = this;

    self.fixAll = function(_window) {
        var components = componentUtil.toList(_window);
        _fixDuplicateNames(components);
        _fixSnakeCaseNames(components);
    };

    self.fixDuplicateNames = function(_window) {
        var components = componentUtil.toList(_window);
        _fixDuplicateNames(components);
    };
    
    self.fixSnakeCaseNames = function(_window) {
        var components = componentUtil.toList(_window);
        _fixSnakeCaseNames(components);
    };

    function _fixDuplicateNames(components) {
        log("Fix duplicate names");
        var groupedByName = components.groupBy(function(e){
            return e.name;
        });

        for(var key in groupedByName){
            var l = groupedByName[key];
            if(l.length >= 2){
                log("Same name layer found! " + key);
                for(var i = 0;i < l.length;i++){
                    var e = l[i];
                    e.name = e.name + (i + 1);
                }
            }
        }
    }

    function _fixSnakeCaseNames(components) {
        log("Fix snake case names");
        for(var i = 0;i < components.length; i++){
            var c = components[i];
            if(c.name){
                c.name = _snakeToCamel(c.name);
            }
        }

    }
    function _snakeToCamel(str) {
        var n = "";
        for(var i = 0;i < str.length; i++){
            var c = str.charAt(i);
            if( c == "_"){
                if( i + 1 < str.length){
                    n += str.charAt(i + 1).toUpperCase();
                    i++;
                }
            } else {
                n += c;
            }
        }
        if(n !== str){
            log("Snake case found:" + str);
        }
        return n;
    }


};

var ComponentUtil = function()
{

    this.toList = function(component){
        var list = [];
        enumerateElements(component, list);
        return list;
    };

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
}

function getWidth(bounds){
    return bounds[2].as(g_SizeUnit) - bounds[0].as(g_SizeUnit);
}

function getHeight(bounds){
    return bounds[3].as(g_SizeUnit) - bounds[1].as(g_SizeUnit);
}

var componentUtil = new ComponentUtil();
var nameRule = new NameRule();
var typeGuesser = new TypeGuesser();
var structureLoader = new StructureLoader();
var layerNameValidator = new LayerNameValidator();




