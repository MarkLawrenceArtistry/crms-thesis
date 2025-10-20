const { dbRun, dbGet, dbAll } = require('../db-utils'); // <-- Ensure dbAll is imported
const { getIO } = require('../socket');

// POST /api/payments
exports.processPayment = async (req, res) => {
    const { visit_id, amount_paid, payment_method } = req.body;
    console.log(`\n--- [PAYMENT WORKFLOW STARTED for Visit ID: ${visit_id}] ---`);

    if (!visit_id || amount_paid === undefined || !payment_method) {
        return res.status(400).json({ success: false, data: 'Visit ID, amount, and payment method are required.' });
    }

    try {
        console.log('[STEP 1]: Beginning database transaction.');
        await dbRun('BEGIN TRANSACTION;');

        // 1. Record the payment
        console.log('[STEP 2]: Recording payment in `payments` table.');
        const paymentQuery = `INSERT INTO payments (visit_id, amount_paid, payment_method) VALUES (?, ?, ?)`;
        await dbRun(paymentQuery, [visit_id, parseFloat(amount_paid), payment_method]);

        // 2. Mark the 'Payment' queue item as 'Finished'
        console.log('[STEP 3]: Updating `queues` table to set Payment status to "Finished".');
        const finishQueueQuery = `UPDATE queues SET status = 'Finished' WHERE visit_id = ? AND queue_type = 'Payment'`;
        await dbRun(finishQueueQuery, [visit_id]);

        // 3. Get all services for this visit to determine next steps
        console.log('[STEP 4]: Fetching all services associated with this visit.');
        const servicesQuery = `
            SELECT s.id as service_id, s.category, s.requires_specimen
            FROM services s
            JOIN visit_services vs ON s.id = vs.service_id
            WHERE vs.visit_id = ?`;
        const services = await dbAll(servicesQuery, [visit_id]); // <-- CORRECT, RELIABLE USAGE
        console.log(`[STEP 5]: Found ${services.length} services. Now creating next-step queues.`);

        // 4. Update statuses and create new queues for next steps
        for (const service of services) {
            let nextStatus = 'Completed';
            let nextQueueType = null;
            let queueNumberSuffix = '';

            if (service.category.toLowerCase() === 'radiology') {
                nextStatus = 'For Radiology';
                nextQueueType = 'Radiology';
                queueNumberSuffix = 'X';
            } else if (service.requires_specimen) {
                nextStatus = 'Pending Specimen';
                nextQueueType = 'Laboratory';
                queueNumberSuffix = 'L';
            }
            // Future logic for other departments would go here

            console.log(` -> Processing service ID ${service.service_id}: next status is "${nextStatus}"`);
            const updateServiceStatusQuery = `UPDATE visit_services SET status = ? WHERE visit_id = ? AND service_id = ?`;
            await dbRun(updateServiceStatusQuery, [nextStatus, visit_id, service.service_id]);
            
            if (nextQueueType) {
                const queueNumber = `${queueNumberSuffix}${String(visit_id).padStart(4, '0')}`;
                const newQueueQuery = `INSERT INTO queues (visit_id, queue_number, queue_type) VALUES (?, ?, ?)`;
                await dbRun(newQueueQuery, [visit_id, queueNumber, nextQueueType]);
                console.log(`    -> Created new queue for ${nextQueueType} with number ${queueNumber}`);
            }
        }

        console.log('[STEP 6]: Committing database transaction.');
        await dbRun('COMMIT;');
        
        // 5. Broadcast that queues have been updated
        const io = getIO();
        console.log('[STEP 7]: Emitting "queue_updated" to all clients.');
        io.emit('queue_updated');

        console.log(`--- [PAYMENT WORKFLOW COMPLETED] ---\n`);
        res.status(201).json({ success: true, data: { message: 'Payment processed successfully.' } });

    } catch (error) {
        await dbRun('ROLLBACK;');
        console.error('[PAYMENT WORKFLOW FAILED]: Transaction rolled back.', error);
        res.status(500).json({ success: false, data: 'Internal server error during payment processing.' });
    }
};