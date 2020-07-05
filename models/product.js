const mongosse = require('mongoose')

const Product = new mongosse.Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String
    },
    desc:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true

    },
    image:{
        type:String
    },
})

module.exports = mongosse.model('Product' , Product);