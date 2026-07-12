"""
wallet.py
---------
AI-Pay Protocol :: Wallet & Transaction Storage Layer
CyberShopper 2000 Hackathon Project

Handles all JSON file I/O for the wallet balance and transaction history.
"""

import json
import os
import random
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WALLET_FILE = os.path.join(BASE_DIR, "wallet.json")
TRANSACTIONS_FILE = os.path.join(BASE_DIR, "transactions.json")

INITIAL_BALANCE = 10000.0


# ---------------------------------------------------------------------------
# File bootstrap
# ---------------------------------------------------------------------------

def _ensure_files():
    """Create wallet.json / transactions.json with defaults if missing."""
    if not os.path.exists(WALLET_FILE):
        save_wallet({"balance": INITIAL_BALANCE})
    if not os.path.exists(TRANSACTIONS_FILE):
        save_transactions({"transactions": []})


# ---------------------------------------------------------------------------
# Wallet I/O
# ---------------------------------------------------------------------------

def load_wallet():
    _ensure_files()
    with open(WALLET_FILE, "r") as f:
        return json.load(f)


def save_wallet(data):
    with open(WALLET_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_balance():
    return load_wallet()["balance"]


def add_funds(amount):
    wallet_data = load_wallet()
    wallet_data["balance"] += amount
    save_wallet(wallet_data)
    return wallet_data["balance"]


def deduct_balance(amount):
    wallet_data = load_wallet()
    wallet_data["balance"] -= amount
    save_wallet(wallet_data)
    return wallet_data["balance"]


# ---------------------------------------------------------------------------
# Transactions I/O
# ---------------------------------------------------------------------------

def load_transactions():
    _ensure_files()
    with open(TRANSACTIONS_FILE, "r") as f:
        return json.load(f)


def save_transactions(data):
    with open(TRANSACTIONS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def record_transaction(transaction):
    data = load_transactions()
    data["transactions"].append(transaction)
    save_transactions(data)


def get_transaction(tx_id):
    data = load_transactions()
    for t in data["transactions"]:
        if t["transactionId"] == tx_id:
            return t
    return None


# ---------------------------------------------------------------------------
# Transaction ID generation :: RIFT-YYYYMMDD-XXXX
# ---------------------------------------------------------------------------

def generate_transaction_id():
    date_part = datetime.now().strftime("%Y%m%d")

    existing_ids = {t["transactionId"] for t in load_transactions()["transactions"]}

    tx_id = None
    while tx_id is None or tx_id in existing_ids:
        rand_part = f"{random.randint(0, 9999):04d}"
        tx_id = f"RIFT-{date_part}-{rand_part}"

    return tx_id
