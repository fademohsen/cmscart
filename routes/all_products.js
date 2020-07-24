const router = require('express').Router()
const Products = require('../models/product')
router.get('/' , (req,res)=>{
    Products.find({}).then(found=>{
       
        res.render('all_products' , {products: found})

    })

})



module.exports = router