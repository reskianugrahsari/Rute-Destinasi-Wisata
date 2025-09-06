import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables from a .env file in the project root
load_dotenv(dotenv_path="../.env")

app = FastAPI()

# --- API Endpoint ---
# This must be defined BEFORE the static files mount.
@app.get("/api/route")
async def get_route(origin: str, destination: str, mode: str):
    """Calculates a route using the Google Maps Directions API."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Kunci API Google Maps tidak ditemukan. Silakan periksa file .env Anda.")

    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origin,
        "destination": destination,
        "mode": mode.lower(),
        "key": api_key,
        "language": "id"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        directions_data = response.json()
        if directions_data["status"] != "OK":
            return {"status": directions_data["status"], "routes": []}
        return directions_data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Gagal menghubungi layanan Google Maps: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal: {e}")

# --- Static Files Setup ---
# This must be LAST. It will serve index.html for the root path "/"
# and other files like "style.css" and "script.js" from the root as well.
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")

# --- Instructions for running the app ---
# To run this app:
# 1. Create a .env file in the root directory of the project (Rute-Destinasi-Wisata/).
# 2. Add your Google Maps API key to the .env file: GOOGLE_MAPS_API_KEY='YourApiKeyHere'
#    (You need to enable Maps JavaScript API, Places API, and Directions API in your Google Cloud project)
# 3. Install dependencies: pip install -r requirements.txt
# 4. In your terminal, navigate to the 'backend' directory.
# 5. Run the server: uvicorn main:app --reload
# 6. Open your browser and go to http://127.0.0.1:8000
