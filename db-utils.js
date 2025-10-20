const { db } = require('./database');

/**
 * Runs a SQL query that doesn't return rows (INSERT, UPDATE, DELETE).
 * @param {string} sql The SQL query string.
 * @param {Array} params The parameters to bind to the query.
 * @returns {Promise<{lastID: number, changes: number}>}
 */
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('DB Run Error:', err.message);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Runs a SELECT query that is expected to return a single row.
 * @param {string} sql The SQL query string.
 * @param {Array} params The parameters to bind to the query.
 * @returns {Promise<object|null>}
 */
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('DB Get Error:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('DB All Error:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = { dbRun, dbGet, dbAll };