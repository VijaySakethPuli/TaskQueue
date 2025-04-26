# Task Management App

A modern, full-stack task management application with user authentication, multiple lists, reminders, and a beautiful UI.

## Features
- User registration and login (JWT authentication)
- Create, rename, and delete custom task lists
- Add, edit, delete, and star tasks in each list
- Set reminders for tasks (browser notifications)
- Profile editing and password change
- Responsive, dark-themed UI (Material-UI)
- MongoDB for persistent storage

## Tech Stack
- **Frontend:** React, Material-UI
- **Backend:** Node.js, Express, JWT
- **Database:** MongoDB (Mongoose ODM)

---

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Setup MongoDB
- Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a free cloud database, or run MongoDB locally.
- Get your MongoDB connection string.

### 3. Backend Setup
```sh
cd backend
npm install
```
- Create a `.env` file or edit `config/config.js` with your MongoDB URI and JWT secret:
  ```js
  module.exports = {
    jwtSecret: 'your_super_secret_key',
    mongoURI: 'your_mongodb_connection_string'
  };
  ```
- Start the backend:
```sh
node index.js
# or
npx nodemon index.js
```

### 4. Frontend Setup
```sh
cd ../frontend
npm install
```
- Start the frontend:
```sh
npm start
```
- The app will run at [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Backend
- Push your backend code to GitHub.
- Deploy to [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://heroku.com/).
- Set environment variables for `MONGO_URI` and `JWT_SECRET`.

### Frontend
- Push your frontend code to GitHub.
- Deploy to [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or [Render](https://render.com/).
- Update the API base URL in `frontend/src/api.js` to your deployed backend URL.

---

## Usage
- Register a new account or log in.
- Create your first list if prompted.
- Add, edit, star, and delete tasks.
- Set reminders for tasks (browser notifications will alert you).
- Edit your profile or change your password from the profile dialog.
- Logout securely from the sidebar.

---

## License
MIT 