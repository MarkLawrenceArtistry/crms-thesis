const { dbRun, dbGet } = require('../db-utils');
const { getIO } = require('../socket');

// POST /api/payments
exports.processPayment = async (req, res) => {
    const { visit_id, amount_paid, payment_method } = req.body;

    if (!visit_id || amount_paid === undefined || !payment_method) {
        return res.status(400).json({ success: false, data: 'Visit ID, amount, and payment method are required.' });
    }

    try {
        await dbRun('BEGIN TRANSACTION;');

        // 1. Record the payment
        const paymentQuery = `INSERT INTO payments (visit_id, amount_paid, payment_method) VALUES (?, ?, ?)`;
        await dbRun(paymentQuery, [visit_id, parseFloat(amount_paid), payment_method]);

        // 2. Mark the 'Payment' queue item as 'Finished'
        const finishQueueQuery = `UPDATE queues SET status = 'Finished' WHERE visit_id = ? AND queue_type = 'Payment'`;
        await dbRun(finishQueueQuery, [visit_id]);

        // 3. Get all services for this visit to determine next steps
        const servicesQuery = `
            SELECT s.id as service_id, s.category, s.requires_specimen
            FROM services s
            JOIN visit_services vs ON s.id = vs.service_id
            WHERE vs.visit_id = ?`;
        
        const getServices = new Promise((resolve, reject) => {
            db.all(servicesQuery, [visit_id], (err, rows) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
        const services = await getServices;

        // 4. Update statuses and create new queues for next steps
        for (const service of services) {
            let nextStatus = 'Completed';
            let nextQueueType = null;
            let queueNumberSuffix = '';

            // Determine next step based on service category/type
            if (service.category.toLowerCase() === 'radiology') {
                nextStatus = 'For Radiology';
                nextQueueType = 'Radiology';
                queueNumberSuffix = 'X';
            } else if (service.requires_specimen) {
                nextStatus = 'Pending Specimen';
                nextQueueType = 'Laboratory';
                queueNumberSuffix = 'L';
            } // Add more else-if blocks for other categories like 'Cardiology', etc.

            // Update the status of the specific service within the visit
            const updateServiceStatusQuery = `UPDATE visit_services SET status = ? WHERE visit_id = ? AND service_id = ?`;
            await dbRun(updateServiceStatusQuery, [nextStatus, visit_id, service.service_id]);
            
            // If a next step exists, create a new queue number for it
            if (nextQueueType) {
                const queueNumber = `${queueNumberSuffix}${String(visit_id).padStart(4, '0')}`;
                const newQueueQuery = `INSERT INTO queues (visit_id, queue_number, queue_type) VALUES (?, ?, ?)`;
                await dbRun(newQueueQuery, [visit_id, queueNumber, nextQueueType]);
            }
        }

        await dbRun('COMMIT;');
        
        // 5. Broadcast that queues have been updated
        const io = getIO();
        io.emit('queue_updated');

        res.status(201).json({ success: true, data: { message: 'Payment processed successfully.' } });

    } catch (error) {
        await dbRun('ROLLBACK;');
        console.error('Payment processing failed:', error);
        res.status(500).json({ success: false, data: 'Internal server error during payment processing.' });
    }
};