import mimetypes
from anyio import Path
from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from django.http import JsonResponse
from classlibrary.classes_module import ClassData
from classlibrary.common_module import Data
from classlibrary.registration_module import Institute
from classlibrary.login_module import Login
from classlibrary.student_module import Student, StudentInfo
from classlibrary.staff_module import Staff, StaffInfo
from classlibrary.notice_module import Notice
from django.contrib import messages
from django.http import HttpResponseRedirect, HttpResponse
import requests
import asyncio
from .azure_blob import upload_to_blob,download_blob
from django.http import FileResponse
from django.utils.encoding import smart_str

API_URL = settings.API_ENDPOINT
Subscription_URL = settings.SUBSCRIPTION_URL

def azure_upload(request):
    if request.method == "POST":
        file = request.FILES.get("file")
        location = request.POST.get("location")
        file_name =request.POST.get("file_name")
        if file:
            file_name = file.name
            file_url = upload_to_blob(azure_file=file, location=location, file_name=file_name)
            if file_url:
                return JsonResponse({"file_url": file_url})
            else:
                return JsonResponse({"file_url": ""})
        else:
            return JsonResponse({"file_url": "http"})
        
def azure_download(request, file_name, location):
    try:
        file_content = download_blob(filename=file_name, location=location)

        # Create a Django HttpResponse object
        ext = Path(file_name).suffix
        response = HttpResponse(file_content, content_type=mimetypes.guess_type(ext))
        response["Content-Disposition"] = f'attachment; filename="{file_name}"'
        return response
    except FileNotFoundError:
        # Handle the case where the blob does not exist
        return HttpResponse("File not found", status=404)
    except Exception as e:
        # Handle other exceptions as needed
        return HttpResponse(f"Error: {str(e)}", status=500)


def calendar(request):
    calender_obj = Data(API_URL)
    institute_id = request.COOKIES.get('institute_id')
    calendar_url = f"/Calender/get_calender_by_institute/?institute_id={institute_id}"
    access_token = request.COOKIES.get('access_token')
    calendar_data = calender_obj.get_data_by_institute_id(url=calendar_url, jwt=access_token)
 
    payload = {
        "calendar_data": calendar_data,
        'url': API_URL,
        'jwt_token': request.COOKIES.get('access_token'),
        'institute_id':institute_id,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, 'calendar.html', payload)

def dashboard(request):
    payload = {
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, "dashboard.html", payload)

def students(request):
    student_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    student_url = f"/Students/get_students_by_intitute/?institute_id={institite_id}"
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    student_data = student_obj.get_data_by_institute_id(
        url=student_url, params=params, jwt=access_token
    )
    payload = {
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
        "student_data": student_data,
        "url": API_URL,
        "jwt_token": access_token,
        "institute_id": institite_id,
    }
    return render(request, "students.html", payload)


def register_student(request):
    institite_id = request.COOKIES.get("institute_id")
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    student_obj = Data(API_URL)
    class_data = student_obj.get_class_data(
        end_point=f"/Classes/get_classes_by_institute/?institite_id={int(institite_id)}",
        jwt=access_token,
        params=params,
    )
    payload = {
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
        "class_data": class_data["data"],
        "url": API_URL,
        "jwt_token": request.COOKIES.get("access_token"),
        "institute_id": request.COOKIES.get("institute_id"),
    }
    return render(request, "register_student.html", payload)

def staffs(request):
    staff_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    staff_url = f"/Staff/get_staffs_by_institute/"
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    staff_data = staff_obj.get_data_by_institute_id(
        url=staff_url, jwt=access_token, params=params
    )
    payload = {
        "staff_data": staff_data,
        "url": API_URL,
        "jwt_token": access_token,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, "staffs.html", payload)

def register_staff(request):
    access_token = request.COOKIES.get("access_token")
    payload = {
        "url": API_URL,
        "jwt_token": access_token,
        "institute_id": request.COOKIES.get("institute_id"),
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, "register_staff.html", payload)

