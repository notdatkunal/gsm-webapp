# myapp/views.py
from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from classlibrary.classes_module import ClassData
from classlibrary.common_module import Data
from classlibrary.registration_module import Institute
from classlibrary.login_module import Login
from django.contrib import messages
from django.http import HttpResponseRedirect, HttpResponse
import requests

API_URL = settings.API_ENDPOINT

def calendar(request):
    return render(request, 'calendar.html')

def dashboard(request):
    return render(request, 'dashboard.html')

def students(request):
    student_obj = Data(API_URL)
    institite_id = request.COOKIES.get('institute_id')
    student_url = "/Students/get_students_by_intitute/"
    params = {'institute_id': institite_id}
    access_token = request.COOKIES.get('access_token')
    student_data = student_obj.get_data_by_institute_id(url=student_url,params = params,jwt=access_token)
    payload = {
        "student_data": student_data,
        'jwtToken': access_token
    }
    return render(request, 'students.html',payload)

def register_student(request):
    return render(request, 'register_student.html')

def staffs(request):
    staff_obj = Data(API_URL)
    institite_id = request.COOKIES.get('institute_id')
    staff_url = f"/StaffS/get_staffs_by_institute/"
    params = {'institute_id': institite_id}
    access_token = request.COOKIES.get('access_token')
    
    staff_data = staff_obj.get_data_by_institute_id(url=staff_url,jwt=access_token,params = params)
    # print("staff_data", staff_data)
    payload = {
        "staff_data": staff_data,
        'URL': API_URL,
        'jwtToken': access_token,
    }
    return render(request, 'staffs.html',payload)


def registration(request):
    if request.method == 'POST':
        form_data = request.POST.dict()

        # Check if passwords match
        if form_data['institute_password'] == form_data['confirm_password']:
            institute_instance = Institute(API_URL)
            institute_result = institute_instance.create_institute_in_swagger(form_data, "/create_institute/")

            if institute_result["status"]:
                create_instance = institute_instance.create_institute(end_point="/Institute", data=institute_result["data"])

                if create_instance["status"]:
                    messages.success(request, 'Institute created successfully')
                    return HttpResponseRedirect(reverse("registration"))
                else:
                    messages.error(request, create_instance.get('error', 'Error in creating institute'))
                    return render(request, 'registration.html')

            else:
                messages.error(request, institute_result.get('error', 'Error in creating institute'))
                return render(request, 'registration.html')

    return render(request, 'registration.html')



def login(request):
    if request.method == 'POST':
        email = request.POST.get('phone_number')
        password = request.POST.get('password')
        end_point = '/Login/token'
        payload = {
            "grant_type": "",
            "username": email,
            'password': password,
            'scope': '',
        }
        total_url = API_URL + end_point
        auth_response = requests.post(total_url, payload)
        if auth_response.status_code == 200:
            response = HttpResponseRedirect(reverse('dashboard'))
            response.set_cookie(key='access_token', value=auth_response.json().get('access_token', ''))
            response.set_cookie(key='institute_id', value=auth_response.json().get('institution_id', ''))
            return response
        else:
            messages.error(request, "Invalid Credentials")
            return render(request, 'registration.html')
    return render(request, 'registration.html')



def logout(request):
    # Clear the access token from the cookie
    response = HttpResponseRedirect(reverse('login'))
    response.delete_cookie('access_token')

    # Optionally, you can add a message to inform the user about the logout
    messages.success(request, 'You have been successfully logged out.')

    return response




def classes(request):
    class_obj = Data(API_URL)
    institite_id = request.COOKIES.get('institute_id')
    class_url = f"/Classes/get_classes_by_institute/?institite_id={institite_id}"
    params = {'institute_id': institite_id}
    access_token = request.COOKIES.get('access_token')
    class_data = class_obj.get_data_by_institute_id(url=class_url,params = params,jwt=access_token)
    payload = {
        "class_data": class_data,
        "jwt_tokens": access_token
    }
    return render(request, 'classes.html',payload)    


