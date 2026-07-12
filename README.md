# 🛒 RiftMart

> **The Future of Shopping is Autonomous.**

RiftMart is an **AI-native e-commerce platform** designed for autonomous AI agents instead of human shoppers. Inspired by the retro Windows XP/Y2K era, RiftMart demonstrates how AI can independently search, compare, select, and purchase products with minimal human intervention through an immersive terminal-based experience.

---

## 🚀 Features

- 🤖 Autonomous AI Shopping Agent
- 💻 Retro Windows XP / Y2K Interface
- 🖥️ AgentOS Terminal Experience
- 🔍 Intelligent Product Search
- 📊 Price & Review Comparison
- 🛒 Automatic Product Selection
- 🛍️ Self-Driving Shopping Workflow
- 💰 Budget & Expense Tracking
- 📜 Live Agent Logs
- 🔐 Modular AI Payment Protocol
- ⚡ FastAPI Backend
- ⚛️ React Frontend

---

## 🏗️ Project Architecture

```text
User
 │
 ▼
AgentOS Terminal
 │
 ▼
AI Conversation
 │
 ▼
Shopping Agent
 │
 ▼
Shop.exe
 │
 ▼
Product Search
 │
 ▼
Product Evaluation
 │
 ▼
Add To Cart
 │
 ▼
Checkout
 │
 ▼
AI-PAY Protocol
```

---

## 🤖 Autonomous Shopping Workflow

The user only provides:

- Product Name
- Budget

The AI agent automatically performs the following tasks:

- Searches multiple products
- Compares prices
- Evaluates ratings
- Reads reviews
- Selects the best product
- Adds the product to the cart
- Navigates to checkout
- Hands off to the AI Payment Protocol

No manual interaction is required after the shopping mission begins.

---

## 💻 Tech Stack

### Frontend
- React
- Vite
- CSS
- Windows XP / Y2K UI

### Backend
- FastAPI
- Python

### AI Agent
- Autonomous Shopping Logic
- Browser Automation
- Intelligent Product Selection

### Database
- SQLite

---
RiftMart/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AsciiLogo.jsx
│   │   │   ├── BootScreen.jsx
│   │   │   ├── Conversation.jsx
│   │   │   ├── Terminal.jsx
│   │   │   └── Shop/
│   │   │       └── ShopExe.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── payment/
│
├── LICENSE
└── README.md
