


function readFile(f) {

	if(!(f instanceof File)) {
		f = new File(f);
	}
    if(!f.exists) {
        return null;
    }
    f.encoding = "UTF-8";
	f.open("r");
	var str = f.read();
	f.close();

	return str;
}

function readToLines(f) {
	var str = readFile(f);

	return str.split("\n");
}



