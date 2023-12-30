$(document).ready(function () {
  $("#tabContent").hide();
  $("#class_list").change(async function () {
    var selectedClassId = $(this).val();
    var selectedClassName = "Select Class";
    if (selectedClassId !== "Select Class") {
      selectedClassName = this.options[this.selectedIndex].text;
      $("#tabContent").show();
    } else {
      selectedClassId = 0;
      selectedClassName = "None";
      $("#tabContent").hide();
      $("#tabSection").empty();
      $("#tabSubject").empty();
      $("#tabStudent").empty();
    }
   await fetchDropdownValue(selectedClassId, selectedClassName);
  });
// _____Add/Edit ClassbuttonTrigger_____
  $("#btnSave").click(async function (e) {
    $("#AddClass").removeClass("btn-shake");
    e.preventDefault();
    if (validateClassModuleForm("class") === false) {

      return false;
    } else {
     await addClass();
     $("#class_creation_modal .modal-title").text("Save Class");
    }
  });
// _____Class Update____
  $("#btnEdit").click(async function () {
    var classId = $(this).data("class-id");
    const editurl = apiUrl + "/Classes/class_id/?class_id=" + classId;
    if (classId === 0) {
      raiseErrorAlert("Select One Class");
      return;
    }
    await $.ajax({
      type: "GET",
      url: editurl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      beforeSend: (e) => {
        showLoader("body", "sm");
      },
      success: (data) => {
        if (data && data.response) {
          var responseData = data.response;
          $("#class_id").val(responseData.class_id);
          $("#class_name").val(responseData.class_name);
          $("#class_creation_modal").modal("show");
          $("#class_creation_modal .modal-title").text("Edit Class");
        }
      },
      error: (xhr, status, error) => {
         raiseErrorAlert(error["responseJSON"]["detail"]);
      },
      complete: (e) => {
        removeLoader("body", "sm");
      },
    });
  });

  // _____Class Delete____
  $("#btnDelete").click(async function () {
    var classId = $(this).data("class-id");
    const deleteUrl = apiUrl + "/Classes/" + classId;
    if (classId === 0) {
      raiseErrorAlert("Select One Class");
      return;
    }
    Swal.fire({
      title: 'Are you sure, you want to delete this Record?',
      text: 'This can\'t be reverted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async(result) => {
      if (result.isConfirmed) {
      const response=await $.ajax({
          type: "DELETE",
          url: deleteUrl,
          mode: "cors",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
          },
          beforeSend: (e) => {
            showLoader("body", "sm");
          },
          success: (response) => {
            $("#class_list option[value='" + classId + "']").remove();

            $("#class_list").val("Select Class");

            $("#selected_class_name").text("None");
            $("#tabContent").hide();
            raiseSuccessAlert("Class Deleted Successfully.");
          },
          error: (xhr, status, error) => {
             raiseErrorAlert(error["responseJSON"]["detail"]);
          },
          complete: (e) => {
            removeLoader("body", "sm");
          },
        });
      }
    });
  });

  // _____Add/Edit SectionbuttonTrigger_____
  $("#btnSectionSave").click(async function (e) {
    $("#AddSection").removeClass("btn-shake");
    e.preventDefault();
    if (validateClassModuleForm("section") === false) {
      return false;
    } else {
     await addSection();
     $("#section_creation_modal .modal-title").text("Save Section");
    }
  });
  // _____Add/Edit SubjectbuttonTrigger_____
  $("#btnSujectSave").click(async function (e) {
    $("#AddSubject").removeClass("btn-shake");
    e.preventDefault();
    if (validateClassModuleForm("subject") === false) {
      return false;
    } else {
     await addSubject();
     $("#subject_creation_modal .modal-title").text("Save Subject");
    }
  });
  $("#btnGradeSave").click(async function (e) {
    $("#AddGrade").removeClass("btn-shake");
    e.preventDefault();
    if (validateGradeForm() === false) {
      $("#AddGrade").addClass("btn-shake");
      return false;
    } else {
     await addGrade();
     $("#grade_creation_modal .modal-title").text("Save Grading");
    }
  });
});

