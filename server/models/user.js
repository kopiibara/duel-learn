const mongoose = require('mongoose')

const {Schema} = mongoose
const userSchema = new Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel