import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import zoneParser from 'dns-zonefile';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const data = fs.readFileSync(location, 'utf-8')

    console.log(zoneParser.parse(data))
})

app.post('/api/addentry/', (req, res) => {
    console.log(req.body)
    res.send('hi')
})

app.get('/login/', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.listen(3050)