function setFilename(thisVar, multipleAllowed) {
    var fileName = "";
    for (var i = 0; i < thisVar.files.length; ++i) {
        var name = thisVar.files.item(i).name;
        fileName += name;
        if (thisVar.files.length > 1 && i < thisVar.files.length - 1) {
            fileName += ", ";
        }
    }
    if (fileName) {
        document.getElementById(thisVar.id + "-label").innerHTML = fileName;                
        if (multipleAllowed) {
            $(thisVar).next('.custom-file-label').html(thisVar.files.length + " Files Selected");
        } else {
            $(thisVar).next('.custom-file-label').html(fileName);                
        }
    } else {
        $(thisVar).next('.custom-file-label').html("Choose file" + (multipleAllowed ? "(s)" : ""));   
        document.getElementById(thisVar.id + "-label").innerHTML = "";                     
    }
}