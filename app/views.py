# myapp/views.py
from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from classlibrary.common_module import Data
from classlibrary.registration_module import Institute
from classlibrary.login_module import Login
from django.contrib import messages
from django.http import HttpResponseRedirect
import requests

API_URL = settings.API_ENDPOINT

def dashboard(request):
    return render(request, 'dashboard.html')

def students(request):
    student_obj = Data(API_URL)
    student_url = "/Students/get_students_by_intitute/"
    params = {'institute_id': 1010}
    access_token = request.COOKIES.get('access_token')
    student_data = student_obj.get_data_by_institute_id(url=student_url,params = params,jwt=access_token)
    payload = {
        "student_data": student_data,
        'jwtToken': access_token
    }
    return render(request, 'students.html',payload)

def staffs(request):
    staff_obj = Data(API_URL)
    staff_url = "/StaffS/get_staffs_by_institute/?institute_id=1010"
    params = {'institute_id': 1010}
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
        if(form_data['institute_password'] == form_data['confirm_password']):
            institute_instance = Institute(API_URL)
            institute_result = institute_instance.create_institute_in_swagger(form_data, "/create_institute/")
        
            if(institute_result['status_code'] == 200):
                messages.success(request, institute_result['msg'])
                return HttpResponseRedirect(reverse("registration"))
            else:
                print("fail")
                print("institute_result['detail']", institute_result['detail'])
                messages.error(request, institute_result['detail'])
                return render(request, 'registration.html')
    return render(request, 'registration.html') 



def login(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        password = request.POST.get('password')
        login_instance = Login(API_URL)
        response = login_instance.authenticate_user(phone_number, password)
        return response
    return render(request, 'registration.html')


def login(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        password = request.POST.get('password')
        login_instance = Login(API_URL)
        response = login_instance.authenticate_user(phone_number, password)
        return response
    return render(request, 'registration.html')

def logout(request):
    # Clear the access token from the cookie
    response = HttpResponseRedirect(reverse('login'))
    response.delete_cookie('access_token')
    response.delete_cookie('institute_id')

    # Optionally, you can add a message to inform the user about the logout
    messages.success(request, 'You have been successfully logged out.')

    return response





