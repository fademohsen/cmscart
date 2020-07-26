const router = require('express').Router()
const Products = require('../models/product')
const Category = require('../models/category')


router.get('/' , (req,res)=>{
    Products.find({}).then(found=>{
       
        res.render('all_products' , {products: found})

    })

})
//get product by category
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {

        
        Products.find({category:categorySlug.toLowerCase()} ,function (err, products) {
            console.log(products);
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});



module.exports = router