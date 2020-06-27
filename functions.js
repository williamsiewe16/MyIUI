let nodemailer = require('nodemailer')
let dotenv = require('dotenv')
let jwt = require('jsonwebtoken')
let Candidate = require('./models/candidate')


dotenv.config()

module.exports = {
    sendMail: (mailOptions, callback) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.email,
                pass: process.env.email_password,
            }
        })
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log(err)
            }
            console.log('Message Sent: ' + info.response)
            callback(info.response)
        })

        transporter.close()
    },

    validationMail: (data) => {
        return '<body>\n' +
            '<div>\n' +
            '    <p>Hello!</p>\n' +
            '    <p>\n' +
            '      Pour compléter votre inscription, cliquez sur le bouton ci-dessous<br/>\n' +
            '      <a href="' + process.env.SERVER + '/admission/register/' + data.token + '">Confirmez l\'inscription</a>\n' +
            '    </p>\n' +
            '    <p>\n' +
            '        UCAC-ICAM<br/>\n' +
            '        <a href="https://www.ucac-icam.com" style="text-decoration: none">https://www.ucac-icam.com</a>\n' +
            '    </p>\n' +
            '</div>\n' +
            '</body>'
    },
    Mail: (data) => {
        return '<body>\n' +
            `<div>${data}</div>` +
            '</body>'
    },
    generateToken: (time, validation = false) => {
        let token = jwt.sign({}, process.env.JWT_SIGN_SECRET, {
            expiresIn: time,
        })
        if (validation) {
            setTimeout(() => {
                console.log("expired")
                jwt.verify(token, process.env.JWT_SIGN_SECRET, (err, decoded) => {
                    if (err) {
                        Candidate.deleteOne({signUpToken: token}, (err, response) => {
                        })
                    } else {
                        Candidate.findOneAndUpdate({signUpToken: token}, {signUpToken: ""}, (err, response) => {
                        })
                    }
                })
            }, (time + 10) * 1000)
        }

        return token
    },
    verifyToken: (token, callback) => {
        return jwt.verify(token, process.env.JWT_SIGN_SECRET, (err, decoded) => {
            callback(err, decoded)
        })
    },
    checkPeriod: (req, res, next) => {
        if (req.session.status == 1) next()
        else {
            let year = new Date().getFullYear()
            let openingDate = new Date(`${year}-01-01`);
            let closingDate = new Date(`${year}-09-01`);
            let actualDate = new Date();
            if (actualDate >= openingDate && actualDate < closingDate) next()
            else res.render("home.ejs",{status: undefined, paid: false})
        }
    }

}
