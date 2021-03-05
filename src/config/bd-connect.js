const mongoose = require('mongoose')
const { mongoConnect } = require('../config/config')

mongoose.connect(mongoConnect)

module.exports = mongoose
