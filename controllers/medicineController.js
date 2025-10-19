const { db } = require('../database')

// for POST
const createMedicine = (req, res) => {
    const { name, quantity, description } = req.body

    if(!name || !quantity) {
        return res.status(400).json({success:false,data:"Error! Name and Quantity are both required."})
    }

    const query = `INSERT INTO medicines (name, quantity, description) VALUES (?, ?, ?)`
    const params = [name, quantity, description];

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        res.status(201).json({success:true,data:{id:this.lastID,name:name,quantity:quantity,description:description}})
    })
}

// for SEARCH
const searchMedicine = (req, res) => {
    const searchStr = req.query.name

    if (!searchStr) {
        return res.status(200).json({success:true,data:[]}); 
    }

    const query = `SELECT * FROM medicines WHERE name LIKE ?`
    const params = [`%${searchStr}%`]

    db.all(query, params, (err, rows) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        res.status(200).json({success:true,data:rows})
    })
}

// for GET (all medicines)
const getAllMedicines = (req, res) => {
    const query = `SELECT * FROM medicines`

    db.all(query, [], (err, rows) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(rows) {
            return res.status(200).json({success:true,data:rows})
        }
    })
}

// for GET (single medicine)
const getMedicine = (req, res) => {
    const { id } = req.params
    const query = `SELECT * FROM medicines WHERE id = ?`
    const params = [id]

    db.get(query, params, (err, row) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(row) {
            return res.status(200).json({success:true,data:row})
        } else {
            return res.status(404).json({success:false,data:"Medicine not found."})
        }
    })
}

// for PUT
const updateMedicine = (req, res) => {
    const { id } = req.params
    const { name, quantity, description } = req.body

    const query = `
        UPDATE medicines
        SET
            name = COALESCE(?, name),
            quantity = COALESCE(?, quantity),
            description = COALESCE(?, description)
        WHERE id = ?
    `
    const params = [name, quantity, description, id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
            return res.status(201).json({success:true,data:`Changes with medicine ID: ${id}: ${this.changes}`})
        } else {
           return res.status(404).json({success:false,data:"Medicine not found."})
        }
    })
}

// for DELETE
const deleteMedicine = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM medicines WHERE id = ?`
    const params = [id]

    db.run(query, params, function(err) {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(this.changes > 0) {
            return res.status(200).json({success:true,data:`Deleted medicine ID: ${id}`})
        } else {
            return res.status(404).json({success:false,data:`Medicine ID: ${id} not found.`})
        }
    })
}

module.exports = { createMedicine, searchMedicine, getAllMedicines, getMedicine, updateMedicine, deleteMedicine }