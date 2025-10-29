from web3 import Web3
from rich.console import Console
import json

console = Console()

# -------------------
# ⚙️ KẾT NỐI BLOCKCHAIN
# -------------------
INFURA_URL = "https://sepolia.infura.io/v3/746871b35e524e2c832ff8eaa4e0cdb6"  # hoặc link Ganache
PRIVATE_KEY = "271c31c1963f221c7ea2355f75a6b0da0be8062455046690dd05c18953c3aa82"
CONTRACT_ADDRESS = "0x4257684D15f17FeD1DC762a0A7643E0126e94C20"

w3 = Web3(Web3.HTTPProvider(INFURA_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
console.print(f"🔗 Connected: {w3.is_connected()} | Account: {account.address}", style="bold green")

# -------------------
# 📄 ĐỌC ABI TỪ FILE JSON (export từ Remix)
# -------------------
with open("../contract/PharmaSupply.json") as f:
    contract_data = json.load(f)
    abi = contract_data["abi"]   # 👈 lấy đúng phần ABI bên trong file JSON

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

# -------------------
# 🧪 CÁC HÀM CHÍNH
# -------------------
def add_drug(name, batch):
    nonce = w3.eth.get_transaction_count(account.address, 'pending')
    gas_price = int(w3.eth.gas_price * 1.2)  # tăng 20% để tránh lỗi replacement

    tx = contract.functions.addDrug(name, batch).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 3000000,
        'gasPrice': gas_price
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    console.print(f"✅ Đã thêm thuốc {name} (batch {batch})", style="bold cyan")
    console.print(f"Tx hash: {w3.to_hex(tx_hash)}")
    w3.eth.wait_for_transaction_receipt(tx_hash)  # đợi mined xong

def update_stage(drug_id, stage, next_owner):
    nonce = w3.eth.get_transaction_count(account.address, 'pending')
    gas_price = int(w3.eth.gas_price * 1.2)

    tx = contract.functions.transferDrug(drug_id, stage, next_owner).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': gas_price
    })
    signed_tx = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    console.print(f"✅ Đã cập nhật giai đoạn {stage} cho thuốc {drug_id}", style="bold cyan")
    console.print(f"Tx hash: {w3.to_hex(tx_hash)}")

def get_drug_info(drug_id):
    name, batch, owner, stage = contract.functions.getDrug(drug_id).call()
    console.print(f"📦 {drug_id}: {name} | Batch {batch} | Owner: {owner} | Stage: {stage}", style="bold green")

# -------------------
# 📦 DEMO
# -------------------
if __name__ == "__main__":
    add_drug("Paracetamol", "BATCH-001")
    get_drug_info(1)
    update_stage(1, 1, account.address)  # Chuyển sang Distributed
    get_drug_info(1)
