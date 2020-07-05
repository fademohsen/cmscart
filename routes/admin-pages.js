const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const Page = require('../models/Page')
router.get('/' , (req,res)=>{
    Page.find({}).sort({sorting:1}).exec(function (err,pages) {
        res.render('admin/pages' , {
            pages:pages

        })
        
    })
})
// Get add-page
router.get('/add-page' , (req,res)=>{
    var title = "" ;
    var slug = "" ;
    var content = "";
    
res.render('admin/add-page' , {
    title:title,
    slug:slug,
    content:content
})

})

//Post add-page
router.post('/add-page' , [
    check('title' , 'title must have a value').notEmpty(),
    check('content' , 'content must have a value').notEmpty()
  ], (req, res) => {
      
      
    const errors = validationResult(req)
    let {title , slug , content} = req.body
    slug = slug.replace('/\s+/g', '-')
    if(!slug) slug = title.replace('/\s+/g', '-')
    if(!errors.isEmpty()) {
       
        res.render('admin/add-page' , {
            errors:errors.errors,
            title:title,
            slug:slug,
            content:content
        })}else{
          Page.findOne({slug:slug} , (err , foundPage) =>{
                if(err){
                    return console.log(err);
                }
               if(foundPage){
                req.flash('danger' , 'page slug exists choose another!')
                res.render('admin/add-page' , {
                    title:title,
                    slug:null,
                    content:content
                }) 
               }else{
                   const newPage = new Page({title:title , slug:slug , content:content , sorting:0})
                   newPage.save(err=>{
                       if(err){
                           return console.log(err);
                       }
                       req.flash('success' , 'page added!')
                       res.render('admin/add-page' , {
                        title:null,
                        slug:null,
                        content:null
                    }) 
                       console.log(req.flash());
                       
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