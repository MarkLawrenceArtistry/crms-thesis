const { db } = require('../database')
const bcrypt = require('bcryptjs')

const register = (req, res) => {
    const { username, password } = req.body
    if(!username || !password) {
        return res.status(400).json({success:false,data:"Username and password are required."})
    }

    // hash
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({success:false,data:"Error hashing password."})
        }

        const query = `INSERT INTO users (username, password_hash) VALUES (?, ?)`
        const params = [username, hash]

        db.run(query, params, function(err) {
            if(err) {
                return res.status(500).json({success:false,data:err.message})
            }
            res.status(201).json({success:true,data:`USER ID:${this.lastID} CREATED SUCCESSFULLY`})
        })
    })
}

const login = (req, res) => {
    const { username, password } = req.body
    if(!username || !password) {
        return res.status(400).json({success:false,data:"Username and password are required."})
    }

    const query = `SELECT * FROM users WHERE username = ?`
    const params = [username]
    db.get(query, params, (err, user) => {
        if(err) {
            return res.status(500).json({success:false,data:err.message})
        }

        if(!user) {
            return res.status(401).json({success:false,data:"Invalid username or password."})
        }

        // If user was found
        bcrypt.compare(password, user.password_hash, (err, result) => {
            if(err) {
                return res.status(500).json({success:false,data:"Error comparing passwords."})
            }

            if(result) {
                return res.status(200).json({success:true,data:"Login successful!"})
            } else {
                return res.status(401).json({success:false,data:"Invalid username or password."})
            }
        })
    })
}


module.exports = { register, login }