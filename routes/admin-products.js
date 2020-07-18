const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const Product = require('../models/product')
var mkdirp = require("mkdirp")
const path = require('path')
var fs = require('fs-extra')
var resize = require("resize-img")
var Category = require('../models/category') ;



router.get('/' , (req,res)=>{
    var count ;
    Product.countDocuments(function(err , c) {
        count = c ;
    })
    Product.find(function(err , products) {
        res.render('admin/products' , {
           products: products ,
           count: count  
        })
    })

})
// Get add-page
router.get('/add-product' , (req,res)=>{
    var title = "" ;
    var desc = "";
    var price = "" ;
    Category.find(function(err , categories) {
        res.render('admin/add-product' , {
            title:title,
            categories:categories  ,
            desc:desc,
            price:price 
        })
        
    })
    

})
let lowerCase = (body) => {
    let result = Object.assign(body);
    for (let prop in result) {
        result[prop] = result[prop].toLowerCase()
    }
    return result;
}
//Post add-product
router.post('/add-product', [
    check('title', 'title must have a value').notEmpty(),
    check('desc', 'description must have a value').notEmpty(),
    check('price', 'price must have a value').isDecimal(),
    check('img').custom((v, { req }) => {
        console.log(req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('no file to upload');
            console.log(req.files);
            req.imgFile = ""
            return true
        } else {
            req.imgFile = req.files.img.name
        }

        const extension = (path.extname(req.imgFile)).toLowerCase();
        switch (extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            default: return false
        }

    }).withMessage('please upload an image!'),

], (req, res) => {
    const errors = validationResult(req)
    const imageFile = req.imgFile

    let { title, slug, desc, price, category } = lowerCase(req.body)

    if (!slug) slug = title.replace('/\s+/g', '-')
    if (!errors.isEmpty()) {

        Category.find({}, (err, categories) => {
            if (err) return console.log(err);
            res.render('admin/add-product', {
                errors: errors.errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })

        })
    } else {
        Product.findOne({ slug: slug }, (err, foundProduct) => {
            if (err) {
                return console.log(err);
            }
            if (foundProduct) {
                req.flash('danger', 'product title exists choose another!')
                Category.find({}, (err, categories) => {
                    if (err) return console.log(err);
                    res.render('admin/add-product', {
                        errors: errors.errors,
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    })

                })
            } else {
                const priceFormat = parseFloat(price).toFixed(2);
                const newProduct = new Product({ title: title, slug: slug, desc: desc, price: priceFormat, category: category, img: imageFile || '' })
                newProduct.save(err => {
                    if (err) {
                        return console.log(err);
                    }


                    mkdirp('public/product_images/' + newProduct._id).then(() => {
                        mkdirp('public/product_images/' + newProduct._id + '/gallery')
                        mkdirp('public/product_images/' + newProduct._id + '/gallery/thumbs');
                        if (req.files == undefined || null) return ;
                        
                            let imageProduct = req.files.img;
                            let path = 'public/product_images/' + newProduct._id + "/" + imageFile;

                            imageProduct.mv(path, err => {
                                if (err) return console.log( err);
                            })
                        
                    }).catch((err) => {
                        if (err) return console.log(err);

                    })


                    req.flash('success', 'product added!')
                    res.redirect('/admin/products')

                })
            }
        })
    }
})

    //post reorder pages
    router.post('/fade' , (req,res)=>{
        const ids =req.body.ids ;
        ids.map((pageId , index) => {
            Page.findById(pageId , (err , page) => {
                if (err) return console.log(err);
                page.sorting = index+1
                page.save(err => {
                    if (err)
                    console.log(err);
                    
                })
                
            })
        })
    
    })
    //get edit page
    router.get('/edit-page/:slug' , (req,res)=>{
        Page.findOne({slug: req.params.slug} , function(err , page) {
            if (err) 
            return console.log(err)
            res.render('admin/edit-page' , {
                title:page.title,
                slug:page.slug,
                content:page.content ,
                id: page._id
            })
        })
        
 
    
    })
//post edit page
    router.post('/edit-page' , [
        check('title' , 'title must have a value').notEmpty(),
        check('content' , 'content must have a value').notEmpty()
      ], (req, res) => {
          
          
        const errors = validationResult(req)
        let {title , slug , content , id} = req.body
        slug = slug.replace('/\s+/g', '-')
        if(!slug) slug = title.replace('/\s+/g', '-')
        if(!errors.isEmpty()) {
           
            res.render('admin/edit-page' , {
                errors:errors.errors,
                title:title,
                slug:slug,
                content:content,
                id: id
            })}else{
              Page.findOne({slug:slug , _id:{'$ne':id}} , (err , foundPage) =>{
                    if(err){
                        return console.log(err);
                    }
                   if(foundPage){
                    req.flash('danger' , 'page slug exists choose another!')
                    res.render('admin/edit-page' , {
                        title:title,
                        slug:null,
                        content:content ,
                        id:id
                    }) 
                   }else{
                       Page.findById(id , function(err , page) {
                           if (err) return console.log(err);
                           page.title = title ;
                           page.slug = slug ;
                           page.content = content;
                           page.save(function(err) {
                               if (err)
                               return console.log(err);
                               req.flash('success' , 'Page added')
                               res.redirect('/admin/pages/edit-page/'+page.slug)
                               
                           })
                           
                       })
                   
                   }
               })
            }
        })
        router.get('/delete-page/:id' , (req,res)=>{
          Page.findByIdAndRemove(req.params.id , function(err) {
              if (err) return console.log(err);
              req.flash('success' , 'Page Deleted')
              res.redirect('/admin/pages')
              
              
              
          })
                
            
        })
        

module.exports = router