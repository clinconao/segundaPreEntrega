import { Router } from "express";
import { userModel } from "../models/user.js";

const userRouter = Router()

userRouter.get('/', async (req, res) =>{
    try {
        const users = await userModel.find()
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send("Error al consultar usuarios: ", e)
    }
})

userRouter.post('/', async (req,res) =>{
    try {   
        const {first_name, last_name, email, password, age} = req.body
        const resultado = await userModel.create({first_name, last_name, email, password, age})
        res.status(201).send(resultado)
    } catch (error) {
        res.status(500).send("Error al consultar usuarios: ", e)
    }
})

export default userRouter