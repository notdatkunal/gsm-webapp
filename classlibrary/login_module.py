from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
import requests

class Login:
    def __init__(self, api_link) -> None:
        self.api_url = api_link  # Basic FastApi url 

    def set_institute_id(self,user_email,access_token):
        self.end_point =f'/Users/get_users_by_field/user_email/{user_email}'
        self.params = {'user_email': user_email}
        self.total_url = self.api_url + self.end_point
        self.headers = {
            'access': 'application/json',
            'Authorization': f'Bearer {access_token}'
            }
        self.response = requests.get(self.total_url, params=self.params,headers=self.headers)
        if self.response.status_code == 200:
            self.data= self.response.json()
            if self.data and self.data[0].get('institute_id'):
                self.institute_id = self.data[0].get('institute_id')
                return self.institute_id
            else:
                raise Exception("Institute id not found")
        else:
            raise Exception(self.response)

    def authenticate_user(self, email, password):
        end_point = '/Login/token'  # FastApi end point for login
        payload = {
            "grant_type": "",
            "username": email,
            'password': password,
            'scope': '',
        }
        total_url = self.api_url + end_point
        auth_response = requests.post(total_url, payload)
        if auth_response.status_code == 200:
            # Authentication successful, set the cookie
            response = HttpResponseRedirect(reverse('dashboard'))
            access_token = auth_response.json().get('access_token')
            institute_id = self.set_institute_id(email,access_token)
            # Set the access token in the cookie
            response.set_cookie(key='access_token', value=auth_response.json().get('access_token'))
            response.set_cookie(key='institute_id', value=institute_id)

            return response
        else:
            # Authentication failed
            print(f"Error: {auth_response.status_code}, {auth_response.text}")
            response = HttpResponseRedirect(reverse('login'))
            messages.error(response,"API NOT WORKING")
            return response

