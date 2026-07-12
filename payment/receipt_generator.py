"""
receipt_generator.py
---------------------
AI-Pay Protocol :: ASCII Receipt Generator
CyberShopper 2000 Hackathon Project

Generates retro Windows-2000 / Y2K styled ASCII receipts using box-drawing
characters, and saves each one to receipts/<transactionId>.txt
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECEIPTS_DIR = os.path.join(BASE_DIR, "receipts")

WIDTH = 54


def _ensure_dir():
    os.makedirs(RECEIPTS_DIR, exist_ok=True)


def _border(char="="):
    return "+" + char * (WIDTH - 2) + "+"


def _center(text):
    text = str(text)
    inner = WIDTH - 4
    if len(text) > inner:
        text = text[: inner - 3] + "..."
    return "| " + text.center(inner) + " |"


def _kv(key, value):
    text = f"{key}: {value}"
    inner = WIDTH - 4
    if len(text) > inner:
        text = text[: inner - 3] + "..."
    return "| " + text.ljust(inner) + " |"


def generate_receipt(transaction):
    """
    Build a Y2K-styled ASCII receipt from a transaction dict and save it
    to receipts/<transactionId>.txt

    transaction keys expected:
        transactionId, productId, productName, amount,
        agentId, balanceAfter, timestamp
    """
    _ensure_dir()

    lines = [
        _border("="),
        _center("*** RIFTMART ***"),
        _center("BUILT FOR THE AGE OF AI  "),
        _border("="),
        _center(".:: TRANSACTION RECEIPT ::."),
        _border("-"),
        _kv("TXN ID", transaction["transactionId"]),
        _kv("DATE/TIME", transaction["timestamp"]),
        _kv("AGENT ID", transaction["agentId"]),
        _border("-"),
        _kv("PRODUCT ID", transaction["productId"]),
        _kv("PRODUCT", transaction["productName"]),
        _border("-"),
        _kv("AMOUNT PAID", f"Rs. {transaction['amount']:.2f}"),
        _kv("BALANCE AFTER", f"Rs. {transaction['balanceAfter']:.2f}"),
        _border("-"),
        _center("STATUS: PAYMENT SUCCESSFUL"),
        _center("[ OK ]"),
        _border("="),
        _center("thank you for shopping w/ AI-Pay"),
        _center("<<< powered by RiftMart >>>"),
        _border("="),
    ]

    receipt_text = "\n".join(lines)

    filename = f"{transaction['transactionId']}.txt"
    filepath = os.path.join(RECEIPTS_DIR, filename)
    with open(filepath, "w") as f:
        f.write(receipt_text)

    return receipt_text, filepath
