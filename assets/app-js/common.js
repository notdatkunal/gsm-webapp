let apiUrl = ""
let jwtToken = ""
let instituteId = 0
$(document).ready(()=>{
    apiUrl = $("#apiUrl").val();
    jwtToken = $("#jwtToken").val();
    instituteId = $("#instituteId").val();
})
function raiseErrorAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.error(msg, 'Error');
}
function raiseSuccessAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.success(msg, 'Success');
}

function raiseWarningAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.warning(msg, 'Warning !');
}

function raiseInfoAlert(msg) {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "timeOut": "5000",
        "extendedTimeOut": "2000"
    };
    toastr.info(msg, 'Information');
}
// form reset
function resetForm(fields) {
    for (const field of fields) {
        try{
        const element = $(`#${field}`);
        const value = element.val(""); 
        }
        catch(e){
        }
    }
}
// form validation
function validateForm(fields) {
    var isValid = true;
    for (const field of fields) {
        try{
            const element = $(`#${field}`);
            const value = element.val().trim();
            if (value === '') {
                element.focus().addClass('is-invalid');
                isValid = false;
            }
        }  
        catch(e){
        } 
    }
    return isValid;
}

// 
function phoneNumber(fieldId) {
    var input = $(`#${fieldId}`);
    if (isNaN(input.val())) {
        input.val(input.val().replace(/[^0-9]/g, ''));
    }
}

// loader start
function showLoader(loaderContainerElementId, size) {
    if(loaderContainerElementId == "body"){
        $("#spinner-element-"+size).show();
    }
    else{
        $("#"+loaderContainerElementId).append($("#spinner-element-"+size).html());
    }
}
// loader stop
function removeLoader(loaderContainerElementId, size) {
    if(loaderContainerElementId == "body"){
        $("#spinner-element-"+size).hide();
    }
    else{
        $("#"+loaderContainerElementId).find(".spinner-element-"+size+'-overlay').remove();
    }
}

