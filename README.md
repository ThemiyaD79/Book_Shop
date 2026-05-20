# 📚 Elite Bookshop Management System

A sleek, modern, full-stack inventory application built with a modular decoupled architecture. This platform features dynamic search capabilities for public catalog browsers alongside a secure, role-based administration portal for managers to handle complete inventory control.

---

## 🚀 Technical Architecture Stack

| Layer | Technology | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | `React 18` + `Vite` | Single Page Application, dynamic conditional rendering, custom row component UI |
| **Backend API** | `Python 3` + `Flask` | Application Factory Pattern, Blueprint routing structure, RESTful JSON endpoint delivery |
| **Database Engine** | `PostgreSQL` | Relational data persistence, indexed filtering queries, connection safety management |
| **Testing Core** | `Thunder Client` | Direct API endpoint validation and payload verification |

---

## ✨ Key System Features

* **🔍 Real-Time Catalog Filter Pipeline:** Case-insensitive search utilizing PostgreSQL `ILIKE` wildcard operators to fetch targeted book title or author matching sequences instantaneously.
* **🔑 Role-Based Access Control (RBAC):** Clean gateway security tracking standard users vs. authorized administrators.
* **🛠️ Dynamic Manager Control Panel:** Unlocks fully integrated frontend form modes allowing live Create, Read, Update, and Delete (CRUD) executions directly inside the browser grid.
* **📖 Adaptive Row UI Design:** Polished, content-focused structural item rows featuring dynamic cover image frameworks, standalone asset counters, and transactional details modal drawers.

---

## 📁 System Blueprint Structure

```text
Book_Shop/
├── backend/                   # Flask REST API Engine
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py        # Gateway administration verification endpoints
│   │   │   └── catalog.py     # Inventory asset management CRUD streams
│   │   ├── __init__.py        # Application Factory & CORS configuration initialization
│   │   └── database.py        # PostgreSQL driver adapters and connection loops
│   ├── venv/                  # Local isolated environment allocations
│   └── run.py                 # Central execution pipeline root
└── frontend/                  # React Client Workspace
    ├── src/
    │   ├── App.css            # Custom layout definitions & viewport styling sheets
    │   ├── App.jsx            # Application orchestrator, lifecycle mounts, state managers
    │   └── main.jsx           # Virtual DOM compiler node
    └── vite.config.js         # Optimization bundle matrices
