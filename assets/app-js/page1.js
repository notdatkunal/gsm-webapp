$(document).ready(function(){

    $("#btnCreateStudent").click(function(){
        CreateSutudent();
    });

    $("#btnGetStudent").click(function(){
        GetStudents();
    });

    $("#btnUpdateStudent").click(function(){
        UpdateStudent();
    });

    $("#btnDeleteStudent").click(function(){
        DeleteStudent();
    });
})

function CreateSutudent(){
    alert("Created Student Called !");
}

function GetStudents(){
    alert("Get Student Called !");
}

function UpdateStudent(){
    alert("Update Student Called !");
}

function DeleteStudent(){
    alert("Delete Student Called !");
}