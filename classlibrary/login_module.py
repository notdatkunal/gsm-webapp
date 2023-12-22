from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
import requests

class Login:
    def __init__(self, api_link,access_token) -> None:
        self.api_url = api_link  # Basic FastApi url 
        self.access_token = access_token  # Access token for authentication

    def set_institute_id(self,user_email):
        self.end_point =f'/Users/get_users_by_field/user_email/{user_email}'
        self.total_url = self.api_url + self.end_point
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.access_token
            }
        self.response = requests.get(self.total_url, headers=self.headers)
        if self.response.status_code == 200:
            self.institute_id = self.response_json()["responce"]["institute_id"]
            return self.institute_id

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
            institute_id = self.set_institute_id(email)
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

