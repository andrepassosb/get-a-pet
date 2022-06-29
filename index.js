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

app.use('/user',UserRoutes)

app.listen(5000)