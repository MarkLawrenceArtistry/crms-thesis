const { db } = require('../database');
const { getIO } = require('../socket');
const { dbRun, dbGet } = require('../db-utils'); // <-- IMPORT our new utils

// GET /api/queues (no changes needed here, but let's keep it consistent)
exports.getQueues = (req, res) => {
    const { type } = req.query;
    if (!type) return res.status(400).json({ success: false, data: "Queue type parameter is required." });
    const query = `
        SELECT 
            q.id as queue_id, 
            q.queue_number, 
            q.status,
            p.name as patient_name,
            v.id as visit_id -- <--- CHANGE THIS LINE (from p.id as patient_id)
        FROM queues q
        JOIN visits v ON q.visit_id = v.id
        JOIN patients p ON v.patient_id = p.id
        WHERE q.queue_type = ? AND q.status = 'Waiting'
        ORDER BY q.created_at ASC
    `;
    db.all(query, [type], (err, rows) => {
        if (err) return res.status(500).json({ success: false, data: err.message });
        res.status(200).json({ success: true, data: rows });
    });
};

// POST /api/queues/call-next (REFACTORED WITH ASYNC/AWAIT)
exports.callNext = async (req, res) => {
    const { queue_type, counter_number } = req.body;

    try {
        console.log(`[ASYNC WORKFLOW]: Finding next patient for queue type: ${queue_type}`);
        
        // 1. Find the next patient in the queue
        const findNextQuery = `SELECT * FROM queues WHERE queue_type = ? AND status = 'Waiting' ORDER BY created_at ASC LIMIT 1`;
        const queueItem = await dbGet(findNextQuery, [queue_type]);

        if (!queueItem) {
            console.log('[ASYNC WORKFLOW]: Queue is empty.');
            return res.status(404).json({ success: false, data: "Queue is empty." });
        }
        console.log('[ASYNC WORKFLOW]: Found patient:', queueItem);

        // 2. Update their status
        const updateQuery = `UPDATE queues SET status = 'Now Serving', called_at = CURRENT_TIMESTAMP, counter_number = ? WHERE id = ?`;
        await dbRun(updateQuery, [counter_number, queueItem.id]);
        console.log('[ASYNC WORKFLOW]: Updated queue item status in DB.');

        // 3. Get the patient's name for the broadcast
        const patientNameQuery = `SELECT name FROM patients p JOIN visits v ON p.id = v.patient_id WHERE v.id = ?`;
        const patient = await dbGet(patientNameQuery, [queueItem.visit_id]);
        console.log('[ASYNC WORKFLOW]: Fetched patient name:', patient ? patient.name : 'N/A');

        // 4. Prepare and broadcast the payload
        const payload = {
            queue_number: queueItem.queue_number,
            counter_number: counter_number,
            patient_name: patient ? patient.name : 'N/A'
        };
        
        const io = getIO();
        console.log('[ASYNC WORKFLOW]: Broadcasting payload:', payload);
        io.emit('now_serving', payload);
        io.emit('queue_updated');

        // 5. Send a success response
        res.status(200).json({ success: true, data: payload });

    } catch (error) {
        console.error('[ASYNC WORKFLOW FAILED]: An error occurred in the callNext process:', error);
        res.status(500).json({ success: false, data: "An internal server error occurred." });
    }
};

// ADD THIS ENTIRE FUNCTION TO THE BOTTOM of queueController.js
exports.debugGetAllQueues = (req, res) => {
    console.log('[DEBUG]: Request received for /debug-all');
    const query = `SELECT * FROM queues`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('[DEBUG]: Error fetching all queues:', err.message);
            return res.status(500).json({ success: false, data: err.message });
        }
        console.log('[DEBUG]: Successfully fetched all queues. Count:', rows.length);
        res.status(200).json({ success: true, data: rows });
    });
};


exports.getNowServing = async (req, res) => {
    const { type } = req.query;
    if (!type) return res.status(400).json({ success: false, data: "Queue type is required." });

    try {
        const query = `
            SELECT q.*, v.patient_id 
            FROM queues q
            JOIN visits v ON q.visit_id = v.id
            WHERE q.queue_type = ? AND q.status = 'Now Serving'
            ORDER BY q.called_at DESC
            LIMIT 1
        `;
        const nowServing = await dbGet(query, [type]);
        res.status(200).json({ success: true, data: nowServing });

    } catch (error) {
        console.error('Error fetching now serving:', error);
        res.status(500).json({ success: false, data: 'Internal server error' });
    }
};