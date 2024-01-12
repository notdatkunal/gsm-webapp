$(document).ready(e => {
    $("#staffPayroll").DataTable();
    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`)
    $("#addPayrollForm").on('click', e => {
        if(validateForm(payrollFieldNames) === true){
            addPayroll();
        }
    })
    $('#staffPayroll').on('click', '.dltBtn', async function() {
        var StaffPayRoleId = $(this).attr("data-payroll-id");
        await deletePayroll(StaffPayRoleId);
    });
    $("#btnstaffDocument").on('click', e => {
        if(validateForm(documentFields) === true){
            addDocument();
        }
    })
       
    let staffInfo = JSON.parse($("#staffInfo").val());
    let staffData = new StaffData();
    staffData.getStaffAttendance(staffInfo.staffId);
    staffData.loadCalendarDetailsByStaff(staffInfo.staffId);
    callPieChart();
    
});

function callPieChart(absent, present, leave) {
    var existingChart = Chart.getChart("staffPieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // Create a new pie chart
    generatePieChart("staffPieChart", [present, absent, leave], ["Present", "Absent", "Leave"], ["#28a745", "#dc3545", "#ffc107"]);
}

let payrollFieldNames = [
    'payment_date','payroll_type','salary_amount','payment_mode',
    'payroll_details'
]
let documentFields = [
    'document_name','document_file'
]
isUpdate = false
async function addPayroll(){
    var payrollData = {
        "payment_date": $("#payment_date").val(),
        "payroll_type": $("#payroll_type").val(),
        "salary_amount": $("#salary_amount").val(),
        "payment_mode":$("#payment_mode").val(),
        "payroll_details":$("#payroll_details").val(),
        "staff_id":$("#staff_id").val()
    }
    var payrollId = $("#payroll_id").val();
    var method = isUpdate ? "PUT" : "POST";
    var endPoint = isUpdate ? `/StaffPayrole/update_payroll/?payroll_id=${payrollId}` : "/StaffPayrole/add_payroll/";
    var totalUrl = apiUrl + endPoint
    await ajaxRequest(method, totalUrl, payrollData,"payrollFormId","lg", (response) => {
        $("#payroll_form").modal('hide');
        var payrollData = response.response;
        raiseSuccessAlert(response.msg);
        if (isUpdate) {
            var updatedRow = $(`#payroll_detail .tr-payroll-${payrollId}`);
            updatedRow.find('.payment_date').text(payrollData.payment_date);
            updatedRow.find('.payroll_type').text(payrollData.payroll_type);
            updatedRow.find('.salary_amount').text(payrollData.salary_amount);
            updatedRow.find('.payment_mode').text(payrollData.payment_mode);
            updatedRow.find('.payroll_details').text(payrollData.payroll_details);
        } else {
            displayNewPayroll(payrollData);
        }
        resetForm(payrollFieldNames);
        // $("#payroll_detail").find(".no_data_found-tr").hide();
        // var tableBody = $("#payroll_detail");
        // var noDataImage = tableBody.find('.no_data_found-tr');
        // if (noDataImage.length > 0) {
        //   noDataImage.remove();
        // }
        $("#payroll_detail").find("#no_data_found").remove();
        isUpdate = false;
    });
}
async function displayNewPayroll(response) {
    var tableBody = $("#payroll_detail");
    var noDataImage = tableBody.find('.no_data_found-tr');
    if (noDataImage.length > 0) {
      noDataImage.remove();
    }
    newRow = `
    <tr class="tr-payroll-${response.payroll_id}">
        <td class="payment_date">${response.payment_date}</td>
        <td class="payroll_type">${response.payroll_type}</td>
        <td class="salary_amount">${response.salary_amount}</td>
        <td class="payment_mode">${response.payment_mode}</td>
        <td class="payroll_details">${response.payroll_details}</td>
        <td>
            <a href="#"  data-payroll-id="${response.payroll_id}"
                class="btn btn-sm btn-info" onclick="openPayrollForm(this)">
                <i class="bi bi-pencil-square"></i>
            </a>
            <a href="#" data-payroll-id="${response.payroll_id}"
                class="dltBtn btn btn-sm btn-danger">
                <i class="bi bi-trash3"></i>
            </a>
        </td>
    </tr>
    `;
    // var tableBody = document.querySelector('.tbl__bdy');
    // tableBody.innerHTML += newRow;
    resetForm(payrollFieldNames);
    $("#staffPayroll").DataTable().row.add($(newRow)).draw();
}

