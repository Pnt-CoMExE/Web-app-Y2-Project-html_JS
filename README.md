# 🏍️ Motorcycle Borrowing System

A web-based **Motorcycle Borrowing & Asset Management System** built for educational institutions. Students can browse and request motorcycles, lecturers (lenders) approve/reject requests, and staff manage inventory and returns.

---

## ✨ Features

### 👤 Student
- Browse available motorcycles with images and pricing
- Submit borrowing requests with date range & total price
- View pending request status in real-time
- Access borrowing history (approved, disapproved, returned)

### 👨‍🏫 Lecturer / Lender
- View all motorcycles and their current status
- Approve or disapprove pending student requests
- Track borrowing history and decisions made

### 👷 Staff
- Full CRUD management of motorcycle inventory
- Oversee dashboard with status breakdown (available, pending, borrowed, disabled)
- Process motorcycle returns and update statuses
- View complete borrowing history across all users

---

## 🛠️ Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| **Backend**  | Node.js, Express.js                                |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5     |
| **Database** | MySQL                                              |
| **Auth**     | Session-based (express-session), bcryptjs          |
| **Security** | Helmet, CORS, input validation (validator.js)      |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [MySQL](https://www.mysql.com/) server running locally
- npm (comes with Node.js)

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pnt-CoMExE/Web-app-Y2-Project-html_JS.git
cd Web-app-Y2-Project-html_JS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Import the SQL file to create the database and tables:

```bash
mysql -u root -p < ce_rental.sql
```

### 4. Configure database connection

Create a `.env` file in the project root with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ce_rental
SESSION_SECRET=your-session-secret
PORT=3000
```

> **Note:** The `config/db.js` file is gitignored (it contains credentials). You can either let the app read from `.env` (recommended) or create `config/db.js` manually using the `config/db.example.js` template if available.

### 5. Start the server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start at **http://localhost:3000**.

---

## 🔐 User Roles

| Role       | Description                        |
| ---------- | ---------------------------------- |
| **1**      | Student – borrows motorcycles      |
| **2**      | Staff – manages inventory & returns |
| **3**      | Lecturer / Lender – approves requests |

---

## 📁 Project Structure

```
📦 Web-app-Y2-Project-html_JS
├── app.js                  # Express server & API routes
├── config/
│   └── db.js              # Database connection config
├── views/
│   ├── Login.html
│   └── Register.html
├── student/                # Student pages (browse, request, history)
├── staff/                  # Staff pages (dashboard, manage, history)
├── lender/                 # Lender pages (dashboard, requests, history)
├── bootstrap5/             # Bootstrap 5 & SweetAlert2 assets
├── img/                    # Images (backgrounds, icons, motorcycles)
├── test/                   # Test pages
├── ce_rental.sql           # Database schema & seed data
├── package.json
└── .gitignore
```

---

## 📸 Screenshots

> _(Add screenshots here)_

---

## 📄 License

This project is for educational purposes.
