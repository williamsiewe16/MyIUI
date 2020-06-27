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

let CandidateSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    email: String,
    password: String,
    status: {type: Number, default: 0},

    name: String,
    surname: String,
    number: String,
    signUpToken: String,
    gender: String,
    birthDate: String,
    country: String,
    city: String,
    level: String,
    lastSchool: String,
    lockAccount: {type: Number, default: 0},
    applications: [ApplicationSchema]
})

module.exports = mongoose.model('Candidate',CandidateSchema)
