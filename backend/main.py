# =====================================================================================
# 📦 Pharma SupplyChain Backend
# ✅ Phiên bản gộp hoàn chỉnh (MongoDB + FastAPI + Web3 + JWT)
# =====================================================================================

import os
import json
import re
import uvicorn
import random
import jwt
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from web3 import Web3
from typing import List, Dict, Any
from pathlib import Path
from fastapi import Request
from datetime import datetime, timedelta

# -----------------------------------------------------------------------------------
# MONGODB + AUTH
# -----------------------------------------------------------------------------------
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from bson.objectid import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

if not MONGO_URI or not SECRET_KEY:
    raise RuntimeError("Set MONGO_URI and SECRET_KEY in .env")

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users_collection = db.users
    temp_sessions_collection = db.temp_sessions
    transactions_collection = db.transactions

    print(f"✅ MongoDB connected to {client.address[0]} | DB: {db.name}")
except Exception as e:
    raise RuntimeError(f"Error connecting to MongoDB: {e}")

# -----------------------------------------------------------------------------------
# WEB3 + SMART CONTRACT
# -----------------------------------------------------------------------------------
INFURA_URL = os.getenv("INFURA_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CHAIN_ID = int(os.getenv("CHAIN_ID", "11155111"))

if not INFURA_URL or not CONTRACT_ADDRESS:
    raise RuntimeError("Set INFURA_URL and CONTRACT_ADDRESS in .env")

w3 = Web3(Web3.HTTPProvider(INFURA_URL))
if not w3.is_connected():
    raise RuntimeError("Web3 not connected. Check INFURA_URL")

abi_path = Path(__file__).resolve().parents[1] / "contract" / "PharmaSupply.json"
if not abi_path.exists():
    abi_path = Path("contract/PharmaSupply.json")
if not abi_path.exists():
    raise RuntimeError(f"ABI file not found at {abi_path}")

with open(abi_path, "r", encoding="utf-8") as f:
    contract_json = json.load(f)
    abi = contract_json.get("abi", contract_json if isinstance(contract_json, list) else None)
    if abi is None:
        raise RuntimeError("ABI not found in JSON file")

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS.strip()), abi=abi
)

account = None
if PRIVATE_KEY:
    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"🔐 Backend signer account: {account.address}")

# -----------------------------------------------------------------------------------
# FASTAPI SETUP + CORS
# -----------------------------------------------------------------------------------
app = FastAPI(title="Pharma SupplyChain Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://10.21.5.119:5173",
        "http://10.21.5.119:5174",
        "http://192.168.1.158:5173",
        "http://192.168.1.158:5174",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):(5173|5174)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------------
# MODELS
# -----------------------------------------------------------------------------------
class PhoneRequest(BaseModel):
    phone: str


class OTPRequest(BaseModel):
    phone: str
    otp_code: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class PasswordRequest(BaseModel):
    phone: str
    password: str
    temp_token: str


class AddDrugPayload(BaseModel):
    name: str
    batch: str
    price: float | None = None


class TransferPayload(BaseModel):
    id: int
    next_stage: int
    to_address: str | None = None


# -----------------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------------
def send_signed_tx(tx):
    if not PRIVATE_KEY:
        raise RuntimeError("PRIVATE_KEY not configured.")
    signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    return w3.to_hex(tx_hash)


def create_access_token(user_id: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"user_id": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=401, detail="Token không hợp lệ")

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")


# -----------------------------------------------------------------------------------
# AUTHENTICATION API (OTP + PASSWORD + LOGIN)
# -----------------------------------------------------------------------------------
@app.post("/api/auth/start")
def start_auth(request_data: PhoneRequest):
    phone = request_data.phone
    if not re.fullmatch(r"\d{10,11}", phone):
        raise HTTPException(status_code=400, detail="Số điện thoại không hợp lệ")

    if users_collection.count_documents({"phone": phone}) > 0:
        return {"status": "success", "message": "Đã có tài khoản", "action": "LOGIN"}

    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    temp_sessions_collection.update_one(
        {"phone": phone},
        {
            "$set": {
                "otp_code": otp_code,
                "attempts": 0,
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(minutes=5),
            }
        },
        upsert=True,
    )

    return {
        "status": "success",
        "message": f"Mã OTP của bạn: {otp_code}",
        "otp_displayed": otp_code,
        "action": "VERIFY_OTP",
    }


