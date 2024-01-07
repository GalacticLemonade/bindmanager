import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import { makeZoneFile, parseZoneFile } from 'zone-file'; //probably wont actually use this
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var location = __dirname + "/db.galacticlemon.dev"

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

app.post('/api/get/', (req, res) => {
    console.log("get list of all the tings")
    res.send("hi")
})

app.post('/api/finalize/', (req, res) => {
    const data = fs.readFileSync(location, 'utf8')

    data.soa.serial += 1

    console.log(makeZoneFile(data))
    fs.writeFileSync(location, makeZoneFile(data))
})

app.post('/api/addentry/', (req, res) => {
    const data = parseZoneFile(fs.readFileSync(location, 'utf8'))

    console.log(data)

    /* this is the weird zoneParser thing which i can't get to work very well
    const data = zoneParser.parse(fs.readFileSync(location, 'utf8'))

    var dataType = req.body.type

    if (dataType == "A") {
        data.a.push({name: req.body.host + '.', ip: req.body.content})
    } else if (dataType == "TXT") {
        data.txt = []
        data.txt.push({ name: req.body.host + '.', text: req.body.content, ttl: 604800 })
    } else if (dataType == "CNAME") {
        data.cname = []
        data.cname.push({ name: req.body.host + '.', alias: req.body.content, ttl: 604800 })
    }

    fs.writeFileSync(location, zoneParser.generate(data))
    res.send('hi')

    */
})

app.get('/login/', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.listen(3050)