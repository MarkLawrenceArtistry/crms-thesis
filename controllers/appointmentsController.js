const { db } = require('../database')

// for POST
const createAppointment = (req, res) => {
    const { patient_id, appointment_datetime, status, reason, notes } = req.body

    const query = `INSERT INTO appointments (
                        patient_id,
                        appointment_datetime,
                        status,
                        reason,
                        notes
                    ) 
                    
                    VALUES (?,?,?,?,?)
                    `
    const params = [patient_id, appointment_datetime, status, reason, notes]

    db.run(query, params, function(err) {
        if(err){
            if (err.message.includes('FOREIGN KEY constraint failed')) {
                return res.status(400).json({ error: `Patient with id ${patient_id} does not exist.` });
            }
            return res.status(500).json({success:false,data:err.message})
        }
        res.status(201).json({
            success:true,
            data:{
                id:this.lastID,
                appointment_datetime:appointment_datetime,
                status:status,
                reason:reason,
                notes:notes
            }
        })
    })
}

// for GET (get all appointments from a patient)
const getAllAppointmentsFromPatient = (req, res) => {
    const { patient_id } = req.params

    const query = "SELECT * FROM appointments WHERE patient_id = ?"
    const params = [patient_id]

    db.get(query, params, (err, row) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(row) {
            return res.status(200).json({success:true,data:row})
        } else {
            return res.status(404).json({success:false,data:"Enter a valid patient ID."})
        }
    })
}

// for GET (all appointments for all patients)
const getAllAppointments = (req, res) => {
    const query = `
        SELECT * FROM appointments
    `

    // convention lang yang empty array
    db.all(query, [], (err, rows) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }
        
        if(rows) {
            return res.status(200).json({success:true,data:rows})
        }
    })
}

// for PUT
const updateAppointment = (req, res) => {
    // id kasi single specific appointment
    const { id } = req.params
    const { patient_id, appointment_datetime, status, reason, notes } = req.body

    const query = `
        UPDATE appointments
        SET 
            patient_id = COALESCE(?, patient_id),
            appointment_datetime = COALESCE(?, appointment_datetime),
            status = COALESCE(?, status),
            reason = COALESCE(?, reason),
            notes = COALESCE(?, notes)
        WHERE id = ?
    `

    const params = [patient_id, appointment_datetime, status, reason, notes, id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
            return res.status(200).json({success:true,data:`Changes with ${id}: ${this.changes}`})
        } else {
            return res.status(404).json({success:false,data:"Appointment not found."})
        }
    })
}

// for DELETE (singe specific appointment)
const deleteAppointment = (req, res) => {
    const { id } = req.params
    const query = `
        DELETE FROM appointments
        WHERE id = ?
    `
    const params = [id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
           return res.status(200).json({success:true,data:`Appointment no.${id} was successfully deleted.`})
        } else {
            return res.status(404).json({success:false,data:"Appointment not found."})
        }
    })
}

module.exports = { createAppointment, getAllAppointmentsFromPatient, getAllAppointments, updateAppointment, deleteAppointment }