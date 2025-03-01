import requests

API_KEY = "47c3a9cd928242e2a28cc24c9bf7d479"
API_SECRET = "e057f82d4191482a840c042d580e854a"
REQUEST_TOKEN = "3dce734526ab4087b7de556e7e6f2110"

url = "https://developer.paytmmoney.com/accounts/v2/gettoken"

payload = {
    "api_key": API_KEY,
    "api_secret_key": API_SECRET,
    "request_token": REQUEST_TOKEN
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("✅ Access Token:", data["access_token"])
else:
    print("❌ Failed to get Access Token:", response.text)

# import requests

# API_KEY = "47c3a9cd928242e2a28cc24c9bf7d479"
# API_SECRET = "e057f82d4191482a840c042d580e854a"
# REQUEST_TOKEN = "e5cbac2fb03a40b58558b7e487bbb69d"

# url = "https://developer.paytmmoney.com/accounts/v2/gettoken"

# payload = {
#     "api_key": API_KEY,
#     "api_secret": API_SECRET,  # ✅ Corrected key name
#     "request_token": REQUEST_TOKEN
# }

# headers = {"Content-Type": "application/json"}

# try:
#     response = requests.post(url, json=payload, headers=headers)

#     if response.status_code == 200:
#         data = response.json()
#         print("✅ Access Token:", data.get("access_token"))
#         print("✅ Refresh Token:", data.get("refresh_token"))
#         print("Expires In:", data.get("expires_in"), "seconds")
#     else:
#         print("❌ Failed to get Access Token:", response.text)

# except requests.exceptions.RequestException as e:
#     print("❌ API Request Failed:", e)
