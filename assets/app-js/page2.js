$(document).ready(function(){

    $("#btnCreateStaff").click(function(){
        CreateStaff();
    });

    $("#btnGetStaff").click(function(){
        GetStaffs();
    });

    $("#btnUpdateStaff").click(function(){
        UpdateStaff();
    });

    $("#btnDeleteStaff").click(function(){
        DeleteStaff();
    });
    $("#btnCommon").click(function(){
        SweetAlert("Staff","Staff Success Message");
    });
})

function CreateStaff(){
    alert("Created Staff Called ! "+API_ENDPOINT);
}

function GetStaffs(){
    alert("Get Staff Called ! "+API_ENDPOINT);
}

function UpdateStaff(){
    alert("Update Staff Called ! "+API_ENDPOINT);
}

function DeleteStaff(){
    alert("Delete Staff Called ! "+API_ENDPOINT);
}