from datetime import datetime
from django.conf import settings
SWAGGER_URL = settings.SWAGGER_URL
import requests

class Institute:
    swagger_url = f'{SWAGGER_URL}api/Subscribers'
    # api_url = f'{api_url}/Institute/create_institute/'
    def __init__(self,fasapi_url) -> None:
        self.api_url = fasapi_url

    def create_user(self, data={}, end_point=""):
        headers = {'accept': 'application/json', 'Content-Type': 'application/json'}
        response = requests.post(self.api_url + end_point, json=data, headers=headers)

        if response.status_code == 200:
            return {"status": True, "data": response.json()}
        else:
            return {"status": False, "error": response.json(), "status_code": response.status_code}

    def  create_institute(self,end_point="",data={}):
        self.user = {
            "user_name": data.get("point_of_contact"),
            "user_password":data.get("password"),
            "user_email": data.get("institute_email"),
            "user_phone_number":data.get("institute_phone"),
            "is_deleted": False,
            "user_role": "Admin",
            "institute_id": data.get("id"),
            "user_photo_url": "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
        }
        self.headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        print("inside fast api function")
        print("api_url",self.api_url+end_point)
        self.responce = requests.post(self.api_url + end_point,json=data,headers=self.headers)
        if self.responce.status_code == 200:
            user = self.create_user(end_point="/Users/create_user/",data=self.user)
            if user["status"]:
                return {"status":True,"data":self.responce.json()}
            return {"status":False,"data":user["data"]}
        else:
            return {"status":False,"data":self.responce.json()}
        
    def create_institute_in_swagger(self,data = {},fast_api_end_point=""):
        self.swagger_data = {
            "subscribers_id": 0,
            "product_id": 2,
            "plan_id": 6,
            "organization_name": data.get("institution_name"),
            "contact_name": data.get("full_name"),
            "mobile_number": data.get("institute_phone"),
            "email": data.get("institute_email"),
            "address": "gachibowli",
            "date": "2023-12-19T11:03:17.108Z",
            "subcrption_name": "string",
            "plan_name": "string",
            "payment_details": "string",
            "payment_status": "string",
            "remarks": "string",
            "amount_paid": 0,
            "currency": "string",
            "is_active": True,
            "city": "string",
            "state": "string",
            "country": "string",
            "pincode": "string"
        }
        

        print("swagger_data",self.swagger_data)
        try:
            self.responce = requests.post(self.swagger_url,data=self.swagger_data)
            self.responcce_data = self.responce.json()
            if  self.responcce_data["status"]:
                self.fastapi_data = {
                    "id": data.get("institution_id"),
                    "subscribers_id": self.responce.json()["id"],
                    "institute_name": data.get("institution_name"),
                    "institute_address": "string",
                    "institute_city": "string",
                    "institute_state": "string",
                    "institute_country": "string",
                    "institute_pincode": "string",
                    "institute_phone": data.get("institute_phone"),
                    "institute_email": data.get("institute_email"),
                    "institute_logo": "string",
                    "institute_fav_icon": "string",
                    "institute_tag_line": "string",
                    "institute_website": "string",
                    "point_of_contact": "string",
                    "date_of_registration":datetime.today().date().isoformat(),
                    "is_deleted": False
                }
                self.fastapi_data["password"] = data.get("institute_password")
                return {"status":True,"data":self.fastapi_data}
            else:
                return {"status":False,"error":self.responcce_data["message"]}
        except Exception as e:
            return {"error":str(e)}


