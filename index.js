const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fs = require('node:fs')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

//plan on just supporting A, TXT and CNAME records for now

app.get("/", (req, res, next) => {
    if (!req.cookies['signedin']) {
        res.redirect('/login/')
        return
    }
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/api/login/', (req, res) => {
    let readPass = fs.readFileSync(__dirname + '/pass.txt', 'utf-8')
    if (req.body.pass == readPass) {
        res.cookie('signedin', true)
        res.redirect('/')
        return
    }

    res.redirect('/login/')
})

app.get('/login/', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.listen(3050)