def registration(request):
    if request.method == "POST":
        form_data = request.POST.dict()
        if form_data["institute_password"] == form_data["confirm_password"]:
            institute_instance = Institute(API_URL)
            institute_result = institute_instance.create_institute_in_subscription(
                form_data, "/create_institute/"
            )
            if institute_result["status"]:
                create_instance = institute_instance.create_institute(
                    end_point="/Institute/", data=institute_result["data"]
                )
                if create_instance["status"]:
                    messages.success(request, "Organization created successfully")
                    return HttpResponseRedirect(reverse("registration"))
                else:
                    messages.error(
                        request,
                        create_instance.get("error", "Error in creating institute"),
                    )
                    return render(request, "registration.html")
            else:
                messages.error(
                    request,
                    institute_result.get("error", "Error in creating institute"),
                )
                return render(request, "registration.html")
    return render(request, "registration.html")

def login(request):
    if request.method == "POST":
        email = request.POST.get("phone_number")
        password = request.POST.get("password")
        end_point = "/Login/token"
        payload = {
            "grant_type": "",
            "username": email,
            "password": password,
            "scope": "",
        }
        total_url = API_URL + end_point
        auth_response = requests.post(total_url, payload)
        if auth_response.status_code == 200:
            response = HttpResponseRedirect(reverse("dashboard"))
            response.set_cookie(
                key="access_token", value=auth_response.json().get("access_token", "")
            )
            response.set_cookie(
                key="institute_id", value=auth_response.json().get("institution_id", "")
            )
            institite_id = auth_response.json().get("institution_id")
            institite_url = (
                f"{API_URL}/Institute/Institute/?institute_id={institite_id}"
            )
            institite_response = requests.get(institite_url)
            subscriber_id = institite_response.json().get("subscribers_id")
            Account_url = (
                f"{Subscription_URL}api/AccountValidation?subscriber_id={subscriber_id}"
            )
            Account_response = requests.get(Account_url)
            data = Account_response.json()
            if len(data) > 0:
                organization_name = data[0].get("OrganizationName")
                message = data[0].get("Message")
                response.set_cookie(key="organization_name", value=organization_name)
                response.set_cookie(key="message", value=message)
                return response
        else:
            messages.error(request, "Invalid credentials")
            return render(request, "registration.html")
    return render(request, "registration.html")

def logout(request):
    response = HttpResponseRedirect(reverse("registration"))
    response.delete_cookie("access_token")
    response.delete_cookie("institute_id")
    messages.success(request, "You have been successfully logged out.")
    return response

def classes(request):
    class_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    class_url = f"/Classes/get_classes_by_institute/?institite_id={institite_id}"
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    class_data = class_obj.get_data_by_institute_id(
        url=class_url, params=params, jwt=access_token
    )

    class_id = None
    class_name = None
    if class_data and isinstance(class_data, list) and class_data:
        first_class_response = class_data[0]
        class_id = first_class_response.get("class_id", None)
        class_name = first_class_response.get("class_name", None)
    payload = {
        "class_data": class_data,
        "jwt_token": access_token,
        "url": API_URL,
        "institute_id": institite_id,
        "class_name": class_name,
        "class_id": class_id,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, "classes.html", payload)

def user(request):
    user_obj = Data(API_URL)
    user_url = "/Users/get_users_by_institute/?institute_id=1010"
    params = {"institute_id": 1010}
    access_token = request.COOKIES.get("access_token")
    user_data = user_obj.get_data_by_institute_id(
        url=user_url, params=params, jwt=access_token
    )
    payload = {
        "user_data": user_data, 
        "jwtToken": access_token,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
        }
    return render(request, "user.html", payload)

def assignments(request):
    access_token = request.COOKIES.get("access_token")
    institute_id = request.COOKIES.get("institute_id")
    assignment_obj = Data(API_URL)
    assignment_url = f"/Assignments/get_assignments_institute/?institution_id={institute_id}"
    params = {"institute_id": 1010}
    assignment_data = assignment_obj.get_data_by_institute_id(
        url=assignment_url, params=params, jwt=access_token
    )
    payload = {
        "assignment_data": assignment_data,
        "jwt_token": access_token,
        "url": API_URL,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
        "institute_id": institute_id,
    }
    return render(request, "assignments.html", payload)

