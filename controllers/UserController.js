const User = require('../models/Users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register(req, res){
        const { name, email, phone, password, confirmpassword } = req.body

        //Validations
        if(!name){
            res.status(422).json({mensage: 'O nome é obrigatório'})
            return
        }
        if(!email){
            res.status(422).json({mensage: 'O e-mail é obrigatório'})
            return
        }
        if(!phone){
            res.status(422).json({mensage: 'O telefone é obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({mensage: 'A senha é obrigatório'})
            return
        }
        if(!confirmpassword){
            res.status(422).json({mensage: 'A confirmação da senha é obrigatório'})
            return
        }
        if(password !== confirmpassword ){
            res.status(422).json({mensage: 'A senha e confirmação da senha precisam ser iguais'})
            return
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if(userExists){
            res.status(422).json({mensage: 'Email já cadastrado, utilizr outro email.'})
            return
        }

        // create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = User({
            name,
            email,
            phone,
            password: passwordHash
        })
        
        try{
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch(error){
            res.status(500).json({mensage:error})
        }
    }

    static async login(req, res){
        const { email, password } = req.body

        if(!email){
            res.status(422).json({mensage: 'O e-mail é obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({mensage: 'A senha é obrigatório'})
            return
        }
        // check if user exists
        const user = await User.findOne({ email: email })

        if(!user){
            res.status(422).json({mensage: 'Não há usuário cadastrado com este email'})
            return
        }

        //check if password match witch db password
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({mensage: 'Senha inválida.'})
            return
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res){
        let currentUser = null
        if(req.headers.authorization){
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecrete')

            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined
        }
        res.status(200).send(currentUser)
    }

    static async getUserById(req, res){
        const id = req.params.id

        
        try {
            const user = await User.findById(id).select("-password")
            
            if(!user){
                res.status(422).json({mensage: 'Usuário não encontrado !'})
                return
            }
            res.status(200).json({ user })
        } catch (error) {
            res.status(422).json({mensage: error})
            return
        }

    }

    static async editUser(req, res){
        const id = req.params.id

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(!user){
            res.status(422).json({mensage: 'Usuário não encontrado !'})
            return
        }

        const { name, email, phone, password, confirmpassword } = req.body

        if(req.file){
            user.image = req.file.filename
        }

        //Validations
        if(!name){
            res.status(422).json({mensage: 'O nome é obrigatório'})
            return
        }
        user.name = name

        if(!phone){
            res.status(422).json({mensage: 'O telefone é obrigatório'})
            return
        }
        user.phone = phone

        if(!email){
            res.status(422).json({mensage: 'O e-mail é obrigatório'})
            return
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if(user.email !== email && userExists){
            res.status(422).json({mensage: 'Email já cadastrado, utilizar outro email.'})
            return
        }
        user.email = email


        if(password !== confirmpassword ){
            res.status(422).json({mensage: 'A senha e confirmação da senha precisam ser iguais'})
            return
        }else if(password && password === confirmpassword){
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            user.password = passwordHash
        }

        try {
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true }
            )
            res.status(200).json({message: "Usuário atualiazado com sucesso"})
            
        } catch (error) {
            res.status(500).json({message: error})
        }



    }
}