var API_ENDPOINT = ""

$(document).ready(function(){
    API_ENDPOINT = $("#api_endpoint").val()
})

function SweetAlert(title, message){
    alert(title+" - "+message);
}