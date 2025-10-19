const { db } = require('../database');

// POST /api/services
exports.createService = (req, res) => {
    const { name, category, price, description, requires_specimen } = req.body;

    if (!name || !category || price === undefined) {
        return res.status(400).json({ success: false, data: "Name, category, and price are required." });
    }

    const query = `INSERT INTO services (name, category, price, description, requires_specimen) VALUES (?, ?, ?, ?, ?)`;
    // Ensure boolean is stored as 0 or 1
    const params = [name, category, parseFloat(price), description, requires_specimen ? 1 : 0];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        res.status(201).json({ 
            success: true, 
            data: { id: this.lastID, ...req.body }
        });
    });
};

// GET /api/services
exports.getAllServices = (req, res) => {
    const query = `SELECT * FROM services ORDER BY category, name`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        res.status(200).json({ success: true, data: rows });
    });
};

// GET /api/services/:id
exports.getService = (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM services WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, data: "Service not found." });
        }
        res.status(200).json({ success: true, data: row });
    });
};

// PUT /api/services/:id
exports.updateService = (req, res) => {
    const { id } = req.params;
    const { name, category, price, description, requires_specimen } = req.body;

    const query = `
        UPDATE services SET
            name = COALESCE(?, name),
            category = COALESCE(?, category),
            price = COALESCE(?, price),
            description = COALESCE(?, description),
            requires_specimen = COALESCE(?, requires_specimen)
        WHERE id = ?`;
    const params = [name, category, price !== undefined ? parseFloat(price) : null, description, requires_specimen !== undefined ? (requires_specimen ? 1 : 0) : null, id];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, data: "Service not found." });
        }
        res.status(200).json({ success: true, data: `Service ${id} updated.` });
    });
};

// DELETE /api/services/:id
exports.deleteService = (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM services WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, data: "Service not found." });
        }
        res.status(200).json({ success: true, data: `Service ${id} deleted.` });
    });
};