const { dbAll, dbGet, dbRun } = require('../db-utils'); // <-- Ensure all utils are imported
const { getIO } = require('../socket');

// This function is now more powerful. It gets patient info AND their services.
exports.getServicesForVisit = async (req, res) => {
    const { visit_id } = req.params;
    console.log(`[WORKLIST DETAIL]: Fetching details for Visit ID: ${visit_id}`);

    try {
        // First, get the patient's name for context.
        const patientQuery = `SELECT p.name FROM patients p JOIN visits v ON p.id = v.patient_id WHERE v.id = ?`;
        const patient = await dbGet(patientQuery, [visit_id]);

        if (!patient) {
            console.warn(`[WORKLIST DETAIL]: No patient found for Visit ID: ${visit_id}`);
            return res.status(404).json({ success: false, data: 'Visit not found.' });
        }
        console.log(`[WORKLIST DETAIL]: Found patient: ${patient.name}`);

        // Now, get the list of services for this visit.
        const servicesQuery = `
            SELECT 
                vs.id as visit_service_id,
                vs.status,
                s.name as service_name,
                s.category
            FROM visit_services vs
            JOIN services s ON vs.service_id = s.id
            WHERE vs.visit_id = ?
        `;
        const services = await dbAll(servicesQuery, [visit_id]);
        console.log(`[WORKLIST DETAIL]: Found ${services.length} services for this visit.`);

        // Combine the results and send them back.
        res.status(200).json({
            success: true,
            data: {
                patient,
                services
            }
        });

    } catch (error) {
        console.error(`[WORKLIST DETAIL FAILED]: for visit ${visit_id}:`, error);
        res.status(500).json({ success: false, data: 'Internal server error.' });
    }
};

// This function remains the same, but let's ensure it's correct.
exports.updateVisitServiceStatus = async (req, res) => {
    const { id } = req.params; // This is the visit_service_id
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, data: 'Status is required.' });
    }

    try {
        const query = `UPDATE visit_services SET status = ? WHERE id = ?`;
        await dbRun(query, [status, id]);

        const io = getIO();
        io.emit('visit_status_updated'); 
        
        console.log(`[STATUS UPDATE]: Updated visit_service_id ${id} to "${status}". Emitting event.`);
        res.status(200).json({ success: true, data: { message: 'Status updated successfully.' } });

    } catch (error) {
        console.error(`[STATUS UPDATE FAILED]: for visit_service ${id}:`, error);
        res.status(500).json({ success: false, data: 'Internal server error.' });
    }
};