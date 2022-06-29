const jwt = require('jsonwebtoken')

const createUserToken = async(user, req, res) => {
    const token = jwt.sign({
        name: user.name,
        id: user._id,

    }, "nossosecrete")

    res.status(200).json({
        message: "Você está autenticado",
        token: token,
        userId: user._id
    })
}

modele.exportes = createUserToken