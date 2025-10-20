const { dbAll, dbGet } = require('../db-utils'); // <-- IMPORTANT
const { getIO } = require('../socket');

// POST /api/visits
exports.createVisit = async (req, res) => {
    const { patient_id, service_ids } = req.body;

    if (!patient_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
        return res.status(400).json({ success: false, data: "Patient ID and a list of service IDs are required." });
    }

    const visit_date = new Date().toISOString();

    try {
        console.log('[CREATE VISIT]: Starting transaction.');
        await dbRun('BEGIN TRANSACTION;');

        // 1. Create the visit
        const visitQuery = `INSERT INTO visits (patient_id, visit_date, status) VALUES (?, ?, ?)`;
        const { lastID: visitId } = await dbRun(visitQuery, [patient_id, visit_date, 'Ongoing']);
        console.log(`[CREATE VISIT]: Visit created with ID: ${visitId}`);

        // 2. Add all the services for that visit
        for (const service_id of service_ids) {
            const serviceQuery = `INSERT INTO visit_services (visit_id, service_id, status) VALUES (?, ?, ?)`;
            await dbRun(serviceQuery, [visitId, service_id, 'Pending Payment']);
        }
        console.log(`[CREATE VISIT]: Added ${service_ids.length} services to the visit.`);

        // 3. Create the initial queue number for Payment
        const queue_number = `R${String(visitId).padStart(4, '0')}`;
        const queueQuery = `INSERT INTO queues (visit_id, queue_number, queue_type) VALUES (?, ?, ?)`;
        // The 'status' column has a DEFAULT of 'Waiting', so we don't need to specify it.
        await dbRun(queueQuery, [visitId, queue_number, 'Payment']);
        console.log(`[CREATE VISIT]: Created queue number ${queue_number} with type 'Payment'.`);

        // 4. Commit the transaction
        await dbRun('COMMIT;');
        console.log('[CREATE VISIT]: Transaction committed successfully.');

        // 5. Emit an event to update the queue list on all clients
        const io = getIO();
        io.emit('queue_updated');
        console.log('[CREATE VISIT]: Emitted "queue_updated" event.');

        // 6. Send success response
        res.status(201).json({
            success: true,
            data: {
                visit_id: visitId,
                queue_number: queue_number,
                message: "Visit created successfully."
            }
        });

    } catch (error) {
        await dbRun('ROLLBACK;');
        console.error('[CREATE VISIT FAILED]: Transaction rolled back.', error);
        res.status(500).json({ success: false, data: 'Failed to create visit.' });
    }
};

exports.getVisitDetails = async (req, res) => {
    const { id } = req.params; // This is the visit_id

    try {
        // 1. Get the patient's information for this visit
        const patientQuery = `SELECT p.*, v.id as visit_id FROM patients p JOIN visits v ON p.id = v.patient_id WHERE v.id = ?`;
        const patient = await dbGet(patientQuery, [id]);

        if (!patient) {
            return res.status(404).json({ success: false, data: 'Visit not found.' });
        }

        // 2. Get all services associated with this visit
        const servicesQuery = `
            SELECT s.* 
            FROM services s 
            JOIN visit_services vs ON s.id = vs.service_id 
            WHERE vs.visit_id = ?`;
        const services = await dbAll(servicesQuery, [id]); // <-- USING THE CORRECT PROMISE-BASED FUNCTION

        // 3. Calculate the total amount
        const totalAmount = services.reduce((sum, service) => sum + service.price, 0);

        // 4. Send the complete data packet
        res.status(200).json({
            success: true,
            data: {
                patient,
                services,
                totalAmount
            }
        });

    } catch (error) {
        console.error(`Error fetching details for visit ID ${id}:`, error);
        res.status(500).json({ success: false, data: 'Internal server error.' });
    }
};