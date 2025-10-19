const { db } = require('../database')

// for POST
const createPatient = (req, res) => {
    const { name, dob, address } = req.body

    if(!name || !dob) {
        return res.status(400).json({success:false,data:"Error! Name and Date of Birth are both required."})
    }

    const query = `INSERT INTO patients (name, dob, address) VALUES (?,?,?)`
    const params = [name, dob, address]

    db.run(query, params, function(err) {
        if(err){
            return res.status(500).json({success:false,data:err.message})
        }
        res.status(201).json({success:true,data:{id:this.lastID,name:name,dob:dob,address:address}})
    })
}

// for SEARCH
const searchPatient = (req, res) => {
    const searchStr = req.query.name

    if (!searchStr) {
        return res.status(200).json({success:true,data:[]}); 
    }

    const query = `SELECT * FROM patients WHERE name LIKE ?`
    const params = [`%${searchStr}%`]

    db.all(query, params, (err, rows) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        res.status(200).json({success:true,data:rows})
    })
}

// for GET (single patient)
const getPatient = (req, res) => {
    const { id } = req.params

    const query = "SELECT * FROM patients WHERE id = ?"
    const params = [id]

    db.get(query, params, (err, row) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(row) {
            return res.status(200).json({success:true,data:row})
        } else {
            return res.status(404).json({success:false,data:"Enter a valid ID."})
        }
    })
}

// for GET (all patients)
const getAllPatients = (req, res) => {
    const query = `
        SELECT * FROM patients
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
const updatePatient = (req, res) => {
    const { id } = req.params
    const { name, dob, address } = req.body

    const query = `
        UPDATE patients
        SET 
            name = COALESCE(?, name),
            dob = COALESCE(?, dob),
            address = COALESCE(?, address)
        WHERE id = ?
    `
    const params = [name, dob, address, id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
            return res.status(200).json({success:true,data:`Changes with ${id}: ${this.changes}`})
        } else {
            return res.status(404).json({success:false,data:"Patient not found."})
        }
    })
}

// for DELETE
const deletePatient = (req, res) => {
    const { id } = req.params
    const query = `
        DELETE FROM patients
        WHERE id = ?
    `
    const params = [id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
           return res.status(200).json({success:true,data:`Patient no.${id} was successfully deleted.`})
        } else {
            return res.status(404).json({success:false,data:"Patient not found."})
        }
    })
}

module.exports = { createPatient, searchPatient, getPatient, getAllPatients, updatePatient, deletePatient }