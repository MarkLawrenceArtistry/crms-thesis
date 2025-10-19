const { db } = require('../database')

const getStatistics = (req, res) => {
    const getAsync = (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })
    }


    const promises = [
        getAsync("SELECT COUNT(*) as count FROM patients"),
        getAsync("SELECT COUNT(*) as count FROM medicines"),
        getAsync("SELECT COUNT(*) as count FROM medicines WHERE quantity < 10"),
    ]
    
    Promise.all(promises).then(results => {
        res.status(200).json({
            success:true,
            data: {
                totalPatients: results[0].count,
                totalMedicines: results[1].count,
                lowStockMedicines: results[2].count
            }
        })
    }).catch(err => {
        res.status(500).json({success:false,data:err.message})
    })
}

module.exports = { getStatistics }