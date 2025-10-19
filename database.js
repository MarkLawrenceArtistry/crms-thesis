const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')
let dbPath
let db

// FOR FETCHING DB
try {
    // PRODUCTION
    const { app } = require('electron')
    dbPath = path.join(app.getPath('userData'), 'clinic.db')

    const dbDir = path.dirname(dbPath)
    if(!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
    }

} catch(err) {
    // DEVELOPMENT
    console.log('FETCHING LOCAL DATABASE')
    dbPath = path.join(__dirname, 'clinic.db')
}

// FOR CONNECTING TO DB
const connectDB = () => {
    return new sqlite3.Database(dbPath, (err) => {
        if(err) {
            console.error(err.message)
        } else {
            console.log("CONNECTED TO THE DATABASE")
        }
    })
}

db = connectDB()

// FOR CREATING TABLES IN DB
const initDB = () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob TEXT NOT NULL,
            address TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            description TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'receptionist'
        )`,
        `CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            appointment_datetime TEXT NOT NULL,
            status TEXT NOT NULL,
            reason TEXT,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
        )`,
        // --- NEW TABLES ---
        `CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            requires_specimen BOOLEAN NOT NULL DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            visit_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Ongoing',
            total_amount REAL,
            FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS visit_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending Payment',
            specimen_received_at TEXT,
            FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE,
            FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS queues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            queue_number TEXT NOT NULL,
            queue_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Waiting',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            called_at TEXT,
            counter_number INTEGER,
            FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id INTEGER NOT NULL,
            amount_paid REAL NOT NULL,
            payment_method TEXT NOT NULL,
            transaction_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_service_id INTEGER NOT NULL,
            result_data TEXT,
            result_file_path TEXT,
            reported_by_user_id INTEGER,
            reported_at TEXT,
            FOREIGN KEY (visit_service_id) REFERENCES visit_services (id) ON DELETE CASCADE,
            FOREIGN KEY (reported_by_user_id) REFERENCES users (id) ON DELETE SET NULL
        )`
    ];

    db.serialize(() => {
        console.log('INITIALIZING DATABASE..');
        
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
                console.error("ERROR: Failed to enable foreign key enforcement:", err.message);
            } else {
                console.log("FOREIGN KEY ENFORCEMENT is ON.");
            }
        });

        queries.forEach(query => {
            const tableName = query.split(' ')[5]; // Simple way to get table name
            db.run(query, (err) => {
                if (err) {
                    console.error(`ERROR CREATING ${tableName} TABLE: `, err.message);
                } else {
                    console.log(`${tableName} TABLE CREATED/EXISTS.`);
                }
            });
        });
    });
};

module.exports = { db, initDB }