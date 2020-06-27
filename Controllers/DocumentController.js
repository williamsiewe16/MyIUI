let axios = require('axios')
let Candidate = require('../models/candidate')
let mongoose = require('mongoose')
let functions = require('../functions')
let dotenv = require('dotenv')
let crypto = require('crypto')
let fs = require('file-system')
let util = require('util')
let exec = util.promisify(require('child_process').exec)
let execFile = util.promisify(require('child_process').execFile)

dotenv.config()

module.exports = {
    treatAllDocuments: async (req, res, next) => {
        if(req.body.token == req.session.token){
            let candidate = await Candidate.findOne({email: req.session.email})
            candidate.lockAccount = 1
            Candidate.replaceOne({email: req.session.email},candidate,(err) => {
                res.send('documents successfully submitted')
            })
        }else{
            res.send('no token')
        }
    },
    modifyDocument: async (req, res, next) => {
        let year = (new Date().getFullYear()-1).toString()+"-"+new Date().getFullYear().toString()
        let path = `applications/${year}/undefined`
        if(fs.existsSync(path)) fs.rmdirSync(path)

        if(req.body.token == req.session.token){
            let candidate = await Candidate.findOne({email: req.session.email})
            let last = candidate.applications.length-1, data = {code: req.file.fieldname, path: req.file.path, name: req.file.originalname}
            let documents = candidate.applications[last].documents.filter((document) => document.code != data.code)
            documents.push(data)
            candidate.applications[last].documents = documents
            candidate.applications[last].cycle = req.body.cycle == 0 ? "1st" : "2nd"
            Candidate.replaceOne({email: req.session.email},candidate,(err)=>{
                res.send({path: `${process.env.SERVER}/${req.file.path}`})
            })
        }else{
            res.send('no token')
        }
    },
    deleteDocument: async (req, res, next) => {
        if(req.body.token == req.session.token){
            let candidate = await Candidate.findOne({email: req.session.email})
            let last = candidate.applications.length-1, code = req.body.code
            let documents = candidate.applications[last].documents.filter((document) => document.code != code)
            candidate.applications[last].documents = documents
            candidate.applications[last].cycle = req.body.cycle == 0 ? "1st" : "2nd"
            Candidate.replaceOne({email: req.session.email},candidate,(err) => {
                res.send('done')
            })
        }else{
            res.send('no token')
        }
    },
    deleteDocuments: async (req, res, next) => {
        if(req.body.token == req.session.token){
            let candidate = await Candidate.findOne({email: req.session.email})
            let last = candidate.applications.length-1
            candidate.applications[last].documents = []
            candidate.applications[last].cycle = candidate.applications[last].cycle == "1st" ? "2nd" : "1st"
            Candidate.replaceOne({email: req.session.email},candidate,(err)=>{
                res.send('done')
            })
            let year = (new Date().getFullYear()-1).toString()+"-"+new Date().getFullYear().toString()
            let path = `applications/${year}/${req.session.name}`
            if(fs.existsSync(path)) fs.rmdirSync(path)
        }else{
            res.send('no token')
        }
    },

    getDocuments: async (req,res) => {
        let year = req.params.route, token = req.query.token

        if(token == req.session.token){
            let Unwind = {$unwind: "$applications"}
            let Match = {$match: {$and: [
                        {"applications.creationDate" : {"$gte": new Date(`${year.trim()}-01-01`)}},
                        {"applications.creationDate" : {"$lte": new Date(`${year.trim()}-09-01`)}},
                        {_id: mongoose.Types.ObjectId(req.query.id)}
                    ],
                }}
            let Project = {$project: {"applications.documents": 1, "_id": 0}}
            let data = await Candidate.aggregate([Unwind,Match,Project])
            res.send({documents: data[0].applications.documents, server: process.env.SERVER})
        }else res.send('no token')
    },
    mail:  (req,res) => {
        if(req.body.status == req.session.status && req.body.token == req.session.token){
            let to = req.body.to || ""; let subject = req.body.subject || ""
            let message = req.body.message || ""

            if(to != "" && message != "" && subject != "" && to.match("^[a-zA-Z0-9\._%+-]+@[a-zA-Z_-]+\.(com|fr|net)$")){
                let mailOptions = {to: to, subject: subject, html: functions.Mail(message)}
                functions.sendMail(mailOptions,async (data) => {
                    if(data.includes('OK')){
                        if(req.body.id != undefined){
                            let candidate = await Candidate.findOne({_id: mongoose.Types.ObjectId(req.body.id)})
                            candidate.lockAccount = 0
                            Candidate.replaceOne({_id: mongoose.Types.ObjectId(req.body.id)},candidate,(err) => { res.send({message: 'done'}) })
                        }else res.send({message: 'done'})
                    }
                    else res.send({message: 'Error while sending the mail'})
                })
            }else res.json({message: "some fields are empty or incorrect"})
        }else{
            res.send('no token')
        }

    },
    modifyReceipt: async (req,res) => {
        let token = req.body.token
        if(token == req.session.token){
            let candidate = await Candidate.findOne({email: req.session.email})
            let last = candidate.applications.length-1, data = {code: req.file.fieldname, path: req.file.path, name: req.file.originalname}
            let paymentInfo = {paid: false, method: "BD", proof: data}
            candidate.applications[last].paymentInfo = paymentInfo
            Candidate.replaceOne({email: req.session.email},candidate,(err) => {
                res.send({path: `${process.env.SERVER}/${req.file.path}`})
            })
        }else{
            res.send('no token')
        }
    },
    archive: async (req,res) => {
        let year = req.query.year, token = req.query.token , id= req.params.param
        if(token == req.session.token){
            let data = await Candidate.findOne({_id: mongoose.Types.ObjectId(id)})
            let name = data.name+" "+data.surname
            let folderToZip = `applications/${year.trim()}/"${name}"`
            let archivePath = `applications/${year.trim()}/"${name}"/"SIEWE DAHE LOIC WILLIAM 2019-2020".zip`
           // let zip = `"SIEWE DAHE LOIC WILLIAM 2019-2020".zip`
            let command = `rar a ${archivePath} ${folderToZip}`

            //const {stdout, stderr}= await execFile('script')
            const {stdout, stderr} = await exec(command)
            archivePath = `applications/${year.trim()}/${name}/SIEWE DAHE LOIC WILLIAM 2019-2020.zip`
            res.send({archivePath: archivePath, server: process.env.SERVER})
        }else res.send('no token')
    },

    modifyApplicationStatus: async (req,res) => {
        let status = req.query.status, token = req.query.token , id= req.params.param
        let applicationId = req.query.applicationId

        if(token == req.session.token) {
            let candidate = await Candidate.findOne({_id: mongoose.Types.ObjectId(id)})

            let application = candidate.applications.find(app => app.id = applicationId)
            application.status = status
            let index = candidate.applications.findIndex(app => app.id = applicationId)

            if(index != -1) candidate[index] = application
            Candidate.replaceOne({_id: mongoose.Types.ObjectId(id)},candidate,(err) => {
                res.send('done')
            })
        } else res.send('no token')
    },

};
