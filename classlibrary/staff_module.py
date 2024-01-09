import requests
import asyncio


class Staff:
    def __init__(self, api_url="", slug="", jwt=""):
        self.api_url = api_url
        self.slug = slug
        self.jwt = jwt
        self.headers = {
            "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json",
        }

    def get_staff_data(self, url):
        self.total_url = self.api_url + url
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            return {"status": True, "data": response.json()[0]}
        else:
            return {
                "status": False,
                "error": response.json(),
                "status_code": response.status_code,
            }

    def get_staff_payroll_data(self, staff_id=0):
        self.total_url = (
            self.api_url + f"/StaffPayrole/get_payroll_data/?staff_id={staff_id}"
        )
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []


class StaffInfo:
    staff_payroll_url = "/Payroll/payroll/"
    staff_transport_url = "staff/transport/"
    staff_attendance_url = "staff/attendance/"
    staff_academic_url = "staff/academic/"

    def __init__(self, api_url="", slug="", jwt=""):
        self.api_url = api_url
        self.slug = slug
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {jwt}",
        }

    async def get_staff_data(self, staff_slug):
        self.end_point = f"/Staff/get_staffs_by_field/slug/{staff_slug}/"
        self.total_url = self.api_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return data[0]
        else:
            return []

    async def get_transport_details_by_id(self, transport_id=0):
        self.total_url = (
            self.api_url
            + f"/Transports/get_transport_data_by_id/?transport_id={transport_id}"
        )
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []

    async def get_staff_payroll_data(self, staff_id=0):
        self.total_url = (
            self.api_url + f"/StaffPayrole/get_payroll_data_by_staff/?staff_id={staff_id}"
        )
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []
    async def get_staff_documents_data(self, staff_id=0):
        self.total_url = (
            self.api_url + f"/StaffDocuments/get_staff_documents_by_staff_id/?staff_id={staff_id}"
        )
        print("total url",self.total_url)
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            for document in data:
                document_file = document.get("document_file", "")
                split_file = document_file.split("/")
                file_name = split_file[-1] if split_file else ""
                document["document_file"] = file_name
            return data
        else:
            return []

    async def get_all_data(self, staff_slug):
        staff_data = await asyncio.gather(self.get_staff_data(staff_slug))
        staff_transport_data = await asyncio.gather(
            self.get_transport_details_by_id(staff_data[0]["transport_id"])
        )
        staff_payroll_data = await asyncio.gather(
            self.get_staff_payroll_data(staff_data[0]["staff_id"])
        )
        get_staff_documents_data_by_staff_id = await asyncio.gather(
            self.get_staff_documents_data(staff_data[0]["staff_id"])
        )
        return {
            "staff_data": staff_data[0],
            "staff_transport_data": staff_transport_data[0],
            "staff_payroll_data": staff_payroll_data[0],
            "get_staff_documents_data": get_staff_documents_data_by_staff_id[0]
        }
