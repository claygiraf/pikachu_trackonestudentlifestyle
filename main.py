import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("Your API Key is:", api_key)
