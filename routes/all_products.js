const router = require('express').Router()
const Products = require('../models/product')
const Category = require('../models/category')
const fs = require('fs-extra')
const e = require('express')


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
router.get('/:category/:product' , function(req ,res) {
    var gelleryImage = null ;
    Products.findOne({slug: req.params.product} , function (err , product) {
        if (err) {console.log(err);
        }else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery'
            fs.readdir(galleryDir , function (err , files) {
                if (err){
                    console.log(err);
                }else {
                    gelleryImage = files ;
                    res.render('product' , {
                        title: product.title ,
                        p: product ,
                        gelleryImage:gelleryImage 
                    })
                }
            })
        }
    })

})




module.exports = router