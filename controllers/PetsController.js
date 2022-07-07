const Pet = require('../models/Pets')

//Helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetsController{
    static async create(req, res){

        const { name, age, weight, color } = req.body

        //Imagens upload
        const images = req.files

        const avaliable = true


        //Validations
        if(!name){
            res.status(422).json({mensage: 'O nome é obrigatório'})
            return
        }
        if(!age){
            res.status(422).json({mensage: 'A idade é obrigatória'})
            return
        }
        if(!weight){
            res.status(422).json({mensage: 'O peso é obrigatório'})
            return
        }
        if(!color){
            res.status(422).json({mensage: 'A cor é obrigatório'})
            return
        }


        if(!images || images.length === 0){
            res.status(422).json({mensage: 'Foto é obrigatório'})
            return
        }


        // get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        // create a pet
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            avaliable,
            images:[],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        images.forEach(image => {
            pet.images.push(image.filename)
        });


        try {

            const newPet = await pet.save()
            res.status(201).json({
                mensage: 'Pet cadastrado com sucesso!',
                newPet
            })
            
        } catch (error) {
            res.status(500).json({mensage: error})
        }
    }

    static async getAll(req, res){
        const pets = await Pet.find().sort('-createdAt')
        res.status(200).json({
            pets
        })
    }
    static async getAllUserPets(req, res){
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id':user._id}).sort('-createdAt')
        res.status(200).json({
            pets
        })
    }
    static async getAllUserAdoptions(req, res){
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id':user._id}).sort('-createdAt')
        res.status(200).json({
            pets
        })
    }
    static async getPetById(req, res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({mensage: 'ID inválido'})
            return
        }

        const pet = await Pet.findOne({_id: id})

        if(!pet){
            res.status(404).json({mensage: 'Pet não encontrado'})
            return
        }
        
        res.status(200).json({
            pet
        })
    }

    static async removePetById(req,res){
        const id = req.params.id

        //check id valid
        if(!ObjectId.isValid(id)){
            res.status(422).json({mensage: 'ID inválido'})
            return
        }


        //check pet exist
        const pet = await Pet.findOne({_id: id})

        if(!pet){
            res.status(404).json({mensage: 'Pet não encontrado'})
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({mensage: 'Houve um problema ao processar sua solicitação'})
            return
        }

        await Pet.findByIdAndRemove(id)

        res.status(200).json({mensage: 'Pet removido com sucesso!'})
    }

    static async updatePet(req, res){

        const id = req.params.id

        const { name, age, weight, color, avaliable } = req.body

        //Imagens upload
        const images = req.files

        const updatePetData = {}

        //check pet exist
        const pet = await Pet.findOne({_id: id})

        if(!pet){
            res.status(404).json({mensage: 'Pet não encontrado'})
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({mensage: 'Houve um problema ao processar sua solicitação'})
            return
        }

        //Validations
        if(!name){
            res.status(422).json({mensage: 'O nome é obrigatório'})
            return
        }else{
            updatePetData.name = name
        }

        if(!age){
            res.status(422).json({mensage: 'A idade é obrigatória'})
            return
        }else{
            updatePetData.age = age
        }

        if(!weight){
            res.status(422).json({mensage: 'O peso é obrigatório'})
            return
        }else{
            updatePetData.weight = weight
        }

        if(!color){
            res.status(422).json({mensage: 'A cor é obrigatório'})
            return
        }else{
            updatePetData.color = color
        }

        updatePetData.images = pet.images
        if(images){
            images.forEach(image => {
                updatePetData.images.push(image.filename)
            });
        }

        try {

            await Pet.findByIdAndUpdate(id, updatePetData)
            res.status(201).json({
                mensage: 'Pet atualizado com sucesso!'
            })
            
        } catch (error) {
            res.status(500).json({mensage: error})
        }
    }

    static async schedule(req, res){
        const id = req.params.id

        //check pet exist
        const pet = await Pet.findOne({_id: id})

        if(!pet){
            res.status(404).json({mensage: 'Pet não encontrado'})
            return
        }

        if(!pet.avaliable){
            res.status(404).json({mensage: 'Este pet já foi adotado!'})
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user._id)){
            res.status(422).json({mensage: 'Houve um problema ao processar sua solicitação'})
            return
        }


        //check if user has already scheduled a visit
        if(pet.adopter && pet.adopter._id.toString() === user._id.toString() ){
            res.status(422).json({
                mensage: 'Você já agendou uma visita para este pet'
            })
            return
        }

        // add user to pet
        pet.adopter = {
            _id:user.id,
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({
            message:'Visita agendada com sucesso'
        })
    }

    static async concludeAdoption(req, res){
        const id = req.params.id

        //check pet exist
        const pet = await Pet.findOne({_id: id})

        if(!pet.avaliable){
            res.status(404).json({mensage: 'Este pet já foi adotado!'})
            return
        }

        if(!pet){
            res.status(404).json({mensage: 'Pet não encontrado'})
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user._id)){
            res.status(422).json({mensage: 'Houve um problema ao processar sua solicitação, você colocou este pet para adoção'})
            return
        }

        pet.avaliable = false

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({
            message: "Parabéns você adotou !"
        })
    }

}