async function fetchDropdownValue(selectedClassId, selectedClassName) {
  $("#btnDelete").data("class-id", selectedClassId);
  $("#btnEdit").data("class-id", selectedClassId);
  $("#classes_id").val(selectedClassId);
  $("#selected_class_name").text(
    selectedClassName === "Select Class" ? "None" : selectedClassName
  );
  $("#tabContent").show();
  await loadSectionDetails(selectedClassId);
  await loadSubjectDetails(selectedClassId);
  await loadStudentDetails(selectedClassId);
  await loadGradeDetails(selectedClassId);
}

// _______ADD/EDIT Class_______
async function addClass() {
  let isUpdate = $("#class_id").val() !== "";
  const data = {
    institute_id: instituteId,
    class_id: $("#class_id").val(),
    class_name: $("#class_name").val(),
    is_deleted: false,
  };
  const url = isUpdate
    ? apiUrl + "/Classes/" + data.class_id
    : apiUrl + "/Classes/create_class/";
  const requestType = isUpdate ? "PUT" : "POST";
  const sectionsUrl = apiUrl + "/Sections/create_section/";
 await $.ajax({
    type: requestType,
    url: url,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("class-form-area", "sm");
    },
    success: async function (data) {
      $("#class_creation_modal").modal("hide");
      raiseSuccessAlert("Class Added Successfully.");
      if (data) {
        const responseData = data["response"];
        const $dropdown = $("#class_list");
        if (isUpdate) {
          const selectedOption = $dropdown.find(
            `option[value="${responseData.class_id}"]`
          );
          selectedOption.text(responseData.class_name);
          $("#selected_class_name").text(responseData.class_name);
          $("#class_id").val("");
          resetFormFields("class");
          raiseSuccessAlert("Class Updated Successfully");
        } else {
          $dropdown.append(
            `<option value="${responseData.class_id}">${responseData.class_name}</option>`
          );
          $dropdown.val(responseData.class_id);
          const sectionData = {
            class_id: responseData.class_id,
            section_name: "Section A",
          };
          await $.ajax({
            type: requestType,
            url: sectionsUrl,
            mode: "cors",
            crossDomain: true,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwtToken}`,
            },
            data: JSON.stringify(sectionData),
            success: (sectionResponse) => {
              console.log("Default section created:", sectionResponse);
            },
          });
          resetFormFields("class");
        }
        
      }
    },
    error: (error) => {
      console.log("done error");
      console.log(error.responseJSON.detail);
      raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("class-form-area", "sm");
    },
  });
}

function validateClassModuleForm(formType) {
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  var isValid = true;
  const fields = [`${formType}_name`];

  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length === 0) {
      continue;
    }
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
      raiseErrorAlert("Fill the form");
    } else if (value.length < 3) {
      element.focus().addClass("is-invalid");
      isValid = false;
      raiseErrorAlert(
        `${capitalizeFirstLetter(
          formType
        )} name must be at least 3 characters long`
      );
    }
  }
  return isValid;
}

function resetFormFields(formType) {
  const fields = [`${formType}_name`];
  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length > 0) {
      element.val("");
      element.removeClass("is-invalid");
    }
  }
}

// _______GET Section_______
async function loadSectionDetails(selectedClassId) {
  var loadSectionUrl =
    apiUrl + "/Sections/get_sections_by_class/?class_id=" + selectedClassId;

  try {
    showLoader("body", "sm");
    const sectionData = await $.ajax({
      type: "GET",
      url: loadSectionUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      
    });

    var sectionDetailsContainer = $("#tabSection");
    sectionDetailsContainer.empty();
    if (sectionData.length === 0) {
      sectionDetailsContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
  } else {
      sectionDetailsContainer.find('.no_data_found').remove();  
    for (var i = 0; i < sectionData.length; i++) {
      var section = sectionData[i];
      var sectionHtml =
        '<div class="mt-2" id="section-' +
        section.section_id +
        '">' +
        '<div class="col-md-3 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">' +
        '<div class="w-40 text-left section3" id="section-name-' +
        section.section_id +
        '">' +
        section.section_name +
        "</div>" +
        '<div class="d-flex gap-2 actions">' +
        '<a href="#" class="btnSectionEdit" onclick="editSection(this)" data-section-id="' +
        section.section_id +
        '">' +
        '<i class="bi bi-pencil-square text-primary"></i>' +
        "</a>" +
        '<a href="#" class="btnSectionDelete" onclick="deleteSection(this)" data-section-id="' +
        section.section_id +
        '">' +
        '<i class="bi bi-trash-fill text-danger"></i>' +
        "</a>" +
        "</div>" +
        "</div>" +
        "</div>";
      sectionDetailsContainer.append(sectionHtml);
    }
  }
  } catch (error) {
    console.error(error.detail);
  } finally {
    removeLoader("body", "sm");
  }
}


// _______ADD/EDIT Section_______
async function addSection() {
  let isUpdate = $("#section_id").val() !== "";
  const data = {
    section_id: $("#section_id").val(),
    section_name: $("#section_name").val(),
    class_id: $("#classes_id").val(),
    is_deleted: false,
  };
  const sectionUrl = isUpdate
    ? apiUrl + "/Sections/update_section_id/" + data.section_id
    : apiUrl + "/Sections/create_section/";
  const requestType = isUpdate ? "PUT" : "POST";
 await $.ajax({
    type: requestType,
    url: sectionUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("section-form-area", "sm");
    },
    success: async function (data) {
      if (data) {
        $("#section_creation_modal").modal("hide");
        const responseData = data["response"];
        if (isUpdate) {
          raiseSuccessAlert("Section Updated Successfully");
          await loadSectionDetails(responseData.class_id);
          $("#section_id").val("");
        } else {
          raiseSuccessAlert("Section Added Successfully.");
          await loadSectionDetails(responseData.class_id);
        }
        resetFormFields("section");
      }
    },
    error: (error) => {
      console.log("done error");
      console.log(error.responseJSON.detail);
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("section-form-area", "sm");
    },
  });
}

// _______GET SectionforEdit_______
async function editSection(element) {
  event.preventDefault();
  var sectionId = element.getAttribute("data-section-id");
  const editSectionUrl =
    apiUrl + "/Sections/section_id/?section_id=" + sectionId;
 await $.ajax({
    type: "GET",
    url: editSectionUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("body", "sm");
    },
    success: (data) => {
      if (data && data.response) {
        var responseData = data.response;
        $("#section_id").val(responseData.section_id);
        $("#section_name").val(responseData.section_name);
        $("#section_creation_modal").modal("show");
        $("#section_creation_modal .modal-title").text("Edit Section");
      }
    },
    error: (xhr, status, error) => {
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("body", "sm");
    },
  });
}

// _______DELETE Section_______
async function deleteSection(element) {
  event.preventDefault();
  var sectionId = element.getAttribute("data-section-id");
  const deleteSectionUrl = apiUrl + "/Sections/delete_section_id/" + sectionId;
  const class_Id=$("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async(result) => {
    if (result.isConfirmed) {
   const data = await $.ajax({
        type: "DELETE",
        url: deleteSectionUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e)=> {
          showLoader("body", "sm");
        },
        success: async function (data) {
          var parentDiv = $(element).closest(`#section-${sectionId}`);
          parentDiv.remove();
          raiseSuccessAlert("Section Deleted Successfully.");
          await loadSectionDetails(class_Id);
        },
        error: (xhr, status, error) => {
           raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}

// _______GET Section_______
async function loadSubjectDetails(selectedClassId) {
  var loadSubUrl =
    apiUrl + "/Subjects/get_subjects_by_class/?class_id=" + selectedClassId;

  try {
    showLoader("body", "sm");

    const subjectData = await $.ajax({
      type: "GET",
      url: loadSubUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    var subjectContainer = $("#tabSubject");
    subjectContainer.empty();
    if (subjectData.length === 0) {
      subjectContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
  } else {
    subjectContainer.find('.no_data_found').remove();   
    for (var i = 0; i < subjectData.length; i++) {
      var subject = subjectData[i];
      var subHtml =
        '<div class="mt-2" id="subject-' +
        subject.subject_id +
        '">' +
        '<div class="col-md-3 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">' +
        '<div class="w-40 text-left section3" id="subject-name-' +
        subject.subject_id +
        '">' +
        subject.subject_name +
        "</div>" +
        '<div class="d-flex gap-2 actions">' +
        '<a href="#" onclick="editSubject(this)" data-subject-id="' +
        subject.subject_id +
        '">' +
        '<i class="bi bi-pencil-square text-primary"></i>' +
        "</a>" +
        '<a href="#" onclick="deleteSubject(this)" data-subject-id="' +
        subject.subject_id +
        '">' +
        '<i class="bi bi-trash-fill text-danger"></i>' +
        "</a>" +
        "</div>" +
        "</div>" +
        "</div>";
      subjectContainer.append(subHtml);
    }
  }
  } catch (error) {
    console.error(error.detail);
  } finally {
    removeLoader("body", "sm");
  }
}

// _______ADD/EDIT Subject_______
async function addSubject() {
  let isEdit = $("#subject_id").val() !== "";
  const data = {
    subject_id: $("#subject_id").val(),
    subject_name: $("#subject_name").val(),
    class_id: $("#classes_id").val(),
    is_deleted: false,
  };
  const subjectUrl = isEdit
    ? apiUrl + "/Subjects/update_subject_id/" + data.subject_id
    : apiUrl + "/Subjects/create_subject/";
  const requestsType = isEdit ? "PUT" : "POST";
 await $.ajax({
    type: requestsType,
    url: subjectUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("subject-form-area", "sm");
    },
    success: async function (data) {
      if (data) {
        const subjectData = data["response"];
        $("#subject_creation_modal").modal("hide");
        if (isEdit) {
          raiseSuccessAlert("Subject Updated Successfully");
          await loadSubjectDetails(subjectData.class_id);
          $("#subject_id").val("");
        } else {
          raiseSuccessAlert("Subject Added Successfully.");
          await loadSubjectDetails(subjectData.class_id);
        }
        resetFormFields("subject");
      }
    },
    error: (xhr, status, error) => {
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("subject-form-area", "sm");
    },
  });
}

// _______GET SubjectforEdit_______
async function editSubject(element) {
  event.preventDefault();
  var subjectId = element.getAttribute("data-subject-id");
  const editSubjectUrl =
    apiUrl + "/Subjects/subject_id/?subject_id=" + subjectId;
 await $.ajax({
    type: "GET",
    url: editSubjectUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("body", "sm");
    },
    success: (data) => {
      if (data && data.response) {
        var responseData = data.response;
        $("#subject_id").val(responseData.subject_id);
        $("#subject_name").val(responseData.subject_name);
        $("#subject_creation_modal").modal("show");
        $("#subject_creation_modal .modal-title").text("Edit Subject");
      }
    },
    error: (xhr, status, error) => {
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("body", "sm");
    },
  });
}

// _______DELETE Subject_______
async function deleteSubject(element) {
  event.preventDefault();
  var subjectId = element.getAttribute("data-subject-id");
  const deleteSubUrl = apiUrl + "/Subjects/delete_subject_id/" + subjectId;
  const classsId=$("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async(result) => {
    if (result.isConfirmed) {
    const data= await $.ajax({
        type: "DELETE",
        url: deleteSubUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
          showLoader("body", "sm");
        },
        success: async function (data) {
          var parentDiv = $(element).closest(`#subject-${subjectId}`);
          parentDiv.remove();
          raiseSuccessAlert("Subject Deleted Successfully.");
          await loadSubjectDetails(classsId);
        },
        error: (xhr, status, error) => {
           raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}

// _______GET Student_______
async function loadStudentDetails(selectedClassId) {
  var loadStudentUrl =
    apiUrl +
    "/Students/get_students_by_field/class_id/" +
    selectedClassId +
    "/";

  try {
    showLoader("body", "sm");

    const studentData = await $.ajax({
      type: "GET",
      url: loadStudentUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    var studentDetailsContainer = $("#tabStudent").find("#classStudentTable");
    studentDetailsContainer.empty();

    for (var i = 0; i < studentData.length; i++) {
      var student = studentData[i];
      var studentHtml =
        '<tr class="tr-student-' +
        student.student_id +
        '">' +
        "<td>" +
        (i + 1) +
        "</td>" +
        '<td class="student_name">' +
        student.student_name +
        "</td>" +
        '<td class="roll_number">' +
        student.roll_number +
        "</td>" +
        '<td class="class_id">' +
        student.class_id +
        "</td>" +
        '<td class="section_id">' +
        student.section_id +
        "</td>" +
        '<td class="gender">' +
        student.gender +
        "</td>" +
        '<td class="blood_group">' +
        student.blood_group +
        "</td>" +
        "</tr>";
      studentDetailsContainer.append(studentHtml);
    }
  } catch (error) {
    console.error(error.detail);
  } finally {
    removeLoader("body", "sm");
  }
}


//_______GET Gradings_______
async function loadGradeDetails(selectedClassId) {
  var loadGradeUrl =
    apiUrl + "/Grades/get_grade_by_field/class_id/" + selectedClassId + "/";

  try {
    showLoader("body", "sm");

    const gradeData = await $.ajax({
      type: "GET",
      url: loadGradeUrl,
      mode: "cors",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    var gradingDetailsContainer = $("#tabGrading");
    gradingDetailsContainer.empty();
    if (gradeData.length === 0) {
      gradingDetailsContainer.html('<img src="/assets/img/no_data_found.png" class="no_data_found">');
  } else {
    gradingDetailsContainer.find('.no_data_found').remove(); 
    for (var i = 0; i < gradeData.length; i++) {
      var grade = gradeData[i];
      var gradingHtml = `
        <div class="mt-2" id="grade-${grade.grade_id}">
          <div class="col-md-3 bg-light p-2 d-flex justify-content-between align-items-center rounded" id="card2">
            <div class="w-40 text-left section3" id="grade-name-${grade.grade_id}">
              ${grade.percent_from}% - ${grade.percent_upto}%
            </div>
            <div class="line-section"><hr></div>
            <div class="text-left">
              ${grade.grade_name}
            </div>
            <div class="d-flex gap-2 actions">
              <a href="#" onclick="editGrading(this)" data-grade-id="${grade.grade_id}">
                <i class="bi bi-pencil-square text-primary"></i>
              </a>
              <a href="#" onclick="deleteGrading(this)" data-grade-id="${grade.grade_id}">
                <i class="bi bi-trash-fill text-danger"></i>                            
              </a>
            </div>
          </div>
        </div>`;

      // Append the HTML to the container
      gradingDetailsContainer.append(gradingHtml);
    }
  }
  } catch (error) {
    console.error(error.detail);
  } finally {
    removeLoader("body", "sm");
  }
}


// _______ADD/EDIT Grade_______
async function addGrade() {
  let editGrade = $("#grade_id").val() !== "";
  classId = $("#classes_id").val();
  const data = {
    institute_id: instituteId,
    class_id: classId,
    grade_id: $("#grade_id").val(),
    grade_name: $("#grade_name").val(),
    percent_from: $("#percent_from").val(),
    percent_upto: $("#percent_upto").val(),
    is_deleted: false,
  };
  const gradeUrl = editGrade
    ? apiUrl + "/Grades/update_grade/?grade_id=" + data.grade_id
    : apiUrl + "/Grades/create_grade/";
  const requestsType = editGrade ? "PUT" : "POST";
 await $.ajax({
    type: requestsType,
    url: gradeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    data: JSON.stringify(data),
    beforeSend: (e) => {
      showLoader("grade-form-area", "sm");
    },
    success: async function (data) {
      if (data) {
        $("#grade_creation_modal").modal("hide");
        const responseData = data["response"];
        if (editGrade) {
          raiseSuccessAlert("Grade Updated Successfully");
         await loadGradeDetails(responseData.class_id);
        } else {
          raiseSuccessAlert("Grade Added Successfully.");
         await loadGradeDetails(responseData.class_id);
        }
        resetGradeForm();
      }
    },
    error: (xhr, status, error) => {
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("grade-form-area", "sm");
    },
  });
}

function validateGradeForm() {
  var isValid = true;
  const fields = ["percent_from", "percent_upto", "grade_name"];
  for (const field of fields) {
    const element = $(`#${field}`);
    const value = element.val().trim();
    if (value === "") {
      element.focus().addClass("is-invalid");
      isValid = false;
      raiseErrorAlert("Fill all the fields");
    }
  }
  if($("#percent_from").val() > $("#percent_upto").val()){
    raiseErrorAlert("Minimum Percentage should be less than Maximum Percentage");
    isValid = false;
  }
  return isValid;
}

function resetGradeForm() {
  const fields = ["percent_from", "percent_upto", "grade_name"]
  for (const field of fields) {
    const element = $(`.form-control.${field}`);
    if (element.length > 0) {
      element.val("");
      element.removeClass("is-invalid");
    }
  }
}

// _______GET GradeforEdit_______
async function editGrading(element) {
  event.preventDefault();
  var gradeId = element.getAttribute("data-grade-id");
  const editGradeUrl = apiUrl + "/Grades/get_grade_by_id/?grade_id=" + gradeId;
 await $.ajax({
    type: "GET",
    url: editGradeUrl,
    mode: "cors",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,
    },
    beforeSend: (e) => {
      showLoader("body", "sm");
    },
    success: (data) => {
      if (data) {
        var responseData = data;
        $("#grade_id").val(responseData.grade_id);
        $("#percent_from").val(responseData.percent_from);
        $("#percent_upto").val(responseData.percent_upto);
        $("#grade_name").val(responseData.grade_name);
        $("#grade_creation_modal").modal("show");
        $("#grade_creation_modal .modal-title").text("Edit Grading");
      }
    },
    error: (xhr, status, error) => {
       raiseErrorAlert(error["responseJSON"]["detail"]);
    },
    complete: (e) => {
      removeLoader("body", "sm");
    },
  });
}

// _______DELETE Grade_______
async function deleteGrading(element) {
  event.preventDefault();
  var gradeId = element.getAttribute("data-grade-id");
  const deleteGrdUrl = apiUrl + "/Grades/delete_grade/?grade_id=" + gradeId;
  const classsesId=$("#classes_id").val();
  Swal.fire({
    title: 'Are you sure, you want to delete this Record?',
    text: 'This can\'t be reverted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async(result) => {
    if (result.isConfirmed) {
     const data=await $.ajax({
        type: "DELETE",
        url: deleteGrdUrl,
        mode: "cors",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
        beforeSend: (e) => {
          showLoader("body", "sm");
        },
        success: async function (data) {
          raiseSuccessAlert("Grade Deleted Successfully.");
          var parentDiv = $(element).closest(`#grade-${gradeId}`);
          parentDiv.remove();
          await loadGradeDetails(classsesId);
        },
        error: (xhr, status, error) => {
           raiseErrorAlert(error["responseJSON"]["detail"]);
        },
        complete: (e) => {
          removeLoader("body", "sm");
        },
      });
    }
  });
}