async function openPayrollForm(element){
    var payrollId = $(element).attr("data-payroll-id");
    $("#payroll_form").modal('show')
    var endPoint = `/StaffPayrole/get_payroll_by_id/?payroll_id=${payrollId}`
    var totalUrl = apiUrl+endPoint;
    var method = "GET";
    await ajaxRequest(method, totalUrl,"","payrollFormId","lg", (response) =>{
        var payrollData = response.response;
        for (const key in payrollData) {
            try{
                $(`#${key}`).val(payrollData[key]);
            }
            catch(e){
                
            }
        }
        isUpdate = true
    })
} 

// base ajax request function
async function ajaxRequest(type, url, data,loaderId,loaderSize,successCallback) {
    await $.ajax({
        type: type,
        url: url,
        data: JSON.stringify(data),
        mode: "cors",
        crossDomain: true,
        headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: () => {
            showLoader(loaderId,loaderSize);
        },
        success: (response) => {
            successCallback(response);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON);
        },
        complete: () => {
            removeLoader(loaderId, loaderSize);
        }
    });
}

async function deletePayroll(payrollId){
    await Swal.fire({
        title: 'Are you sure, do you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const dataTable = $('#staffPayroll').DataTable();
            const deletedRow = dataTable.row(`.tr-payroll-${payrollId}`);
        
            if (deletedRow) {
                deletedRow.remove().draw();

                if (dataTable.rows().count() === 0) {
                    $(".dataTables_empty").html(`<img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">`);
                }
                var endPoint = `/StaffPayrole/delete_payroll/?payroll_id=${payrollId}`
                var totalUrl = apiUrl+endPoint;
                ajaxRequest("DELETE",totalUrl, "","payrollFormId","lg", (response) => {  
                })
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    customClass: {
                        title: 'swal-title',
                        content: 'swal-text',
                        confirmButton: 'swal-confirm-button',
                    },
                });
                raiseSuccessAlert(response.msg);
            }
        }
    });
}


// async function deletePayroll(payrollId){
//     await Swal.fire({
//         title: 'Are you sure, do you want to delete this Record?',
//         text: 'This can\'t be reverted!',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             $(`.tr-payroll-${payrollId}`).remove()
//             if ($('#staffPayroll').length === 1) {
//                 $("#payroll_detail").find(".no_data_found-tr").show()
//             }
//             var endPoint = `/StaffPayrole/delete_payroll/?payroll_id=${payrollId}`
//             var totalUrl = apiUrl+endPoint;
//             ajaxRequest("DELETE",totalUrl, "","payrollFormId","lg", (response) => {  
//             })
//             Swal.fire({
//                 title: 'Deleted!',
//                 text: 'Your file has been deleted.',
//                 icon: 'success',
//                 customClass: {
//                     title: 'swal-title',
//                     content: 'swal-text',
//                     confirmButton: 'swal-confirm-button',
//                 },
//             });
//         }
//     });

