$(document).ready(e => {
    $("#btnPayrollForm").on('click', e => {
        if(validateForm(payrollFieldNames) === true){
            addPayroll();
        }
        })
})

let payrollFieldNames = [
    'payment_date','payroll_type','salary_amount','payment_mode',
    'payroll_details'
]

async function addPayroll(){
    var payrollData = {
        "payment_date": $("#payment_date").val(),
        "payroll_type": $("#payroll_type").val(),
        "salary_amount": $("#salary_amount").val(),
        "payment_mode":$("#payment_mode").val(),
        "payroll_details":$("#payroll_details").val(),
        "staff_id":$("#staff_id").val()
    }
    console.log("payrollData",payrollData);
    var payrollId = $("#payroll_id").val();
    var method = payrollId ? "PUT" : "POST";
    var endPoint = payrollId ? `/StaffPayrole/update_payroll/?payroll_id=${payrollId}` : "/StaffPayrole/add_payroll/";
    var totalUrl = apiUrl + endPoint
    await ajaxRequest(method, totalUrl, payrollData, (response) => {
        $("#payroll_form").modal('hide');
        var payrollData = response.response;
        raiseSuccessAlert(response.msg);
        if (payrollId) {
            for (const field of payrollFieldNames) {
                try {
                    $(`.payroll-${parentId}-${field}`).text(payrollData[field]);
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            displayNewPayroll(payrollData);
        }
        resetForm(payrollFieldNames);
    });
}

async function displayNewPayroll(response) {
    var newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${$("#payroll_detail tr").length + 1}</td>
        <td>${response.payment_date}</td>
        <td>${response.payroll_type}</td>
        <td>${response.salary_amount}</td>
        <td>${response.payment_mode}</td>
        <td>${response.payroll_details}</td>
        <td>
        <a href="#"  data-payroll-id="${response.payroll_id}"
            class="btn btn-sm btn-info" onclick="openPayrollForm(this)">
            <i class="bi bi-pencil-square"></i>
        </a>
        <a href="#" data-id="${payroll.payroll_id}"
            class="dltBtn btn btn-sm btn-danger">
            <i class="bi bi-trash3"></i>
        </a>
        </td>
    `;
    var tableBody = document.querySelector('.tbl__bdy');
    tableBody.appendChild(newRow);
}

async function openPayrollForm(element){
    var payrollId = $(element).attr("data-payroll-id");
    console.log("payrollId",payrollId);
    $("#payroll_form").modal('show')
    var endPoint = `/StaffPayrole/get_payroll_by_id/?payroll_id=${payrollId}`
    var totalUrl = apiUrl+endPoint;
    var method = "GET";

    await ajaxRequest(method, totalUrl,"", (response) =>{
        var payrollData = response.response;
        console.log("payrollData",payrollData);
        for (const key in payrollData) {
            try{
                $(`#${key}`).val(payrollData[key]);
            }
            catch(e){
                
            }
        }
    })
} 

async function ajaxRequest(type, url, data, successCallback) {
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
            showLoader("payroll_form", "lg");
        },
        success: (response) => {
            successCallback(response);
        },
        error: (error) => {
            raiseErrorAlert(error.responseJSON.detail);
        },
        complete: () => {
            removeLoader("payroll_form", "lg");
        }
    }); 
}


