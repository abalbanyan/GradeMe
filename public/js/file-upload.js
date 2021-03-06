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
        // document.getElementById(thisVar.id + "-label").innerHTML = fileName;
        document.getElementById(thisVar.id + "-save").disabled = false;                     
        if (multipleAllowed) {
            $(thisVar).next('.custom-file-label').html(thisVar.files.length + " Files Selected");
        } else {
            $(thisVar).next('.custom-file-label').html(fileName);                
        }
    } else {
        $(thisVar).next('.custom-file-label').html("Choose file" + (multipleAllowed ? "(s)" : ""));   
        document.getElementById(thisVar.id + "-save").disabled = true;                     
    }
}

async function ajaxUpload(el, formid, url, progressbar = false) {
    el.disabled = true;
    let gradeonsubmissionElement = document.getElementById('gradeonsubmission');
    let gradeonsubmission = (gradeonsubmissionElement && gradeonsubmissionElement.value === "true")? true : false;

    $.ajax(url, {
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            
            if (progressbar) {
                
                progressbar = document.getElementById(progressbar);
                progressbar.style.width = '0%';
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        progressbar.style.width = percentComplete + '%';
                        if (percentComplete == 100) {
                            progressbar.innerHTML = "Submission uploaded. " + (gradeonsubmission? 'Grading...' : '');
                            let gradeSpinnerElement =  document.getElementById('grade-spinner');
                            if (gradeSpinnerElement) {
                                gradeSpinnerElement.hidden = !gradeonsubmission;
                            }
                        }
                    }
                }, false);
                progressbar.hidden = false;
                progressbar.parentElement.hidden = false;
            }

            return xhr;
        },
        type: "POST",
        data: new FormData(document.getElementById(formid)),
        contentType: false,
        processData: false,
        xhrFields: {
            withCredentials: true
        },
        success: function(result) {
            result = JSON.parse(result);

            if (result.upload) {
                if(progressbar) {
                    progressbar.classList.add('progress-bar-success');
                    progressbar.innerHTML = gradeonsubmission? "Submission graded." : "Submission uploaded.";
                    progressbar.style.width = '100%';
                }
                if (result.grade) {
                    document.getElementById('grade-info').innerHTML = "Your submission has been graded. Your score: <b>" + result.grade + '</b>';
                    document.getElementById('grade-info-container').hidden = false;
                    document.getElementById('grade-spinner').hidden = true;
                }
            } else {
                // Server did not accept upload.
                if(progressbar) {
                    progressbar.parentElement.classList.add('progress-bar-danger');
                    progressbar.innerHTML = "";
                    if (result.error) {
                        progressbar.innerHTML += result.error;
                    }
                    progressbar.style.width = '100%';
                }
            }
        }
    });
}
