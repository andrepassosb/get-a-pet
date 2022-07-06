const express = require("express")
const cors = require('cors')

const app = express()

//Config json response
app.use(express.json())

//Solve CORS
app.use(cors({ credentials: true, origin:'http://localhost:3000'}))

//Public folder for imagens
app.use(express.static('public'))

//Routes
const UserRoutes = require('./routes/UserRoutes')
const PetsRoutes = require('./routes/PetsRoutes')

app.use('/user',UserRoutes)
app.use('/pets',PetsRoutes)

app.listen(5000)