import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import zoneFile from 'dns-zonefile'; //probably wont actually use this
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
    const data = zoneFile.parse(fs.readFileSync(location, 'utf8'))

    data.soa.serial += 1

    fs.writeFileSync(location, zoneFile.generate(data))
    res.send('ok')
})

app.post('/api/addentry/', (req, res) => {
    const data = zoneFile.parse(fs.readFileSync(location, 'utf8'))

    let dataType = req.body.type

    if (dataType == "A") {
        data.a.push({name: req.body.host + '.galacticlemon.dev' + '.', ip: req.body.content})
    } else if (dataType == "TXT") {
        data.txt = []
        data.txt.push({ name: req.body.host  + '.galacticlemon.dev' +  '.', txt: req.body.content })
    } else if (dataType == "CNAME") {
        data.cname = []
        data.cname.push({ name: req.body.host +  '.galacticlemon.dev' +  '.', alias: req.body.content })
    }

    fs.writeFileSync(location, zoneFile.generate(data))
    res.send('ok')
})

app.get('/login/', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.listen(3050)