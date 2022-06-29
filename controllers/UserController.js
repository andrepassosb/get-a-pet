const User = require('../models/Users')

const bcrypt = require('bcrypt')

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
            res.status(201).json({mensage: 'Usuário criado.', newUser})
            return
        } catch(error){
            res.status(500).json({mensage:error})
        }
    }
}