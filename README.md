# Prescripto — Doctor Appointment Booking System

A full-stack healthcare platform that simplifies doctor appointment scheduling. It offers dedicated interfaces for **Patients**, **Doctors**, and **Admins**, enabling smooth and secure appointment management.

---

## 🌐 Live Demo

🔗 **Application:** https://appointment-booker-app.vercel.app

---

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, Vite  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas  
**Image Storage:** Cloudinary  
**Authentication:** JWT (JSON Web Tokens)  
**Deployment:** Vercel (Frontend & Admin), Render (Backend)

---

## ✨ Key Features

### 👨‍⚕️ Patient

- Browse doctors by specialty
- Book appointments with available time slots
- View booking history
- Manage personal profile

### 🩺 Doctor

- View and manage upcoming appointments
- Update profile and availability
- Mark appointments as completed or cancelled
- Login credentials managed by Admin

### 🛡️ Admin

- Dashboard with system statistics
- Add new doctors (with image upload)
- Manage the doctor list
- View all appointments across the system

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/prescripto.git
cd prescripto
```

### 2. Backend Setup
```
cd backend  
npm install
```

**Create a .env file in the backend directory:**
```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@prescripto.com
ADMIN_PASSWORD=admin123
```

 **Start the backend server:**

 ```
npm start
```

### 3. Frontend (Patient App) Setup

```
cd frontend
npm install
```

 **Create a .env file in the frontend directory:**

```
VITE_BACKEND_URL=http://localhost:4000
```

**Run the app:**

```
npm run dev
```

### 4. Admin Panel Setup
```
cd admin
npm install
```

**Create a .env file in the admin directory:**
```
VITE_BACKEND_URL=http://localhost:4000
```


**Run the admin panel:**

```
npm run dev
```

### 📁 Project Structure

prescripto/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
└── admin/
    ├── src/
        ├── components/
        ├── pages/
        └── context/

### 🚀 Deployment Notes (CORS & Vercel)

To avoid "page not found" issues on refresh in Vercel, add a vercel.json file in both frontend and admin folders:
```
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```