def transportation(request):
    access_token = request.COOKIES.get("access_token")
    institute_id = request.COOKIES.get("institute_id")
    transport_url =f"{API_URL}/Transports/get_all_transports_by_institute/?institute_id={institute_id}"
    header = {"accept": "application/json", "Authorization": f"Bearer {access_token}"}
    transport_data = requests.get(url=transport_url, headers=header)
    print(transport_data)
    if transport_data.status_code == 200:
        payload = {
            "transportation": transport_data.json(),
            "url": API_URL,
            "jwt_token": access_token,
            "institute_id": institute_id,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
        return render(request, "transport.html", payload)
    else:
        payload = {
            "jwt_token": access_token,
            "institute_id": institute_id,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"), 
        }
        return render(request, "transport.html",payload)

def notice(request):
    institute_id = request.COOKIES.get('institute_id')
    url=f"{API_URL}/Notice/get_notices_institute/?institute_id={institute_id}"
    access_token = request.COOKIES.get('access_token')
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}',
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
    }
    notice_data=requests.get(url=url,headers=header)
    if notice_data.status_code==200:
        payload={
            'notices':notice_data.json(),
            'jwt_token':request.COOKIES.get('access_token'),
            'institute_id':institute_id,
            'url':API_URL,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
        return render(request,'notice.html', payload)
    
def notice_create(request):
    access_token = request.COOKIES.get('access_token')
    payload = {
        'url': API_URL,
        'jwt_token': request.COOKIES.get('access_token'),
        'institute_id': request.COOKIES.get('institute_id'),
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, 'notice_create.html', payload)

def notice_edit(request,notice_id):
    access_token = request.COOKIES.get('access_token')
    institute_id = request.COOKIES.get('institute_id')
    if notice_id:
        notice = Notice(api_url=API_URL, id=notice_id, jwt=access_token)
        notice_data = notice.get_notice_data(f"/Notice/get_notice_by_id/?notice_id={notice_id}")
        payload = {
            'notice_data': notice_data['data'],
            "is_edit":1,
            "notice_id": notice_data['data']['notice_id'],
            'url': API_URL,
            'jwt_token': access_token,
            'institute_id': institute_id,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request, 'notice_create.html', payload)

def edit_student(request, student_slug):
    access_token = request.COOKIES.get("access_token")
    institute_id = request.COOKIES.get("institute_id")
    params = {"institute_id": institute_id}
    if student_slug:
        student = Student(api_url=API_URL, slug=student_slug, jwt=access_token)
        data = asyncio.run(student.collect_datas(institute_id))
        student_data = data["student_data"]
        student_data["address"] = student_data["address"].split(",")
        payload = {
            "student_data": student_data,
            "class_data": data["class_data"],
            "is_edit": 1,
            "url": API_URL,
            "jwt_token": access_token,
            "institute_id": institute_id,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request, "register_student.html", payload)

def student_info(request, student_slug):
    institute_id = request.COOKIES.get("institute_id")
    access_token = request.COOKIES.get("access_token")
    if student_slug:
        student = StudentInfo(api_url=API_URL, slug=student_slug, jwt=access_token)
        data = asyncio.run(student.get_all_data(student_slug))
        try:
            student_data = data["student_data"]
            parent_data = data["parent_data"]
            transport_data = data["transport_data"]
        except:
            student_data = []
            parent_data = []
            transport_data = []
        payload = {
            "url": API_URL,
            "jwt_token": access_token,
            "institute_id": institute_id,
            "student_data":student_data,
            "parent_data": parent_data,
            "transport_data": transport_data,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request, "student_info.html", payload)

def edit_staff(request, staff_slug):
    access_token = request.COOKIES.get("access_token")
    institute_id = request.COOKIES.get("institute_id")
    if staff_slug:
        staff = Staff(api_url=API_URL, slug=staff_slug, jwt=access_token)
        staff_data = staff.get_staff_data(
            f"/Staff/get_staffs_by_field/slug/{staff_slug}/"
        )
        staff_data["data"]["address"] = staff_data["data"]["address"].split(",")
        staff_payroll_data = staff.get_staff_payroll_data(
            staff_data["data"]["staff_id"]
        )
        payload = {
            "staff_data": staff_data["data"],
            "staff_payroll_data": staff_payroll_data,
            "is_edit": 1,
            "staff_id": staff_data["data"]["staff_id"],
            "url": API_URL,
            "jwt_token": access_token,
            "institute_id": institute_id,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request, "register_staff.html", payload)

def staff_info(request, staff_slug):
    institute_id = request.COOKIES.get("institute_id")
    access_token = request.COOKIES.get("access_token")
    if staff_slug:
        staff = StaffInfo(api_url=API_URL, slug=staff_slug, jwt=access_token)
        staff_data = asyncio.run(staff.get_all_data(staff_slug))
        print("staffslug", staff_slug)
        payload = {
            "url": API_URL,
            "jwt_token": access_token,
            "staff_data": staff_data["staff_data"],
            "staff_slug": staff_slug,
            "payroll_data" : staff_data["staff_payroll_data"],
            "transport_data": staff_data["staff_transport_data"],
            "documents": staff_data["get_staff_documents_data"],
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request, "staff_info.html", payload)
# gradeing
def gradings(request):
    institute_id = request.COOKIES.get('institute_id')
    params = {"institute_id": institute_id}
    url=f"{API_URL}/Grades/get_grades_institute/?institute_id={institute_id}"
    access_token = request.COOKIES.get('access_token')
    grade_obj = Data(API_URL)
    class_data = grade_obj.get_class_data(
        end_point=f"/Classes/get_classes_by_institute/?institite_id={int(institute_id)}",
        jwt=access_token,
        params=params,
    )
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}',
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
    }
    grade_data=requests.get(url=url,headers=header)
    if grade_data.status_code==200:
        payload={
            'gradings':grade_data.json(),
            'jwt_token':request.COOKIES.get('access_token'),
            'institute_id':institute_id,
            "class_data": class_data["data"],
            'url':API_URL,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request,'gradings.html',payload) 
