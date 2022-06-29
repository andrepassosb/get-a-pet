const mongoose = require('../db/conn')
const { Schema } = mongoose

const Pet = mongoose.model(
    'Pet',
    new Schema({
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        wieght: {
            type: Number,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        imagens: {
            type: Array,
            required: true
        },
        avaliable: {
            type: Boolean,
        },
        user: object,
        adopter: object
    },
    { timestamps: true },
    )
)

module.exports = Pet