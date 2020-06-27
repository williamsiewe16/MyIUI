let mongoose = require('mongoose')

let fileNameSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    name: String,
    icon: String,
    title: String,
    subtitle: String,
    cycle: Number,
})

module.exports = mongoose.model('FileName',fileNameSchema)
