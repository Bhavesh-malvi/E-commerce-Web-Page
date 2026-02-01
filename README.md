# 🛒 Advanced Multi-Vendor E-Commerce Platform

A full-featured, responsive, and dynamic E-commerce web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). This platform supports multiple roles (User, Seller, Admin) and includes advanced features like real-time notifications, personalized recommendations, and a comprehensive seller dashboard.

## 🚀 Tech Stack

### Frontend
- **React.js**: Component-based UI architecture.
- **Tailwind CSS**: Utility-first CSS framework for responsive and modern design.
- **Socket.io-client**: For real-time bi-directional communication (notifications, status updates).
- **Context API**: For global state management (User, Cart, Products, Theme).
- **React Router DOM**: For seamless client-side navigation.
- **Framer Motion**: For smooth animations and transitions.

### Backend
- **Node.js**: Javascript runtime environment.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: ODM library for MongoDB.
- **Socket.io**: Real-time event-based communication.
- **JWT (JSON Web Tokens)**: Secure user authentication.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).

### Third-Party Services
- **Cloudinary**: Cloud storage for optimized image management (Products, Banners).

---

## ✨ Key Features

### 👤 User Features
- **Authentication**: Secure Login/Register with JWT.
- **Smart Browsing**:
  - **Recommendations**: Personalized "Recommended For You" section based on viewing history and interests.
  - **Recently Viewed**: Tracks and displays user's browsing history.
  - **Dynamic Filters**: Filter products by Category, Price, Ratings, etc.
- **Shopping Experience**:
  - **Real-time Cart**: Add/Remove items, update quantities instantly.
  - **Wishlist**: Save favorite items for later.
  - **Checkout**: Secure checkout flow with invoice generation.
- **Order Management**: Track order status, download PDF invoices, and view order history.
- **Interactive UI**: Mobile-responsive design with "Side Status" notifications showing live purchases.

### 🏪 Seller Features
- **Seller Dashboard**: Comprehensive view of sales, orders, and products.
- **Product Management**:
  - Add/Edit/Delete products.
  - Support for detailed descriptions (Blocks: Text, Image, Video, Banners).
  - Multiple image uploads with cropping and optimization.
- **Analytics**: Visual charts for revenue, sales trends, and product performance.
- **Order Fulfillment**: Manage and update order status (Processing, Shipped, Delivered).

### 🛡️ Admin Features
- **User & Seller Management**: Approve sellers, block users/sellers.
- **Platform Analytics**: Overview of total revenue, users, and active deals.
- **Content Management**: Manage homepage banners, mega deals, and coupons.

### ⚙️ Advanced System Capabilities
- **Real-time Updates**: Socket.io integration for instant order status updates and notifications.
- **Performance**: Optimized database queries with indexing and pagination.
- **Security**:
  - Helmet for HTTP headers.
  - Rate Limiting (API & Auth) to prevent abuse.
  - Input validation and sanitization.

---

## 📂 Project Structure

```
E-commerce Web Page/
├── Backend/                 # Server-side logic
│   ├── config/              # DB, Cloudinary, Multer configs
│   ├── controllers/         # Business logic (Product, Order, Browse, etc.)
│   ├── models/              # Mongoose Schemas
│   ├── routes/              # API Endpoints
│   ├── middleware/          # Auth, Error handling, Rate limits
│   └── index.js             # Entry point
│
├── Frontend/                # Client-side application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Global State (AppContext)
│   │   ├── pages/           # Main Page Views (Home, ProductDetails, etc.)
│   │   └── assets/          # Static assets
│   └── main.jsx             # React Entry point
└── README.md                # Project Documentation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas URL)
- Cloudinary Account

### 1. Clone the Repository
```bash
git clone <repository_url>
cd "E-commerce Web Page"
```

### 2. Backend Setup
Navigate to the Backend directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
npm start
```

### 3. Frontend Setup
Navigate to the Frontend directory and install dependencies:
```bash
cd ../Frontend
npm install
```

Start the React development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`!

---

## 🔗 API Overview

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Products**: `/api/product/all`, `/api/product/:id`
- **Browse**: `/api/browse/track`, `/api/browse/me`
- **Recommend**: `/api/recommend/recommend`
- **Cart**: `/api/cart/add`, `/api/cart/get`
- **Orders**: `/api/order/create`, `/api/order/my`

---
*Created by [Your Name/Team]*
