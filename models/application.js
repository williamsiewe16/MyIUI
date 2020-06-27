let mongoose = require('mongoose')

let ApplicationSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    creationDate: {type: Date, default: new Date()},
    submissionDate: Date,
    status: {type: Number, default: 0},
    documents: [Object],
    cycle: {type: String, default: "1st"},
    paymentInfo: Object
})

module.exports = mongoose.model('Application',ApplicationSchema)
