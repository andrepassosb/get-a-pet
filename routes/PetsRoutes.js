const router = require('express').Router()
const PetsController = require('../controllers/PetsController')

//Middleware
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.post('/create', verifyToken, imageUpload.array('images'), PetsController.create);
router.get('/', PetsController.getAll);
router.get('/mypets', verifyToken, PetsController.getAllUserPets);
router.get('/myadoptions', verifyToken, PetsController.getAllUserAdoptions);
router.get('/:id', PetsController.getPetById);
router.delete('/:id', verifyToken, PetsController.removePetById);
router.patch('/:id', verifyToken, imageUpload.array('images'), PetsController.updatePet);


module.exports = router;