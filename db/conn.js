const mongoose = require('mongoose')

async function main(){
    await mongoose.connect('mongodb://localhost:27017/getapt')
    console.log('Conectou!')
}

main().catch(err => console.log(err))

module.exports = mongoose