# ___ClassInfo____

def classinfo(request, slug):
    classId = slug
    print('classId', classId)
    if classId is not None:
        params = {'slug':classId}
        access_token = request.COOKIES.get('access_token')
        classes_obj = ClassData(API_URL,classId,access_token)
        classes_url = f"/Classes/get_classes_by_field/slug/{classId}"
        class_data = classes_obj.get_class_data(url=classes_url,params = params)
        if class_data:
            class_response = class_data[0]  
            class_id = class_response.get('class_id', None)
            
            class_name=class_response.get('class_name',None)
            
            section_url = f"/Sections/get_sections_by_class/?class_id={class_id}/"
            subject_url = f"/Subjects/get_subjects_by_class/?class_id={class_id}/"
            student_url = f"/Students/get_students_by_field/class_id/{class_id}/"
            section_obj = ClassData(API_URL,class_id,access_token)
            section_params = {'class_id':class_id}
            section_data=section_obj.get_section(url=section_url,params=section_params)
            
            subject_obj = ClassData(API_URL,class_id,access_token)
            subject_params = {'class_id':class_id}
            subject_data=subject_obj.get_subject(url=subject_url,params=subject_params)
            

            student_obj = ClassData(API_URL,class_id,access_token)
            student_params = {'class_id':class_id}
            student_data=student_obj.get_students(url=student_url,params=student_params)
            
    
            payload = {
                'class_data': class_data,
                'class_name': class_name,
                'class_id':class_id,
                'section_data': section_data,
                'subject_data':subject_data,
                'student_data':student_data,
                "jwt_token": access_token
                }

            return render(request, 'classinfo.html', payload)
        return render(request, 'classinfo.html', payload)

def user(request):
    user_obj = Data(API_URL)
    user_url = "/Users/get_users_by_institute/?institute_id=1010"
    params = {'institute_id': 1010}
    access_token = request.COOKIES.get('access_token')
    user_data = user_obj.get_data_by_institute_id(url=user_url,params = params,jwt=access_token)
    payload = {
        "user_data": user_data,
        "jwtToken": access_token
    }
    return render(request, 'user.html',payload)    

def assignments(request):
    institite_id = request.COOKIES.get('institute_id')
    assignments_url = f"{API_URL}/Assignment/get_assignments_institute/?institution_id={institite_id}"
    access_token = request.COOKIES.get('access_token')
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
    }
    assignment_data=requests.get(url=assignments_url,headers=header)
    
    if assignment_data.status_code == 200:
        # Filter out deleted assignments
        assignments = [assignment for assignment in assignment_data.json() if not assignment.get('is_deleted', False)]
        
        payload = {
            'assignment': assignments,
            'URL':API_URL,
            'jwt_token': access_token 
        }
        return render(request, 'assignments.html', payload)
    else:
        return HttpResponse("Reload the page")


def transportation(request):
    #   params = {'institute_id': 1010}
    access_token = request.COOKIES.get('access_token')
    transport_url = f"{API_URL}/Transport/get_all_transports/"
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
    }
    transport_data=requests.get(url=transport_url,headers=header)
    print(transport_data.status_code)
    if transport_data.status_code == 200:
        payload = {
            'transportation': transport_data.json(),
            'URL':API_URL,
            'jwt_token':access_token 
        }
        return render(request, 'transport.html', payload)
    else:
        return HttpResponse("Reload the page")
    
def notice(request):
    institute_id = request.COOKIES.get('institute_id')
    url=f"https://gsm-fastapi.azurewebsites.net/Notice/get_notices_institute/?institute_id={institute_id}"
    access_token = request.COOKIES.get('access_token')
    header ={
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
    }
    notice_data=requests.get(url=url,headers=header)
    if notice_data.status_code==200:

        payload={
            'notices':notice_data.json(),
            'jwt_token':access_token
        }
        return render(request,'notice.html', payload)
    else:
        return HttpResponse("Reload the page")