# Office Management System – Technologies Used

This **Office Management System** is developed using the **MERN Stack**, which includes **MongoDB**, **Express.js**, **React**, and **Node.js**.
It also uses several modern libraries for **real-time communication, security, and UI design**.

---

# 1. Core Architecture (MERN Stack)

### 1. Database Layer

* **MongoDB**

  * A NoSQL database used to store:
  * Employees data
  * Attendance records
  * Tasks and meetings
  * Chat history

* **Mongoose**

  * An Object Data Modeling (ODM) library used with MongoDB.
  * Helps create **schemas and structured data models** in Node.js.

---

### 2. Backend Framework

* **Express.js**

  * A lightweight backend framework used to create **RESTful APIs** such as:
  * `/api/employees`
  * `/api/tasks`
  * `/api/meetings`

---

### 3. Frontend Application

* **React (v19)**

  * Used to build the **interactive user interface**.
  * Implements a **Single Page Application (SPA)** architecture.

* **Vite**

  * Used as the build tool instead of Create React App.
  * Provides **faster development and build performance**.

---

### 4. Runtime Environment

* **Node.js**

  * JavaScript runtime used to run the backend server and APIs.

---

# 2. Real-Time Communication

* **Socket.IO**

Used for **real-time messaging features**, including:

* Instant chat between employees
* Message editing
* Message deletion
* Live updates without refreshing the page

Both backend (`socket.io`) and frontend (`socket.io-client`) are used.

---

# 3. Frontend UI & Styling

### UI Framework

* **Tailwind CSS (v4)**

  * Utility-first CSS framework used to design:
  * Responsive layouts
  * Modern dashboards
  * Glassmorphism effects
  * Gradient backgrounds

---

### Icons

* **Lucide React**

  * Provides clean **SVG icons** used in:
  * Sidebar navigation
  * Delete buttons
  * Meeting icons
  * Dashboard actions

---

### Data Visualization

* **Recharts**

Used to create **interactive charts**, such as:

* Attendance analytics
* Employee performance graphs
* Dashboard reports

---

### Utility Libraries

* **clsx**
* **tailwind-merge**

Used to **dynamically manage CSS class names**, such as highlighting the active sidebar link.

---

# 4. Routing & State Management

### Client-Side Routing

* **React Router (v7)**

Handles navigation between pages like:

* Dashboard
* Employees
* Tasks
* Meetings

It also implements **Protected Routes** to restrict access to authorized users only.

---

### Global State Management

* **React Context API**

Used to manage global states:

* **AuthContext**

  * Stores login status and user authentication.

* **SocketContext**

  * Maintains the global WebSocket connection for real-time chat.

---

# 5. Backend Security & Utilities

### Authentication

* **JSON Web Token (JWT)**

  * Used for **secure authentication**.
  * After login, users receive a token that verifies their identity for API requests.

---

### Password Security

* **bcrypt**

Used to:

* Hash passwords
* Salt passwords
* Prevent storing passwords in plain text

---

### API Security

* **CORS**

Middleware that:

* Controls which domains can access the backend API
* Protects the server from unauthorized requests

---

### API Communication

* **Axios**

Used in the frontend to:

* Send HTTP requests to backend APIs
* Automatically attach JWT tokens
* Handle API responses efficiently

---

# Summary

This Office Management System uses modern technologies to deliver:

* **Full-stack MERN architecture**
* **Real-time chat functionality**
* **Secure authentication**
* **Interactive dashboards**
* **Responsive and modern UI**

---

