# 🌾 e-Grievance Handling System for Gram Panchayat

A web-based application designed to streamline the process of registering, managing, and resolving public grievances in a Gram Panchayat system.

---

## 🚀 Features

### 👤 User (Villagers)

* Register complaints easily
* Track complaint status
* View previous complaints
* Upload supporting images/documents

### 🛠️ Admin

* View all complaints
* Assign complaints to officials
* Update complaint status
* Monitor system activity

### 🏢 Officials

* View assigned complaints
* Update resolution status
* Manage complaint progress

---

## 🧰 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MySQL

---

## 📁 Project Structure

```
grievance-handling-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── assets/
│   ├── pages/
│   └── index.html
│
├── uploads/
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/Donthu-Deepthi/e-grievance-handling-system.git
cd grievance-handling-system
```

---

### 2️⃣ Install dependencies

```
cd backend
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file inside `backend/`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grievance_db
```

---

### 4️⃣ Start the server

```
node server.js
```

---

### 5️⃣ Open in browser

```
http://localhost:3000
```

---

## 🔒 Security Features

* Environment variables for sensitive data
* Input validation
* Structured API handling

---

## 📌 Future Enhancements

* OTP-based login system
* Email/SMS notifications
* Real-time complaint tracking
* Mobile app integration

---
