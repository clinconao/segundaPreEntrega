import express from "express"
import mongoose from "mongoose"
import messageModel from "./models/messages.js"
import indexRouter from "./routes/indexRouter.js"

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
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

app.use('/',indexRouter)


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


