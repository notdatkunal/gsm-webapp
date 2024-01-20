$(document).ready(function () {
    $("#studentAttendanceTab,#staffAttendanceTab").DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`);
    $("#btnSave").on("click", async (e) => {
        $("#btnSave").removeClass("btn-shake");
        if (studentAttendanceForm() === false) {
            $("#btnSave").addClass("btn-shake");
            return false;
        } else {
            addStudentAttendance();
        }
    });
    initializeClass();
    getStudentAttendanceDetails();
    $("#class_id").on("change", async () => {
        const selectedClassId = $("#class_id").val();
        await fetchStudentTable(selectedClassId);
    });
    $('#studentAttendanceTab').on('click', '.btnEdit', function () {
        const attendanceId = $(this).data('id');
        editStudentAttendance(attendanceId);
    });
    $("#updateBtnsave").on("click", updateAttendance);
    $("#staffBtnSave").on("click", async (e) => {
        $("#staffBtnSave").removeClass("btn-shake");
        if (staffAttendanceForm() === false) {
            $("#staffBtnSave").addClass("btn-shake");
            return false;
        } else {
            addStaffAttendance();
        }
    });
    getStaffAttendanceDetails();
    $("#btnOpenStaffForm").on("click",async e=>{
        $("#attedenceStaffModal").modal("show");
        fetchStaffTable();
    })
    $("#filterButton").on('click', filterStudentData);
    $('#staffAttendanceTab').on('click', '.btnEdit', function () {
        const staffAttendanceId = $(this).data('staff-id');
        editStaffAttendance(staffAttendanceId);
    });
    $('#updateStaffBtnsave').on('click',updatestaffAttendance);
    $('#staffFillterButton').on('click',filterStaffData);
    $("#staffBtnSave").on('click',addStaffAttendance);
});

function studentAttendanceForm() {
    var isValid = true;
    const fields = ["class_id", "attendance_dates"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    return isValid;
}

function staffAttendanceForm() {
    var isValid = true;
    const fields = ["attendanceDate"];
    for (const field of fields) {
        const element = $(`#${field}`);
        const value = element.val();
        if (value === "") {
            element.focus().addClass("is-invalid");
            isValid = false;
        }
    }
    return isValid;
}
function resetStudentAttendanceForm() {
    const fields = ["class_id", "attendance_dates"];
    for (const field of fields) {
        const element = $(`#${field}`);
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}

function resetStudentTable() {
    const studenttTable = $("#student_body");
    studenttTable.empty();

}
function resetStaffAttendanceForm() {
    const fields = ["attendanceDate"];  
    for (const field of fields) {
        const element = $(`#${field}`);       
        if (element.length > 0) {
            element.val("");
            element.removeClass("is-invalid");
        }
    }
}

function resetStaffTable() {
    const staffTable = $("#staff_body");
    staffTable.empty();

}
function callingPieChart(absent, present) {
    var existingChart = Chart.getChart("studentAttendancePieChat");
    if (existingChart) {
        existingChart.destroy();
    }
    generateingPieChart("studentAttendancePieChat", [present, absent], ["Present", "Absent",], ["#28a745", "#dc3545",]);
}
async function getStudentAttendanceDetails() {
    var endPoint = `${apiUrl}/StudentAttendance/get_student_attendance_by_institute_id/?institute_id=${instituteId}`;
    const studentAttendance = await $.ajax({
        type: "GET",
        url: endPoint,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
            showLoader("body", "sm");
        },
        success: function (response) {
            var studentAttendanceData = response.attendance_data;
            var absent = response.attendance_percentage.absent_percentage;
            var present = response.attendance_percentage.present_percentage;
            callingPieChart(absent, present);
            studentAttendanceData.forEach(entry => {
                var style = '';
                if (entry.attendance_status === 'Present') {
                    style = 'background-color: green; color: white';
                } else if (entry.attendance_status === 'Absent') {
                    style = 'background-color: red; color: white;';
                }
                var newRow = `<tr class='tr-attendance-${entry.id} attendance-row' data-day=${entry.attendance_date} data-class='${entry.class_id}' data-student-status="${entry.attendance_status}">
                    <td>${entry.attendance_date}</td>
                    <td>${entry.student.student_name}</td>
                    <td>${entry.student.roll_number}</td>
                    <td>${entry.class_id}</td>
                    <td style="${style}">${entry.attendance_status}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-id=${entry.id}>
                            <i class="bi bi-pencil-square"></i>
                        </button>
                    </td>
                </tr>`;
            
                $('#studentAttendanceTab').DataTable().row.add($(newRow)).draw();

            });
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete: (e) => {
            removeLoader("body", "sm");
        },
    });
}


function generateingPieChart(id = "", percentage = [], labels = [], colors = []) {
    var data = {
        labels: labels,
        datasets: [{
            data: percentage,
            backgroundColor: colors
        }]
    };
    var options = {
        responsive: true,
        maintainAspectRatio: false,
    };
    var ctx = document.getElementById(id).getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}
async function initializeClass() {
    const classesurl = `${apiUrl}/Classes/get_classes_by_institute/?institite_id=${instituteId}`;
    const response = await $.ajax({
        url: classesurl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        success: (response) => {
            for (const classes of response) {
                $("#class_id").append(`<option value="${classes.class_id}">${classes.class_name}</option>`);
                $("#class_id_id").append(`<option value="${classes.class_id}">${classes.class_name}</option>`);
            }
        },
        error: function (error) {
            raiseErrorAlert(error.responseJSON);
        },
    });
}
function addStudentAttendance() {
    const selectedStudents = getSelectedStudentsData();
    const requestData = {
        "data": selectedStudents
    };
    const addStudentUrl = `${apiUrl}/StudentAttendance/create_bulk_student_attendance/`;
    $.ajax({
        type: 'POST',
        url: addStudentUrl,
        data: JSON.stringify(requestData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend: () => {
            showLoader("attedanceModal", "sm");
        },
        success: function (data) {
            $("#attedanceModal").modal("hide");
            if (data.status_code === 200) {
                const responseData = data.response;
                if (responseData === "") {
                    raiseSuccessAlert(data.msg);
                } else {
                    const responseDataArray = data.response;
                    if (Array.isArray(responseDataArray)) {
                        responseDataArray.forEach((responseData) => {
                            const style = responseData.attendance_status === 'Present' ? 'background-color: green; color: white;' : 'background-color: red; color: white;';
                            const studentnewRow = `<tr class="tr-attendance-${responseData.id}">
                                <td>${responseData.attendance_date}</td>
                                <td>${responseData.student.student_name}</td>
                                <td>${responseData.student.roll_number}</td>
                                <td>${responseData.class_id}</td>
                                <td style='${style}'>${responseData.attendance_status}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-id="${responseData.id}" data-bs-toggle="modal" data-bs-target="#editstudentModalForm">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            </tr>`;
                            $('#studentAttendanceTab').DataTable().row.add($(studentnewRow)).draw();
                        });
                        raiseSuccessAlert("Attendance Added Successfully.");
                        resetStudentAttendanceForm();
                        resetStudentTable();
                    } else {
                        raiseErrorAlert('Invalid response data format. Expected an array. Actual:', responseDataArray);
                    }
                }
            } else {
                raiseErrorAlert('Error adding attendance:', data.msg);
            }
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete:(e)=>{
            removeLoader('attedanceModal','sm')
        }
    });
}

    function getSelectedStudentsData() {
        const selectedStudents = [];
        $("#student_table tbody tr").each(function () {
            const studentId = $(this).find(".student-id").text(); // Use class selector instead of ID
            const attendanceDate = $('#attendance_dates').val();
            const attendanceStatus = $(this).find("input[type='radio']:checked").val();
            if (!isNaN(studentId) && Number.isInteger(Number(studentId))) {
                selectedStudents.push({
                    "student_id": parseInt(studentId),
                    "attendance_date": attendanceDate,
                    "attendance_status": attendanceStatus,
                    "institute_id": instituteId,
                    "is_deleted": false,
                });
            }
        });
    
        return selectedStudents;
    }
    
    async function fetchStudentTable(selectedClassId) {
        const studentsUrl = `${apiUrl}/Students/get_students_by_field/class_id/${selectedClassId}/`;
        const studentsResponse = await $.ajax({
            url: studentsUrl,
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            beforeSend: (e) => {
                showLoader('attedanceModal', 'sm');
            },
            complete: (e) => {
                removeLoader('attedanceModal', 'sm');
            },
        });
    
        $("#student_table tbody").empty();
        $("#student_table thead").html("<tr><th>Roll Number</th><th>Name</th><th>Status</th></tr>");
    
        for (const student of studentsResponse) {
            const statusHtml = `
                <input type="radio" value="Present" name="status_${student.student_id}" checked>
                <label class="present-label">P</label>
                
                <input type="radio" value="Absent" name="status_${student.student_id}">
                <label class="absent-label">A</label>
            `;
            const newRow = $("<tr>")
                .append($("<td>").css("display", "none").addClass("student-id").text(student.student_id))
                .append($("<td>").text(student.roll_number))
                .append($("<td>").text(student.student_name))
                .append($("<td>").attr("id", "attendance_status").html(statusHtml));
            $("#student_table tbody").append(newRow);    
        }
    }
    
async function editStudentAttendance(attendanceId) {

        const fetchUrl = `${apiUrl}/StudentAttendance/get_attendance_by_id/?attendance_id=${attendanceId}`;
        setTimeout(() => {
            showLoader("editstudentModalForm", "sm");
        }, 1000);
    
    const Response = await  $.ajax({
            type: "GET",
            url: fetchUrl,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            success: (data) => {
                if (data && data.status_code === 200 && data.response) {
                    var responseData = data.response[0];
                    $('#editstudentModalForm').modal('show');
                    $("#id").val(responseData.id);
                    $('#class_id').val(responseData.class_id);
                    $("#attendance_date").val(responseData.attendance_date);
                    if (responseData.attendance_status === 'Present') {
                        $('#present').prop('checked', true);
                    } else if (responseData.attendance_status === 'Absent') {
                        $('#absent').prop('checked', true);
                    }
                    $('#student_id').val(responseData.student.student_name);
                    $('#roll_number').val(responseData.student.roll_number);
                }
            },
            error: function (xhr, status, error) {
                raiseErrorAlert(error.responseJSON.detail);
            },
            complete: function () {
                setTimeout(() => {
                    removeLoader("editstudentModalForm", "sm");
                }, 1000);
            }
        });
    }
    
    function updateAttendance() {
        const attendance_id = $('#id').val();
        const attendance_status = $("input[name='attendance_status']:checked").val();
        const updatedData = {
            "attendance_status": attendance_status
        };
        const patchurl = `${apiUrl}/StudentAttendance/update_student_attendance_partial/?attendance_id=${attendance_id}`;
        $.ajax({
            type: 'PATCH',
            url: patchurl,
            data: JSON.stringify(updatedData),
            headers: {
                'accept': 'application/json',
                "Authorization": `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            beforeSend:(e)=>{
                showLoader('editstudentModalForm','sm')
            },
            success: function (data) {
                const responseData = data.response
                let existingRow = $(`.tr-attendance-${responseData.id}`);
                if (existingRow.length) {
                    const statusCell = existingRow.find('td:eq(4)');
                    statusCell.text(responseData.attendance_status);
                    if (responseData.attendance_status === 'Present') {
                        statusCell.css({
                            'background-color': 'green',
                            'color': 'white'
                        });
                    } else if (responseData.attendance_status === 'Absent') {
                        statusCell.css({
                            'background-color': 'red',
                            'color': 'white'
                        });
                    }
                }
                $("#editstudentModalForm").modal("hide");
                raiseSuccessAlert("Attendance Updated Successfully.");
            },
            error: function (error) {
                raiseErrorAlert(error)
            },
            complete:(e)=>{
                removeLoader('editstudentModalForm','sm')
            }
        });
    }
    

    function filterStudentData() {
        var selectedClass = $("#class_id_id").val();
        var startDate = $("#startDate").val();
        var endDate = $("#endDate").val();
        var studentAttendanceRows = $(".attendance-row");
        var studentPresentcount = 0;
        var studentAbsentcount = 0;
        studentAttendanceRows.each(function () {
            var row = $(this);
            var dataClass = row.data("class");
            var dataDay = row.data("day");
            var student_data_status = row.data('student-status');
            if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    (endDate === "" || endDate === null) &&
                    (dataDay >= startDate)
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    (startDate === "" || startDate === null) &&
                    (dataDay <= endDate)
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    dataDay >= startDate &&
                    dataDay <= endDate
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    (dataDay >= startDate && dataDay <= endDate)
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    (endDate === "" || endDate === null) &&
                    (dataDay >= startDate)
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else if (
                ((selectedClass === "" || selectedClass === null || selectedClass === "all" || selectedClass === dataClass) &&
                    (startDate === "" || startDate === null) &&
                    (dataDay <= endDate)
                )
            ) {
                row.show();
                updateCount(student_data_status);
            } else {
                row.hide();
            }
        });
    
        callingPieChart(studentAbsentcount, studentPresentcount);
    
        function updateCount(status) {
            if (status === "Present") {
                studentPresentcount++;
            } else {
                studentAbsentcount++;
            }
        }
    }
    

function callingStaffPieChart(absent, present) {
    var existingChart = Chart.getChart("staffAttendancePieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    generateingStaffPieChart("staffAttendancePieChart", [present, absent], ["Present", "Absent"], ["#28a745", "#dc3545"]);
}

async function getStaffAttendanceDetails() {
    const endPoint = `${apiUrl}/StaffAttendance/get_staff_attendance_by_institute_id/?institute_id=${instituteId}`;
    try {
        const response = await $.ajax({
            type: "GET",
            url: endPoint,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`,
            },
            beforeSend:()=>{
                showLoader("body","sm")
            },
            success: function(response) {
                var staffAttendanceData = response.attendance_data;
                var absent = response.attendance_percentage.absent_percentage;
                var present = response.attendance_percentage.present_percentage;
                callingStaffPieChart(absent, present);
                staffAttendanceData.forEach(staffEntry => {
                    const style = staffEntry.attendance_status === 'Present' ? 'background-color: green; color: white;' : 'background-color: red; color: white;';
                    const newRow = `<tr class='tr-staff-attendance-${staffEntry.id} staff-attendance-row' data-staff-day='${staffEntry.attendance_date}' data-attendance-status="${staffEntry.attendance_status}">
                        <td>${staffEntry.attendance_date}</td>
                        <td>${staffEntry.staff.staff_name}</td>
                        <td>${staffEntry.staff.employee_id}</td>
                        <td style="${style}">${staffEntry.attendance_status}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-info btnEdit" data-staff-id="${staffEntry.id}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                        </td>
                    </tr>`;
                    $('#staffAttendanceTab').DataTable().row.add($(newRow)).draw();
                });
            },
            complete: (e) => {
                removeLoader("body", "sm");
            },
        });
    } catch (error) {
        console.error('Error fetching staff attendance:', error);
    }
}




function generateingStaffPieChart(id = "", percentage = [], labels = [], colors = []) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext('2d');
    var data = {
        labels: labels,
        datasets: [{
            data: percentage,
            backgroundColor: colors
        }]
    };
    var options = {
        responsive: true,
        maintainAspectRatio: false
    };
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

async function fetchStaffTable() {
    const staffUrl = `${apiUrl}/Staff/get_staffs_by_institute/?institute_id=${instituteId}`;
    const staffResponse = await $.ajax({
        url: staffUrl,
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        beforeSend: (e) => {
            showLoader('assignment', 'sm');
        },
        complete: (e) => {
            removeLoader('assignment', 'sm');
        },
    });

    $("#staff_table tbody").empty();
    for (const staff of staffResponse) {
        const statusHtml = `
            <input type="radio" value="Present" name="status_${staff.staff_id}" checked>
            <label class="present-label">P</label>
            
            <input type="radio" value="Absent" name="status_${staff.staff_id}">
            <label class="absent-label">A</label>
        `;
        const newRow = $("<tr>")
        .data("staff-id", staff.staff_id)
        .append($("<td>").css("display", "none").text(staff.staff_id))
        .append($("<td>").text(staff.employee_id))
        .append($("<td>").text(staff.staff_name))
        .append($("<td>").attr("id", "attendance_status").html(statusHtml));
    
    $("#staff_table tbody").append(newRow);
    }
}



async function editStaffAttendance(StaffattendanceId) {
    const fetchUrl = `${apiUrl}/StaffAttendance/get_staff_attendance_by_id/?attendance_id=${StaffattendanceId}`;
    setTimeout(() => {
        showLoader("editstaffModalForm", "sm");
    }, 1000);
    const Response = await  $.ajax({
        type: "GET",
        url: fetchUrl,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        success: (data) => {
            if (data) {
                var responseData = data[0];
                $('#editstaffModalForm').modal('show');
                $("#id").val(responseData.id);
                $("#staff_attendance_date").val(responseData.attendance_date);
                if (responseData.attendance_status === 'Present') {
                    $('#staff_present').prop('checked', true);
                } else if (responseData.attendance_status === 'Absent') {
                    $('#staff_absent').prop('checked', true);
                }
                $('#staffs_id').val(responseData.staff.staff_name);
                $('#employee_id').val(responseData.staff.employee_id);
            }
        },
        error: function (xhr, status, error) {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete:(e)=>{
            setTimeout(() => {
                removeLoader("editstaffModalForm", "sm");
            }, 1000);
        }
    });
}


function updatestaffAttendance() {
    const staff_attendance_id = $('#id').val();
    const staff_attendance_status = $("input[name='staff_attendance_status']:checked").val();
    const updatedStaffData = {
        "attendance_status": staff_attendance_status
    };
    const staffpatchurl = `${apiUrl}/StaffAttendance/update_staff_attendance/?attendance_id=${staff_attendance_id}`;
    $.ajax({
        type: 'PATCH',
        url: staffpatchurl,
        data: JSON.stringify(updatedStaffData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend:(e)=>{
            showLoader('editstaffModalForm','sm')
        },
        success: function (data) {
            const responseData = data.response[0]
            let existingRow = $(`.tr-staff-attendance-${responseData.id}`);
            if (existingRow.length) {
                const statusCell = existingRow.find('td:eq(3)');
                statusCell.text(responseData.attendance_status);
                if (responseData.attendance_status === 'Present') {
                    statusCell.css({
                        'background-color': 'green',
                        'color': 'white'
                    });
                } else if (responseData.attendance_status === 'Absent') {
                    statusCell.css({
                        'background-color': 'red',
                        'color': 'white'
                    });
                }
            }
            $("#editstaffModalForm").modal("hide");
            raiseSuccessAlert("Attendance Updated Successfully.");
        },
        error: function (error) {
            raiseErrorAlert(error)
        },
        complete:(e)=>{
            removeLoader('editstaffModalForm','sm')
        }
    });
}

function filterStaffData() {
    var start_Date = $("#start_Date").val();
    var end_Date = $("#end_Date").val();
    var staffAttendanceRows = $(".staff-attendance-row");
    var presentCount = 0;
    var absentCount = 0;
    staffAttendanceRows.each(function () {
        var row = $(this);
        var data_Day = row.data("staff-day");
        var data_status = row.data('attendance-status');
        if (
            (end_Date === "" || end_Date === null) &&
            data_Day === start_Date &&
            (data_status === "Present" || data_status === "Absent")
        ) {
            row.show();
            if (data_status === "Present") {
                presentCount++;
            } else {
                absentCount++;
            }
        } else if (
            (start_Date === "" || start_Date === null) &&
            data_Day <= end_Date &&
            (data_status === "Present" || data_status === "Absent")
        ) {
            row.show();
            if (data_status === "Present") {
                presentCount++;
            } else {
                absentCount++;
            }
        } else if (
            data_Day >= start_Date && data_Day <= end_Date &&
            (data_status === "Present" || data_status === "Absent")
        ) {
            row.show();
            if (data_status === "Present") {
                presentCount++;
            } else {
                absentCount++;
            }
        } else {
            row.hide();
        }
    });

    callingStaffPieChart(absentCount, presentCount);
}

function getSelectedStaffData() {
    const selectedStaff = [];

    $("#staff_table tbody tr").each(function () {
        const staffId = $(this).data("staff-id");
        const attendanceDate = $('#attendanceDate').val();
        const attendanceStatus = $(this).find("input[type='radio']:checked").val();
        if (!isNaN(staffId) && Number.isInteger(Number(staffId))) {
            selectedStaff.push({
                "staff_id": parseInt(staffId),
                "attendance_date": attendanceDate,
                "attendance_status": attendanceStatus,
                "institute_id": instituteId,
                "is_deleted": false,
            });
        }
    });
    return selectedStaff;
}

function addStaffAttendance() {
    const selectedStaff = getSelectedStaffData();
    const requestData = {
        "data": selectedStaff
    };
    const addStaffUrl = `${apiUrl}/StaffAttendance/create_bulk_staff_attendance/`;
    $.ajax({
        type: 'POST',
        url: addStaffUrl,
        data: JSON.stringify(requestData),
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },
        beforeSend: () => {
            showLoader("attedenceStaffModal", "sm");
        },
        success: function (data) {
            $("#attedenceStaffModal").modal("hide");
            if (data.status_code === 200) {
                const responseDataArray = data.response;
                if (Array.isArray(responseDataArray)) {
                    responseDataArray.forEach((entry) => {
                        const style = entry.attendance_status === 'Present' ? 'background-color: green; color: white;' : 'background-color: red; color: white;';
                        const staffNewRow = `<tr class="tr-staff-attendance-${entry.id}">
                            <td>${entry.attendance_date}</td>
                            <td>${entry.staff.staff_name}</td>
                            <td>${entry.staff.employee_id}</td>
                            <td style="${style}">${entry.attendance_status}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info btnEdit" id="btnEdit" data-staff-id="${entry.id}" data-bs-toggle="modal" data-bs-target="#editstaffModalForm">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                            </td>
                        </tr>`;
                        $('#staffAttendanceTab').DataTable().row.add($(staffNewRow)).draw();
                    });
                    resetStaffAttendanceForm();
                    raiseSuccessAlert(data.msg);
                    resetStaffTable();
                } else {
                    raiseErrorAlert('Invalid response data format or empty array.');
                }
            } else {
                raiseErrorAlert('Error adding attendance:', data.msg);
            }
        },
        error: function (error) {
            raiseErrorAlert(error);
        },
        complete: (e) => {
            removeLoader('attedenceStaffModal', 'sm');
        }
    });
}










