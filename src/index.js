import express from "express"
import mongoose from "mongoose"
import messageModel from "./models/messages.js"
import indexRouter from "./routes/indexRouter.js"
import cookieParser from "cookie-parser"
import session from "express-session"

import MongoStore from "connect-mongo"

import { Server } from "socket.io"
import { __dirname } from './path.js'
import { engine } from "express-handlebars"

const app = express()
const PORT = 8080

// por acá el server
const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

const io = new Server(server)

// Connection DB
mongoose.connect("mongodb+srv://cllinconao:myXy6WqAvNAJy3Kb@cluster0.od9skcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("DB is connected"))
.catch(e => console.log(e))

// middlewares
app.use(express.json())

app.use(session({
    secret:"codeSecret",
    resave: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://cllinconao:myXy6WqAvNAJy3Kb@cluster0.od9skcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        ttl: 60 * 60
    }),
    saveUninitialized: true
}))

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')
app.use(cookieParser('claveSecreta'))
app.use('/',indexRouter)


// routes cookies
app.get('/setCookie', (req, res) => {
    res.cookie('CookieCookie', 'Prueba de cookie', {maxAge: 200000, signed: true}).send("Cookie listoco")
})

app.get('/getCookie', (req, res) => {
    res.send(req.signedCookies)
})

app.get('/deleteCookie', (req, res) => {
    res.clearCookie('CookieCookie').send("Cookie eliminada")
})

// session routes

app.get('/session', (req, res)=>{
    if (req.session.counter) {
        req.session.counter++
        res.send(`Eres el usuario N ${req.session.counter} en ingresar a la pagina`)
    } else {
        req.session.counter = 1
        res.send("Eres el primero que ingresa a la pagina")
    }
})

app.post('/login', (req, res) => {
    const { email, password } = req.body

    if (email == "admin@admin.com" && password == "1234") {
        req.session.email = email
        req.session.password = password


    }
    console.log(req.session)
    res.send("Login")
})

io.on('conection', (socket) => {
    console.log("Conexion con Socket.io")

    socket.on('mensaje', async (mensaje) => {
        try {
            await messageModel.create(mensaje)
            const mensajes = await messageModel.find()
            io.emit('mensajeLogs', mensajes)
        } catch (error) {
            io.emit('mensajeLogs', error)
        }

    })
})


