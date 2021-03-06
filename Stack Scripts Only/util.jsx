﻿

var PathSetting = function(){


    this.dir = activeDocument.fullName.parent;

    var appName = activeDocument.name;
    if( appName.indexOf(".") >= 0){
        appName = appName.substring(0,appName.indexOf("."));
    }


    this.exportDir = new Folder(this.dir + "/" + appName);

    this.imageExportDir = new Folder(this.exportDir + "/images");

    var self = this;
    _makeDirs();


    function _makeDirs() {
        if(!self.exportDir.exists) {
            self.exportDir.create();
        }
        if(!self.imageExportDir.exists){
            self.imageExportDir.create();
        }
    }

}



/**
  指定したプロパティを除外してオブジェクトをコピーする
*/
function copyExcluding(obj, excludes){
	if( obj == undefined) return undefined;
	if( typeof obj == "number") return obj;
	if( typeof obj == "string") return obj;
    if( typeof obj == "boolean") return obj;
	if( obj instanceof Array) {
		var array = [];
		for(var i = 0; i < obj.length;i++){
			array.push(copyExcluding(obj[i], excludes));
		}
		return array;
	}

	var copyObj = {};
	for(var field in obj){
		if(arrayIncludes(excludes, field)) continue;
		if(field == "toJSON" || field == "prototype") continue;
        if(typeof obj[field] == "function") continue;

		copyObj[field] = copyExcluding(obj[field], excludes);
	}
	return copyObj;
}

function arrayIncludes(array, element, fromIndex) {
	if(!fromIndex) fromIndex = 0;
	for(var i = fromIndex;i < array.length; i++) {
		if(array[i] === element) return true;
	}
	return false;
}

var pathSetting = new PathSetting();


String.prototype.startsWith = function(word) {
    var i = this.indexOf(word);
    return i == 0;
};


String.prototype.endsWith = function(word) {
    if(!word || word.length == 0) return false;
    var c = this.substring(this.length - word.length);
    return c === word;
};



// -------- Scala like extentions -------------



Array.prototype.foreach = function(func) {
    for(var i = 0;i < this.length;i++){
        func(this[i]);
    }
    return this;
};

Array.prototype.filter = function(returnBool) {
    var newArray = [];
    for(var i = 0;i < this.length;i++){
        if(returnBool(this[i])) newArray.push(this[i]);
    }
    return newArray;
};
Array.prototype.flatMap = function(returnArrayObj) {
    var newArray = [];
    for(var i = 0;i < this.length;i++){
        newArray.concat(returnArrayObj(this[i]));
    }
    return newArray;
}

Array.prototype.map = function(returnAnyObject) {
    var newArray = [];
    for(var i = 0;i < this.length;i++){
        newArray.push(returnAnyObject(this[i]));
    }
    return newArray;
};

Array.prototype.find = function(returnBool) {
    for(var i = 0;i < this.length;i++){
        if(returnBool(this[i])) return this[i];
    }
    return null;
}


Array.prototype.contains = function(elem) {
    return this.find( function(e) { 
        return e === elem;
    }) != null;
}

Array.prototype.groupBy = function(toKeyFunc) {
    var grouped = {};
    for(var i = 0;i < this.length;i ++){
        var e = this[i];
        var key = toKeyFunc(e);
        if (grouped[key]) {
            grouped[key].push(e);
        } else {
            var list = [];
            list.push(e);
            grouped[key] = list;
        }
    }
    return grouped;
};

Array.prototype.mkString = function(separator) {
    var str = "";
    if(this.length == 0){
        return "";
    }
    for(var i = 0;i < this.length - 1;i ++){
        str += this[i] + separator;
    }
    str += this[this.length - 1];

    return str;
};

function clearLog()
{
    if(!pathSetting.exportDir){
        return;
    }
    var f = new File(pathSetting.exportDir + "/log.txt");
    f.encoding = "UTF-8";
    f.open("w");
    f.write("Start logging -- " + new Date() + "\n");
    f.close();
}


function log(log){
    if(!pathSetting.exportDir){
        return;
    }
    var f = new File(pathSetting.exportDir + "/log.txt");
    f.encoding = "UTF-8";
    f.open("a");
    f.write(log + "\n");
    f.close();
}




