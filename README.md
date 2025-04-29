# VertxAI - Creator Dashboard (Backend)

This is the **backend** repository for the VertxAI Creator Dashboard assignment. It powers the user authentication, credit system, feed aggregation, and admin panel functionalities using Express.js and MongoDB.

> 🛠️ Built with **Node.js**, **Express**, **MongoDB**, **JWT**, and **bcrypt**

---

## 🚀 Live Deployment

- Backend hosted on **Railway**
- Connected to **MongoDB Atlas** for cloud database

---

## 📚 Features Implemented

### ✅ Authentication
- **Register/Login** using email & password
- Secured with **JWT**
- Passwords hashed with **bcrypt**
- Authenticated routes using `verifyUser` middleware

### ✅ User Profile & Dashboard
- Users can:
  - Complete their profile (add username)
  - View their saved posts, reports, and credits
  - Earn credits for actions like login/profile completion

### ✅ Feed Aggregator
- Posts are aggregated via:
  - **Dummy Twitter data**
  - **Live Reddit API**
- Users can:
  - Share, save, and report posts
  - See previously saved or reported items

### ✅ Admin Capabilities
- Admins can:
  - View all users
  - Edit credits for a specific user via their detail page
  - Access all reports/saved posts by users

### ⚙️ Design Decisions
- **Credit editing is restricted to a single user page** only, to ensure clear UX and prevent confusion/errors as user base scales.

---

## 🧰 Tech Stack

| Category        | Tech Used            |
|----------------|----------------------|
| Server         | Node.js + Express.js |
| Database       | MongoDB Atlas        |
| Auth           | JWT + bcrypt         |
| Middleware     | Custom JWT-based auth|
| Deployment     | Railway              |

---

## 🛤️ API Routes

### 🧑 User Routes

| Method | Endpoint            | Description                              |
|--------|---------------------|------------------------------------------|
| POST   | `/register`         | Register a new user                      |
| POST   | `/login`            | Login and get JWT token                  |
| PATCH  | `/complete`         | Complete user profile (username)         |
| GET    | `/user`             | Get authenticated user's data            |

### 📄 Feed Routes

| Method | Endpoint              | Description                             |
|--------|-----------------------|-----------------------------------------|
| GET    | `/posts`              | Get aggregated posts                    |
| POST   | `/share/:postId`      | Simulate sharing a post                 |
| POST   | `/report/:postId`     | Report a post                           |
| POST   | `/save/:postId`       | Save a post                             |
| GET    | `/reports`            | Get authenticated user's reports        |
| GET    | `/saved`              | Get authenticated user's saved posts    |

### 🛠️ Admin Routes

| Method | Endpoint                    | Description                            |
|--------|-----------------------------|----------------------------------------|
| GET    | `/users`                    | Get all users                          |
| GET    | `/user/:userId`             | Get user details                       |
| PATCH  | `/credits/:userId`          | Update user credits                    |
| GET    | `/reports/:userId`          | Get reports by user                    |
| GET    | `/saved/:userId`            | Get saved posts by user                |

---

## 🧪 How to Run the App Locally

### 🔧 Prerequisites

- Node.js (v16+ recommended)
- MongoDB Atlas URI
- Railway / Local development environment

### 📦 Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/vertxai-creator-dashboard-backend.git
   cd vertxai-creator-dashboard-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set environment variables**

   Create a `.env` file in the root directory:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **API is now running at**  
   [http://localhost:5000](http://localhost:5000)

---

## 📝 Future Improvements

- Add logging (winston or morgan)
- Introduce role-based middleware authorization
- Improve error responses and schema validations
- Add analytics endpoints for admin dashboard
