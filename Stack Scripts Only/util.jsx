

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