@app.post("/api/auth/verify_otp")
def verify_otp(data: OTPRequest):
    session = temp_sessions_collection.find_one({"phone": data.phone})
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên xác thực")

    if session["expires_at"] < datetime.utcnow():
        temp_sessions_collection.delete_one({"phone": data.phone})
        raise HTTPException(status_code=400, detail="OTP đã hết hạn")

    if session["otp_code"] != data.otp_code:
        temp_sessions_collection.update_one({"phone": data.phone}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=401, detail="Sai mã OTP")

    temp_sessions_collection.delete_one({"phone": data.phone})
    token_payload = {
        "phone": data.phone,
        "action": "set_password_allowed",
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    temp_token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"status": "success", "message": "Xác thực thành công", "temp_token": temp_token}


@app.post("/api/auth/set_password")
def set_password(data: PasswordRequest):
    try:
        payload = jwt.decode(data.temp_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("phone") != data.phone:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn")

    hashed_pw = hashpw(data.password.encode("utf-8"), gensalt()).decode("utf-8")
    users_collection.insert_one({"phone": data.phone, "password": hashed_pw})
    return {"status": "success", "message": "Đăng ký thành công"}


@app.post("/api/login")
def login_user(data: LoginRequest):
    user = users_collection.find_one({"phone": data.phone})
    if not user or not checkpw(data.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")

    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}


# -----------------------------------------------------------------------------------
# BLOCKCHAIN API (YÊU CẦU ĐĂNG NHẬP)
# -----------------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True, "connected": w3.is_connected(), "network": w3.eth.chain_id}


@app.get("/drugs", response_model=List[Dict[str, Any]])
def get_all_drugs(current_user: dict = Depends(get_current_user)):
    try:
        total = contract.functions.drugCount().call()
        arr = []
        for i in range(1, total + 1):
            d = contract.functions.drugs(i).call()
            arr.append(
                {
                    "id": d[0],
                    "name": d[1],
                    "batch": d[2],
                    "owner": d[3],
                    "stage": int(d[4]),
                }
            )
        return arr
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/drugs")
def add_drug(payload: AddDrugPayload, current_user: dict = Depends(get_current_user)):
    try:
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        tx = contract.functions.addDrug(payload.name, payload.batch).build_transaction(
            {
                "from": account.address,
                "nonce": nonce,
                "gas": 300000,
                "gasPrice": int(w3.eth.gas_price * 1.1),
                "chainId": CHAIN_ID,
            }
        )
        tx_hash = send_signed_tx(tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)  # 🕒 Đợi xác nhận

        return {"tx": tx_hash, "status": "confirmed", "blockNumber": receipt.blockNumber}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/drugs/transfer")
def transfer_drug(payload: TransferPayload, current_user: dict = Depends(get_current_user)):
    try:
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        to_addr = payload.to_address or account.address
        tx = contract.functions.transferDrug(
            payload.id, payload.next_stage, Web3.to_checksum_address(to_addr)
        ).build_transaction(
            {
                "from": account.address,
                "nonce": nonce,
                "gas": 300000,
                "gasPrice": int(w3.eth.gas_price * 1.1),
                "chainId": CHAIN_ID,
            }
        )
        tx_hash = send_signed_tx(tx)
        return {"tx": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# -----------------------------------------------------------------------------------
# 💊 TRANSACTION API — Lưu & Thống kê giao dịch (MongoDB)
# -----------------------------------------------------------------------------------

@app.post("/api/purchase")
async def add_purchase(request: Request):
    """
    Lưu thông tin giao dịch (mua thuốc) vào MongoDB.
    """
    try:
        # Log request info để debug
        client_host = request.client.host if request.client else "unknown"
        print(f"📥 Received purchase request from {client_host}")
        print(f"📥 Request headers origin: {request.headers.get('origin', 'N/A')}")
        
        data = await request.json()
        print(f"📥 Purchase data received: {json.dumps(data, indent=2, default=str)}")
        
        if "price_eth" not in data or "medicine" not in data:
            print(f"❌ Missing required fields. Data keys: {list(data.keys())}")
            raise HTTPException(status_code=400, detail="Thiếu thông tin giao dịch")

        # Lấy customer (địa chỉ ví hoặc số điện thoại)
        customer = data.get("customer", "unknown")

        # Chuẩn hóa medicine
        medicine_data = data.get("medicine", [])
        medicine_str = ""

        # Trường hợp medicine là JSON string
        if isinstance(medicine_data, str):
            try:
                medicine_data = json.loads(medicine_data)
            except json.JSONDecodeError:
                # Nếu không phải JSON → coi như string thuốc đơn
                medicine_str = medicine_data

        # Nếu là list (ví dụ list object)
        if isinstance(medicine_data, list):
            medicine_str = ", ".join([
                f"{item.get('name', item.get('medicine', 'Unknown'))} (x{item.get('qty', item.get('quantity', 1))})"
                if isinstance(item, dict)
                else str(item)
                for item in medicine_data
            ])
        # Nếu là dict đơn lẻ
        elif isinstance(medicine_data, dict):
            medicine_str = f"{medicine_data.get('name', medicine_data.get('medicine', 'Unknown'))} (x{medicine_data.get('qty', medicine_data.get('quantity', 1))})"
        # Nếu chưa có giá trị chuỗi thì fallback
        elif not medicine_str:
            medicine_str = str(medicine_data)

        # Lưu vào MongoDB
        transaction_doc = {
            "customer": customer,
            "medicine": medicine_str,
            "price_eth": float(data["price_eth"]),
            "timestamp": datetime.utcnow(),
            "tx_hash": data.get("tx_hash"),
            "chain_id": data.get("chain_id"),
            "block_number": data.get("block_number"),
        }

        transactions_collection.insert_one(transaction_doc)
        print(f"✅ Đã lưu giao dịch: {customer} - {medicine_str} - {data['price_eth']} ETH")

        return {"message": "✅ Purchase recorded successfully", "id": str(transaction_doc.get("_id", ""))}

    except Exception as e:
        print(f"❌ Error recording purchase: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/revenue")
def get_revenue(month: int, year: int):
    start = datetime(year, month, 1) - timedelta(hours=7)
    end = datetime(year + (month // 12), (month % 12) + 1, 1) - timedelta(hours=7)

    results = list(transactions_collection.find({
        "timestamp": {"$gte": start, "$lt": end}
    }))

    total_revenue = sum(float(tx.get("price_eth") or 0) for tx in results)

    print(f"✅ Found {len(results)} tx | Total = {total_revenue} ETH")

    formatted = [
        {
            "customer": tx.get("customer"),
            "medicine": str(tx.get("medicine")),
            "price_eth": tx.get("price_eth"),
            "date": tx["timestamp"].strftime("%Y-%m-%d"),
        }
        for tx in results
    ]

    return {"total": total_revenue, "transactions": formatted}

@app.get("/api/transactions")
async def get_transactions():
    """Lấy tất cả transactions (không cần auth)"""
    try:
        transactions = list(transactions_collection.find({}).sort("timestamp", -1).limit(100))
        # Convert ObjectId và datetime thành string
        for tx in transactions:
            tx["_id"] = str(tx["_id"])
            if isinstance(tx.get("timestamp"), datetime):
                tx["timestamp"] = tx["timestamp"].isoformat()
        return {"count": len(transactions), "data": transactions}
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return {"count": 0, "data": []}

@app.get("/")
async def root():
    return {"message": "🚀 Pharma Supply Backend is running!"}
# -----------------------------------------------------------------------------------
# KHỞI CHẠY SERVER
# -----------------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
