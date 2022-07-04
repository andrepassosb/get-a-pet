const jwt = require('jsonwebtoken')
const getToken = require('./get-token')

// middleware
const checkToken = (req, res, next) => {
    let token = undefined

    if(req.headers.authorization){
        token = getToken(req)
    }

    if(!token){
        return res.status(401).json({message: 'Acesso negado'})
    }

    try {
        const verified = jwt.verify(token, 'nossosecrete')
        req.user = verified
        next()
        
    } catch (error) {
        return res.status(401).json({message: 'Token inválido'})
    }
}

module.exports = checkToken