const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const http = require('http');

const { db, initDB } = require('./database');
const socketIO = require('./socket'); // <-- IMPORT our new module
const { getIO } = require('./socket'); // Make sure you have this at the top

// Constants
const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO by passing it the HTTP server
const io = socketIO.init(server);

// Routes
const patientRoutes = require('./routes/patients');
const medicineRoutes = require('./routes/medicines');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');
const queueRoutes = require('./routes/queues'); // <-- We need this
const visitRoutes = require('./routes/visits'); // <-- We need this
const paymentRoutes = require('./routes/payments');

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes); // <-- REMOVED the broken middleware
app.use('/api/visits', visitRoutes);
app.use('/api/payments', paymentRoutes);

// --- initAccounts function remains the same ---
function initAccounts() {
    const username = "admin"
    const password = "123"

    const query = `SELECT * FROM users WHERE username = ?`
    const params = [username]

    db.get(query, params, (err, row) => {
        if(err) {
            return console.error(err.message)
        }

        if(!row) {
            bcrypt.hash(password, 10, (err, hash) => {
                if(err) {
                    return console.error(err.message)
                }
                const insertQuery = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`
                db.run(insertQuery, [username, hash, 'admin'], function(err) {
                    if(err) return console.error(err.message)
                    console.log('DEFAULT ADMIN ACCOUNT CREATED.')
                })
            })
        } else {
            console.log('DEFAULT ACCOUNT ALREADY EXISTS.')
        }
    })
}

// Initialization and Server Start
initDB();
initAccounts();

server.listen(PORT, () => {
    console.log(`SERVER IS CURRENTLY OPEN AT http://localhost:${PORT} ....`);
});

app.get('/api/queues/test-broadcast', (req, res) => {
    console.log('[MANUAL TRIGGER]: API endpoint /test-broadcast hit!');
    const io = getIO();
    const testPayload = {
        queue_number: 'T-EST',
        counter_number: 99,
        patient_name: 'Debug User'
    };
    
    console.log('[MANUAL TRIGGER]: Attempting to emit "now_serving" with payload:', testPayload);
    io.emit('now_serving', testPayload);
    
    res.status(200).send('Test broadcast signal sent. Check your server and client consoles.');
});