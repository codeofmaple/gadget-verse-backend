# GadgetVerse Backend (Express + MongoDB)

A lightweight backend API built with **Express.js**, **MongoDB**, and **NextAuth-compatible endpoints**, powering the GadgetVerse mini e‑commerce platform.

## 🚀 Live API
**Backend Live URL:** https://gadget-verse-backend.vercel.app  
**API Base:** `https://gadget-verse-backend.vercel.app/api`

---

## 📦 Tech Stack
- **Express.js**
- **MongoDB (Atlas)**
- **bcryptjs** for password encryption
- **CORS**
- **dotenv**
- **serverless-http** (Vercel deployment ready)

---

## 📁 Project Structure
```
root/
│── index.js
│── package.json
│── .env (not included)
└── node_modules/
```

---

## 🔧 Environment Variables
Create a **.env** file:

```
PORT=5000
DB_USERNAME=your_mongo_username
DB_PASSWORD=your_mongo_password
```

---

## ▶️ Running the Server

### Install Dependencies
```
npm install
```

### Start Dev Server
```
npm run dev
```

### Start Production
```
npm start
```

---

## 🔐 Authentication Routes (NextAuth Compatible)

### **POST /api/auth/login**
Login using email + password  
**Body:**
```json
{ "email": "test@gmail.com", "password": "123456" }
```

### **POST /api/auth/register**
Register a new user  
**Body:**
```json
{
 "name": "John Doe",
 "email": "john@gmail.com",
 "password": "123456"
}
```

### **GET /api/auth/user?email=...**
Fetch user data without password  
**Returns:** `{ id, name, email, image, createdAt }`

---

## 🛒 Product Routes

### **GET /api/products**
Query params:
- `search=phone`
- `category=accessories`

### **GET /api/products/recent**
Get latest 6 products.

### **GET /api/products/:id**
Get single product.

### **POST /api/products**
Add product  
**Body Example:**
```json
{
  "title": "Smart Headphones",
  "shortDescription": "Noise cancelling",
  "fullDescription": "Full detailed description...",
  "price": 199,
  "category": "audio",
  "image": "https://..."
}
```

### **DELETE /api/products/:id**
Delete product by ID.

---

## 🗄️ Database Structure (MongoDB)

### **Users Collection**
```
{
 _id,
 name,
 email,
 password (hashed),
 emailVerified,
 image,
 createdAt,
 updatedAt
}
```

### **Products Collection**
```
{
 _id,
 title,
 shortDescription,
 fullDescription,
 price,
 category,
 image,
 createdAt
}
```

---

## 🌐 CORS Configuration
Allowed origins:
- http://localhost:3000
- https://gadgetverse-gold.vercel.app

---

## 🧪 Testing the API
Use:
- Postman
- Thunder Client (VSCode)
- cURL

Example:
```
GET https://gadget-verse-backend.vercel.app/api/products
```

---

## 📜 License
MIT License

---

## 👨‍💻 Developer
Built as part of the **GadgetVerse** mini e‑commerce platform.


Frontend Repo: https://github.com/codeofmaple/gadget-verse-frontend


Backend Repo: https://github.com/codeofmaple/gadget-verse-backend


Live Site: https://gadgetverse-gold.vercel.app