# accounts
def accounts(request):
    institute_id = request.COOKIES.get('institute_id')
    url=f"{API_URL}/Accounts/get_all_transaction_by_institute/?institute_id={institute_id}"
    access_token = request.COOKIES.get('access_token')
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}',
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
    }
    account_data=requests.get(url=url,headers=header)
    if account_data.status_code==200:
        payload={
            'accounts':account_data.json(),
            'jwt_token':request.COOKIES.get('access_token'),
            'institute_id':institute_id,
            'url':API_URL,
            "organization_name": request.COOKIES.get("organization_name"),
            "message": request.COOKIES.get("message"),
        }
    return render(request,'accounts.html', payload)

def fees(request):
    fee_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    fee_url = f"/Fees/get_all_fees_by_institute/?institution_id={institite_id}"
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    fees_data = fee_obj.get_data_by_institute_id(
        url=fee_url, params=params, jwt=access_token
    )
    payload = {
        "fees_data": fees_data,
        "jwt_token": access_token,
        "url": API_URL,
        "institute_id": institite_id,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request,'fees.html',payload)


def examination(request):
    class_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    exam_url = f"/ParentExams/get_all_parent_exam_by_institute_id?institute_id={institite_id}"
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    exam_data = class_obj.get_data_by_institute_id(
        url=exam_url, params=params, jwt=access_token
    )
    payload = {
        "exam_data": exam_data,
        "jwt_token": access_token,
        "url": API_URL,
        "institute_id": institite_id,
        "organization_name": request.COOKIES.get("organization_name"),
        "message": request.COOKIES.get("message"),
    }
    return render(request, "examination.html", payload)


def examinationInfo(request):
    class_obj = Data(API_URL)
    institite_id = request.COOKIES.get("institute_id")
    params = {"institute_id": institite_id}
    access_token = request.COOKIES.get("access_token")
    exam_data = class_obj.get_data_by_institute_id(
        params=params, jwt=access_token
    )
    payload = {
        "exam_data": exam_data,
        "jwt_token": access_token,
        "url": API_URL,
        "institute_id": institite_id,
    }
    return render(request, "examinationInfo.html", payload)