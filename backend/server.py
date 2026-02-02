from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import os
import jwt
import bcrypt
import base64
import logging
from math import radians, sin, cos, asin, sqrt
import httpx

# =========================================================
# ENV + DB
# =========================================================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "smartplate-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# =========================================================
# APP SETUP
# =========================================================
app = FastAPI(title="SmartPlate API", version="1.0.0")
api = APIRouter(prefix="/api")
security = HTTPBearer()

app.add_middleware(SessionMiddleware, secret_key=JWT_SECRET)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================================================
# HELPERS
# =========================================================
def create_token(user_id: str, email: str, role: Optional[str]):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security)
):
    payload = decode_token(creds.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")
    return user

async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return 6371 * 2 * asin(sqrt(a))

# =========================================================
# ROOT
# =========================================================
@app.get("/")
async def root():
    return {
        "message": "SmartPlate API is running",
        "docs": "/docs",
        "api": "/api"
    }

# =========================================================
# AUTH
# =========================================================
@api.post("/auth/register")
async def register(data: Dict[str, Any]):
    if await db.users.find_one({"email": data["email"]}):
        raise HTTPException(400, "Email already registered")

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())
    user = {
        "id": str(uuid.uuid4()),
        "email": data["email"],
        "name": data["name"],
        "password": hashed.decode(),
        "role": None,
        "phone_verified": False,
        "is_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["email"], None)
    user.pop("password")
    return {"token": token, "user": user}

@api.post("/auth/login")
async def login(data: Dict[str, Any]):
    user = await db.users.find_one({"email": data["email"]})
    if not user or "password" not in user:
        raise HTTPException(401, "Invalid credentials")

    if not bcrypt.checkpw(data["password"].encode(), user["password"].encode()):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(user["id"], user["email"], user.get("role"))
    user.pop("_id")
    user.pop("password")
    return {"token": token, "user": user}

@api.post("/auth/google")
async def google_auth(data: Dict[str, str]):
    async with httpx.AsyncClient() as c:
        r = await c.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={data['credential']}"
        )
    if r.status_code != 200:
        raise HTTPException(400, "Invalid Google token")

    g = r.json()
    user = await db.users.find_one({"email": g["email"]})
    if not user:
        user = {
            "id": str(uuid.uuid4()),
            "email": g["email"],
            "name": g.get("name"),
            "picture": g.get("picture"),
            "role": None,
            "phone_verified": False,
            "is_verified": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)

    token = create_token(user["id"], user["email"], user.get("role"))
    user.pop("_id", None)
    return {"token": token, "user": user}

@api.post("/auth/select-role")
async def select_role(data: Dict[str, str], user=Depends(get_current_user)):
    if user.get("role"):
        raise HTTPException(400, "Role already set")

    if data["role"] not in ["ngo", "donor", "volunteer"]:
        raise HTTPException(400, "Invalid role")

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"role": data["role"]}}
    )
    token = create_token(user["id"], user["email"], data["role"])
    return {"role": data["role"], "token": token}

# =========================================================
# NGO REQUESTS
# =========================================================
@api.post("/ngo/request")
async def create_request(data: Dict[str, Any], user=Depends(get_current_user)):
    if user["role"] != "ngo":
        raise HTTPException(403, "NGO only")

    if not user.get("is_verified"):
        raise HTTPException(403, "NGO not verified")

    req = {
        "id": str(uuid.uuid4()),
        "ngo_id": user["id"],
        "food_type": data["food_type"],
        "quantity": data["quantity"],
        "urgency": data.get("urgency", "medium"),
        "location": data["location"],
        "address": data["address"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.food_requests.insert_one(req)
    return {"request": req}

# =========================================================
# DONOR
# =========================================================
@api.post("/donor/fulfill")
async def fulfill(data: Dict[str, Any], user=Depends(get_current_user)):
    if user["role"] != "donor":
        raise HTTPException(403, "Donor only")

    req = await db.food_requests.find_one({"id": data["request_id"]})
    if not req:
        raise HTTPException(404, "Request not found")

    fulfillment = {
        "id": str(uuid.uuid4()),
        "request_id": req["id"],
        "donor_id": user["id"],
        "quantity": data["quantity"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.fulfillments.insert_one(fulfillment)
    return {"fulfillment": fulfillment}

# =========================================================
# ADMIN
# =========================================================
@api.post("/admin/approve-ngo/{user_id}")
async def approve_ngo(user_id: str, admin=Depends(require_admin)):
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_verified": True}}
    )
    return {"message": "NGO approved"}

# =========================================================
# ANALYTICS
# =========================================================
@api.get("/analytics/public")
async def public_analytics():
    return {
        "users": await db.users.count_documents({}),
        "requests": await db.food_requests.count_documents({}),
        "fulfilled": await db.fulfillments.count_documents({})
    }

# =========================================================
# FINAL
# =========================================================
app.include_router(api)

@app.on_event("shutdown")
async def shutdown():
    client.close()
