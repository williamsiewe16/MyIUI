let Candidate = require('../models/candidate')
let Application = require('../models/application')
let mongoose = require('mongoose')
let dotenv = require('dotenv').config()
let FileName = require('../models/fileName')
let functions = require('../functions')
let axios = require("axios");

module.exports = {
    home: (req, res) => {
        if(req.session.email != undefined){
           res.render("home.ejs",{status: req.session.status, paid: false})
        }else{
            res.render("home.ejs",{status: -1, paid: false})
        }
    },
    login: (req, res) => {
        if(req.session.email != undefined){
            res.redirect('./page')
        }else{
            res.render("login.ejs")
        }
    },
    register: (req, res) => {
        if(req.session.email != undefined){
            res.redirect('./page')
        }else{
            res.render("register1.ejs")
        }
    },
    portal: (req, res) => {
        res.render('test.ejs')
    },
    page: async (req, res) => {
       if(req.session.email != undefined){
           if(req.session.status == 0) {
               let candidate = await Candidate.findOne({email: req.session.email})
               if(new Date(candidate.applications[candidate.applications.length-1].creationDate).getFullYear() != new Date().getFullYear()){
                   console.log("new Application")
                   candidate.applications.push(new Application())
                   Candidate.replaceOne({email: req.session.email},candidate,(err) => {})
               }

               let formFields1 =  await FileName.find({cycle: 0})
               let formFields2 =  await FileName.find({cycle: 1})
               res.render('page.ejs',{
                   candidate: candidate,
                   formFieldTabs: [formFields1,formFields2],
                   token: req.session.token, server: process.env.SERVER
               })
           }
       else res.redirect('./admin')
       }else{
           res.redirect("./login")
       }
    },

    /* admin routes */
    admin: async (req, res) => {
        if(req.session.email != undefined){
            if(req.session.status == 1){
                let years = await Candidate.distinct("applications.creationDate")
                    years = [...new Set(years.map(date => new Date(date).getFullYear()).sort().reverse())]

                let actualYear = years[0]
                let Match = {$match: {$and: [
                            {"applications.submissionDate" : {"$gte": new Date(`${actualYear}-01-01`)}},
                            {"applications.submissionDate" : {"$lte": new Date(`${actualYear}-09-01`)}},
                            {"applications.status" : {"$ne": 0}},
                            {"signUpToken" : ""},
                            {"lockAccount" : 1},
                        ],
                    }}
                let Sort = { $sort : { "applications.status" : 1 } }
                let candidates = await Candidate.aggregate([Match,Sort])

                /* Get graphics data */
                   /* School */
                let schoolData = await Candidate.aggregate(getAggregationForGraph("lastSchool"))
                   /* Pays */
                let countryData = await Candidate.aggregate(getAggregationForGraph("country"))
                   /* Sex */
                let sexData = await Candidate.aggregate(getAggregationForGraph("gender"))
                   /* Level */
                let levelData = await Candidate.aggregate(getAggregationForGraph("level"))
                   /* City */
                let cityData = await Candidate.aggregate(getAggregationForGraph("city"))

                let graphData = {
                    schoolData: schoolData, countryData: countryData, sexData: sexData,
                    levelData: levelData, cityData: cityData
                }

                res.render('admin.ejs', {candidates: candidates,
                    years: years,
                    server: process.env.SERVER,
                    token: req.session.token,
                    status: req.session.status,
                    graphData: graphData })
            }else{
                res.redirect("./page")
            }
        }else{
            res.redirect("./login")
        }
    },
    adminContent: async (req,res,next) => {
        let param = req.params.param
        if(req.session.email != undefined) {
            if (req.session.status == 1) {
                if (param == "Dashboard") {
                     res.send([0])
                } else {
                    let year = param.split('-')[1]
                    let Unwind = {$unwind: "$applications"}
                    let Match = {$match: {$and: [
                                {"applications.submissionDate" : {"$gte": new Date(`${year.trim()}-01-01`)}},
                                {"applications.submissionDate" : {"$lte": new Date(`${year.trim()}-09-01`)}},
                                {"signUpToken" : ""},
                                {"lockAccount" : 1},
                                {"applications.status" : {"$ne": 0}}
                            ],
                        }}
                    let Sort = { $sort : { "applications.status" : 1 } }
                    let candidates = await Candidate.aggregate([Unwind,Match,Sort])
                    res.send(candidates)
                }
            }
        }
    },
    payment: async (req, res) => {
        if(req.session.email == undefined){
            res.redirect('./login')
        }else{
            if(req.session.status == 0){
                let candidate = await Candidate.findOne({email: req.session.email})
                if(candidate.applications[candidate.applications.length-1].submissionDate == undefined){
                    res.render("payment.ejs",{
                        candidate: await Candidate.findOne({email: req.session.email}),
                        receipt: await FileName.findOne({name: "receipt"}),
                        token: req.session.token, server: process.env.SERVER,
                        fees: process.env.FEES, accountNumber: process.env.BANK_ACCOUNT_NUMBER
                    })
                }else res.redirect('./page')
            }
            else res.redirect('./admin')
        }
    },
    test: (req,res) => {
        res.send('google')
    },
    testPost: (req,res) => {
        console.log('testPost')
    },
};

let getAggregationForGraph = (criteria) => {
    let Unwind = {$unwind: "$applications"}
    let Match = {$match: {"applications.submissionDate": {$exists: true}}}
    let Group = {$group: {"_id": `$${criteria}`, "total": {$sum: 1}}}

    return [Unwind,Match,Group]
}
