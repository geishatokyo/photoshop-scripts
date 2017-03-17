

/*
設定ダイアログの簡易生成クラス

また、設定の保存を行い、次回の時に設定を引き継げる


Controlは、基本的に縦に自動整列する。
<example>
var dialog = new SettingDialog("Dialog title");

dialog.addCheckBox("c1","チェックボックス");
dialog.addShortText("t1","拡張子","png");
dialog.withPanel("パネルの名前",function(){
    dialog.addLongText("t2","名前");
    dialog.addDropdownList("l1","果物",["りんご","バナナ"]); 
});
dialog.show(function(ok){
    if(ok) // action for OK
    else // action for Cancel
});

</example>

*/
var SettingDialog = function(title, settingFile) {

    var LineWidth = 200;
    var LabelWidth = 70;
    var ComponentWidth = LineWidth - LabelWidth - 10;
    var LineHeight = 20;


    // 保存された設定ファイルを読み込む
    var setting = null;
    if(!settingFile) {
        settingFile = new File(pathSetting.exportDir + "/settings.photoshoptool.json")
    }else if(typeof settingFile == "string") {
        settingFile = new File(settingFile);
    }
    if( settingFile instanceof File) {
        setting = loadFromJsonFile(settingFile);
    } else {
        setting = settingFile;
        settingFile = new File(pathSetting.exportDir + "/settings.photoshoptool.json")
    }



    if(!setting || setting == null) {
        setting = {};
    }


    var _window = null;

    var self = this;
    _window = new Window("dialog", title);
    self.ok = false;


    var okCancelButtonAreAdded = false;
    /*
     OK,Cancelボタンを追加画面に追加する
    */
    function _addOkCancelButton() {
        if(okCancelButtonAreAdded) return;

        var group = _window.add("group");
        group.alignment = [
          ScriptUI.Alignment.RIGHT,
          ScriptUI.Alignment.CENTER
        ];
        var okButton = group.add("button", undefined, "OK");
        okButton.onClick = function() {
            self.ok = true;
            _close();
        };
        var cancelButton = group.add("button", undefined, "Cancel");
        cancelButton.onClick = function() {
            self.ok = false;
            _close();
        };

        okCancelButtonAreAdded = true;

    }

    // ---- Add component ---
    var settingUpdator = new SettingUpdator(setting);

    var currentPanel = _window;

    this.addCheckbox = function(name, label, value) {
        if(!value) value = false;
        var checkbox = currentPanel.add("checkbox", undefined, label);
        checkbox.size = [LineWidth, LineHeight];
        settingUpdator.register(name, checkbox, value);
    };

    this.addShortText = function(name, label, value) {
        if(!value) value = "";
        var group = currentPanel.add("group");
        group.alignment = [
            ScriptUI.Alignment.LEFT,
            ScriptUI.Alignment.CENTER
        ];
        group.add("statictext", undefined, label);
        var input = group.add("edittext", undefined);
        input.size = [ComponentWidth, LineHeight];
        settingUpdator.register(name, input, value);
    };
    this.addLongText = function(name, label, value){
        if(!value) value = "";
        var label = currentPanel.add("statictext", undefined, label);
        label.size = [LineWidth, LineHeight];
        var input = currentPanel.add("edittext", undefined);
        input.size = [LineWidth, LineHeight];
        settingUpdator.register(name, input, value);

    }

    this.addLabel = function(label) {
        var label = currentPanel.add("statictext", undefined, label);
        label.size = [LineWidth, LineHeight];
    };
    this.addTextArea = function(name, label, value) {
        if(!value) value = "";
        var label = currentPanel.add("statictext", undefined, label);
        label.size = [LineWidth, LineHeight];
        var input = currentPanel.add("edittext", undefined);
        input.size = [LineWidth, LineHeight * 3];
        settingUpdator.register(name, input, value);
    };

    this.addDropdownList = function(name, label, values, index) {
        if(!index) index = 0;
        if(label){
            var group = currentPanel.add("group");
            group.alignment = [
                ScriptUI.Alignment.LEFT,
                ScriptUI.Alignment.CENTER
            ];
            group.add("statictext", undefined, label);
            var input = group.add("dropdownlist", undefined, values);
            input.size = [ComponentWidth, LineHeight];
            settingUpdator.register(name, input, value);
        } else {
            var input = currentPanel.add("dropdownlist", undefined, values);
            input.size = [LineWidth, LineHeight];
        }
    };
    this.addButton = function(label, eventHandler) {
        var button = currentPanel.add("button",undefined);
        button.onClick = function() {
            settingUpdator.updateValues();
            eventHandler(setting);
        };
    };

    this.withPanel = function(title, initScopeFunc) {
        var parent = currentPanel;
        var panel = parent.add("panel", undefined, title);
        currentPanel = panel;
        initScopeFunc();
        currentPanel = parent;
        return panel;
    };


    /*
    水平方向にControlが並ぶGroupを追加する。
    */
    this.withHGroup = function(initScopeFunc) {
        var parent = currentPanel;
        var group = parent.add("group", undefined);
        currentPanel = group;
        currentPanel.orientation = "row";
        initScopeFunc();
        currentPanel = parent;
        return group;
    };

    /*
    垂直方向にControlが並ぶGroupを追加する。
    */
    this.withVGroup = function(initScopeFund) {
        var parent = currentPanel;
        var group = parent.add("group", undefined);
        group.alignment = [
            ScriptUI.Alignment.LEFT,
            ScriptUI.Alignment.CENTER
        ];
        currentPanel = group;
        currentPanel.orientation = "column";
        initScopeFunc();
        currentPanel = parent;
        return group;
    }


    // ----- Display ------

    var onClosedEventHandler = null;
    this.show = function(_onClosedEventHandler) {
        _addOkCancelButton();
        onClosedEventHandler = _onClosedEventHandler;
        _window.show();
    };

    this.close = function() {
        _close();
    };

    this.onClosed = function(ok, setting){
    };


    function _close() {
        self.onClosed(self.ok, setting);
        if(self.ok && settingFile != null) {
            settingUpdator.updateValues();
            saveToJsonFile(settingFile,setting);
        }
        _window.close();

        if(onClosedEventHandler != null){
            onClosedEventHandler(self.ok, setting);
        }
    }
};

/*
Controlの値を取得/設定するためのクラス
*/
var SettingUpdator = function(setting) {
    var self = this;
    var updateFunctions = {};

    this.getValue = function(name, defualtValue) {
        var v = setting[name];
        if(v != undefined) {
            return v;
        }else {
            return defualtValue;
        }
    };

    this.addUpdation = function(name, funcOrControl) {
        if(typeof funcOrControl == "function"){
            updateFunctions[name] = func;
        }else{
            var control = funcOrControl;
            switch(control.type) {
                case "checkbox":
                case "radiobutton":
                case "dropdownlist":
                    updateFunctions[name] = function() {
                        setting[name] = control.value;
                    };
                break;
                case "edittext":
                    updateFunctions[name] = function() {
                        setting[name] = control.text;
                    };
                break;
            }
        }
    };
    this.updateValues = function() {
        for(var k in updateFunctions){
            updateFunctions[k]();
        }
    };

    this.register = function(name, control, defaultValue) {
        switch(control.type) {
            case "checkbox":
            case "radiobutton":
            case "dropdownlist":
                control.value = self.getValue(name,defaultValue);
            break;
            case "edittext":
                control.text = self.getValue(name,defaultValue);
            break;
        }
        self.addUpdation(name, control);
    };

};


