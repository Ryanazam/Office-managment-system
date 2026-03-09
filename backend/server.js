const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Route files
// Route files
const auth = require('./routes/authRoutes');
const employees = require('./routes/employeeRoutes');
const attendance = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notifications = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const messageRoutes = require('./routes/messageRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

// Connect to database
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.4:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        const isAllowed = !origin ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            allowedOrigins.includes(origin);

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Set up Socket.io
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            const isAllowed = !origin ||
                origin.startsWith('http://localhost') ||
                origin.startsWith('http://192.168.') ||
                origin.startsWith('http://10.') ||
                allowedOrigins.includes(origin);

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`User connected with socket id: ${socket.id}`);

    // Join a personal room based on their User ID so we can send direct messages
    socket.on('join_personal', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined personal room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Middleware to make io accessible in routing controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/employees', employees);
app.use('/api/attendance', attendance);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notifications);
app.use('/api/messages', messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/meetings', meetingRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Office Employee Management API is running...');
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