// }
// documentsss
async function addDocument() {
    var documentData = {
        "document_name": $("#document_name").val(),
        "document_file": await uploadFile("document_file", "staff_documents"),
        "staff_id": $("#staff_id").val(),
        "is_deleted": false,
    }
    var documentId = $("#document_id").val();
    var method = isUpdate ? "PUT" : "POST";
    var endPoint = isUpdate ? `/StaffDocuments/update_staff_documents/?document_id=${documentId}` : "/StaffDocuments/add_staff_documents/";
    var totalUrl = apiUrl + endPoint
    await ajaxRequest(method, totalUrl, documentData, "documentFormId", "lg", (response) => {
        $("#documentForm").modal('hide');
        var documentData = response.response;
        raiseSuccessAlert(response.msg)
        if (isUpdate) {
            var updatedRow = $(`.card-staff-${documentId}`);
            updatedRow.find(".card-title").text(`${document_name}`)
        } else {
            displayNewDocument(documentData);
        }
        resetForm(documentFields);
        isUpdate = false;
        $("#documentRow").find("#no_data_found").hide()
    });
}
async function displayNewDocument(response) {
    var documentFile = response.document_file.split('/').pop();
    var newDocumentHTML = `
        <div class="col-md-4 card-staff-${response.document_id}">
            <div class="card mb-3">
                <div class="card-body">
                    <p class="card-title">${response.document_name}</p>
                    
                </div>
                <div class="card-footer d-flex justify-content-evenly">
                    <button data-document-id="${response.document_id}" class="btn btn-sm btn-info" onclick="openDocumentForm(this)">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button data-document-id="${response.document_id}" class="btn btn-sm btn-danger" onclick="deleteDocument(this)">
                        <i class="bi bi-trash3"></i>
                    </button>
                    <a href="/app/azure_download/${ documentFile }/staff_documents/" data-documentId="${response.document_id}"  class="btn btn-sm btn-dark">
                        <i class="bi bi-download"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    $("#documentRow").append(newDocumentHTML);
    resetForm(documentFields);
}
async function deleteDocument(element) {
    var documentId = $(element).attr("data-document-id");
    await Swal.fire({
        title: 'Are you sure, do you want to delete this Record?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var endPoint = `/StaffDocuments/delete_staff_documents/?document_id=${documentId}`;
            var totalUrl = apiUrl + endPoint;
            $(`.card-staff-${documentId}`).remove()
            if ($('#documentRow').children().length === 1) {
                $("#documentRow").find("#no_data_found").show();
                if (!$("#documentRow").find("#no_data_found")) {
                    $("#documentRow").html(
                        `<tr class="">
                            <td colspan="8" class="text-center">
                                <img src="/assets/img/no_data_found.png" alt="No Image" class="no_data_found">
                            </td>
                        </tr>`
                    );
                }
            }
            ajaxRequest("DELETE", totalUrl, "", "documentRow", "lg", (response) => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    customClass: {
                        title: 'swal-title',
                        content: 'swal-text',
                        confirmButton: 'swal-confirm-button',
                    },
                });
                raiseSuccessAlert(response.msg);
            })
        }
    });
}


async function openDocumentForm(element) {
    var documentId = $(element).attr("data-document-id");
    $("#documentForm").modal('show');
    var endPoint = `/StaffDocuments/get_staff_documents_by_id/?document_id=${documentId}`;
    var totalUrl = apiUrl + endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl, "","documentFormId", "lg", function(response) {
        var documentData = response.response;
        for (const key in documentData) {
            try {
                $(`#${key}`).val(documentData[key]);
            } catch (e) {
                // Handle any potential errors
            }
        }
        isUpdate = true;
        
    }); 
}

function generatePieChart (id = "",parcenatge= [],labels = [],colors = []) {
    var data = {
        labels:labels,
        datasets: [{
            data: parcenatge,
            backgroundColor: colors
        }]
    };
    // Configuration options
    var options = {
        responsive: true,
        maintainAspectRatio: false
    };
    // Get the canvas element
    var ctx = document.getElementById(`${id}`).getContext('2d');
    // Create the pie chart
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

async function deleteStaff(element) {
    var staffId = element.getAttribute("data-id");
    await Swal.fire({
        title: 'Are you sure, do you want to delete this Staff?',
        text: 'This can\'t be reverted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var endPoint = `/Staff/delete_staff/?staff_id=${staffId}`
            var totalUrl = apiUrl+endPoint;
            ajaxRequest("DELETE",totalUrl, "","body","lg", (response) => {  
            })
            Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                customClass: {
                    title: 'swal-title',
                    content: 'swal-text',
                    confirmButton: 'swal-confirm-button',
                },
            });
            window.location.href = `/app/staffs/`;
        }
    });
    
}

function deleteStaff(element) {
    var staffId = element.getAttribute("data-id");
    Swal.fire({
        title: 'Are you sure want to delete this Staff?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://gsm-fastapi.azurewebsites.net/Staff/delete_staff/?staff_id=${staffId}`,
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                success: function (response) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Staff has been deleted.',
                        icon: 'success'
                    }).then(() => {
                        window.location.href = `/app/staffs/`;
                    });
                },
                error: function (xhr, textStatus, errorThrown) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error deleting staff.',
                        icon: 'error'
                    });
                    console.log(xhr.responseText);
                }
            });
        }
    });
}

// Staff attendance 
class StaffData {
    
