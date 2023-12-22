let API_ENDPOINT = ""
document.addEventListener('DOMContentLoaded', function() {
    API_ENDPOINT = $("#api_endpoint").val()
})
function SweetAlert(title, message){
    alert(title+" - "+message);
}