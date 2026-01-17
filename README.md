# 🚗 Digital Parking Management System

The **Digital Parking Management System** is a full-stack web application designed to digitally manage parking slots, bookings, and violations.  
It replaces manual parking management with an efficient, automated, and user-friendly system.

This project was built as a **practical full-stack application** using modern web technologies.

---

## 🎯 Project Objective

The main goal of this project is to:
- Reduce manual parking management
- Provide real-time parking slot availability
- Allow users to book parking slots easily
- Help administrators monitor bookings and violations digitally

---

## ✨ Key Features

### 👤 User Features
- User registration and login
- View available parking slots
- Book parking slots
- View booking history

### 🅿️ Parking Management
- Real-time slot availability
- Slot booking and release
- Database-driven parking records

### 🚨 Violation Management
- Report parking violations
- Store violation details securely
- Admin access to violation records

### 🛠 Admin Capabilities
- View all bookings
- Manage parking data
- Monitor system activity

---

## 🧰 Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- HTML, CSS, JavaScript

### Backend
- Node.js
- Express.js
- SQLite database
- REST APIs

### Tools
- Git & GitHub
- Visual Studio Code
- PowerShell
- npm

---

## 📁 Project Structure

````text
digital-parking-management-system/
│
├── backend/
│   ├── server.js
│   ├── init_db.js
│   ├── migrate.js
│   ├── seed_slots.js
│   ├── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│
├── screenshots/
├── .gitignore
└── README.md


---

## ⚙️ How to Run the Project Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Sumit-Chourasia/digital-parking-management-system.git
cd digital-parking-management-system

2️⃣ Run Backend Server
cd backend
npm install
node init_db.js
node server.js


Backend will start on:

http://localhost:5000

3️⃣ Run Frontend Application
cd frontend
npm install
npm run dev


Frontend will start on:

http://localhost:5173

📸 Screenshots

Screenshots of the application interface are available in the screenshots/ folder.

🔐 Security & Best Practices

Database files are excluded from GitHub

Clean Git commit history

Separate frontend and backend

Scalable and maintainable structure

🚀 Future Improvements

Online payment integration

Vehicle number recognition

Advanced admin analytics

Cloud database support

Mobile application version

👨‍💻 Author

Sumit Chourasia

GitHub: https://github.com/Sumit-Chourasia

📄 Note

This project is created for learning, academic, and portfolio purposes.