    async ajaxCall(type, url, data, loaderId,loaderSize ,successCallback) {
        await $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(data),
            mode: "cors",
            crossDomain: true,
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: () => {
                showLoader(loaderId, loaderSize);
            },
            success: (response) => {
                successCallback(response);
            },
            error: (error) => {
                raiseErrorAlert(error.responseJSON);
            },
            complete: () => {
                removeLoader(loaderId, loaderSize);
            }
        });
    }
    async getStaffAttendance(staffId) {
        var endPoint = `/StaffAttendance/get_staff_attendance_by_staff_id/?staff_id=${staffId}`
        var totalUrl = apiUrl + endPoint;
        await this.ajaxCall("GET", totalUrl, "", "attendance", "sm",(response) => {
            var staffAttedance = response.staff_attendance;
            this.displayAttendanceData(staffAttedance);
            var absent = response.staff_attendance_percentage.absent_percentage
            var present = response.staff_attendance_percentage.present_percentage
            var leave = response.staff_attendance_percentage.leave_percentage
            callPieChart(absent,present,leave)
        });
    }
    async displayAttendanceData(response) {     
        this.tBody = $("#attendance_data");
        if (Array.isArray(response) && response.length > 0) {
            this.tBody.empty();
            for (const attendance of response) {
                let statusClass;
                if (attendance.attendance_status === "Present") {
                    statusClass = "bg-success";
                } else if (attendance.attendance_status === "Absent") {
                    statusClass = "bg-danger";
                } else {
                    statusClass = "bg-warning";
                }
                const row = `
                    <tr>
                        <td>${attendance.attendance_date}</td>
                        <td class="bg ${statusClass} text-white">${attendance.attendance_status}</td>
                    </tr>
                `;
                this.tBody.append(row);
            }
            $('#attendanceTable').DataTable()
        }
        else {
            this.tBody.html(`
                 <tr>
                     <td colspan="2" class="text-center">
                         <img src="/assets/img/no_data_found.png" class="no_data_found">
                     </td>
                 </tr>
            `);
        }
    }
    // calendar details
    async loadCalendarDetailsByStaff(staffId) {
        try {
            const loadCalendarUrl = apiUrl + `/Calender/get_calender_by_staff/?staff_id=${staffId}`;
            await this.ajaxCall("GET", loadCalendarUrl, "", "tabCalender", "sm", async function (calendarData) {
                const calendarDetailsContainer = $("#tabCalender");
                const calendarTable = calendarDetailsContainer.find("#calenderTable");
                const noDataImage = calendarDetailsContainer.find('.no_data_found');
                if (!calendarData.response || calendarData.response.length === 0) {
                    noDataImage.show();
                    calendarTable.empty().hide();
                } else {
                    noDataImage.hide();
                    calendarTable.empty().show();
                    const data = calendarData.response;
                    const uniqueDays = [...new Set(data.map(item => item.day))];
                    const calendarHeader = $("#calendar .row h6");
                    calendarHeader.text("Calendar/TimeTable of this staff");
                    // Order the days
                    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Define the order of days
                    const headerRow = $("<tr class='col' id='column'>");
                    headerRow.append("<th>Time</th>");
                    orderedDays.forEach(day => {
                    if (uniqueDays.includes(day)) {
                        headerRow.append(`<th>${day}</th>`);
                    }
                    });
                    calendarTable.append(headerRow);
                    const timeDayMap = {};
                    data.forEach(item => {
                    const timeKey = `${item.start_time}-${item.end_time}`;
                    if (!timeDayMap[timeKey]) {
                        timeDayMap[timeKey] = {};
                    }
                        timeDayMap[timeKey][item.day] = {
                            subject: item.subjects.subject_name,
                            class: item.classes.class_name,
                        };
                    });
                    const uniqueTimeSlots = Object.keys(timeDayMap);
                    // Sort time slots
                    const orderedTimes = uniqueTimeSlots.sort((a, b) => {
                    const timeA = new Date(`1970/01/01 ${a.split('-')[0].trim()}`).getTime();
                    const timeB = new Date(`1970/01/01 ${b.split('-')[0].trim()}`).getTime();
                    return timeA - timeB;
                    });
                    orderedTimes.forEach(timeKey => {
                        const timeSlotRow = $("<tr class='rowData'>");
                        timeSlotRow.append(`<td class="mod" id="tdData">${timeKey}</td>`);
                        uniqueDays.forEach(day => {
                        const cellData = timeDayMap[timeKey][day];
                        if (cellData) {
                            timeSlotRow.append(`<td id="tableData">${cellData.subject} <br> (${cellData.class})</td>`);
                        } else {
                            timeSlotRow.append('<td id="tableData"></td>');
                        }
                        });
                        calendarTable.append(timeSlotRow);
                    });
                }
            });
        } catch (error) {
            raiseErrorAlert(error);
        } finally {
            removeLoader("tabCalender", "sm");
        }
    }
}
