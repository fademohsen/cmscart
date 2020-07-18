const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const config = require('./config/db')
const session = require('express-session');
mongoose.connect(config.dbKey, {useNewUrlParser: true , useUnifiedTopology: true} );
const filesUploader = require('express-fileupload');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to db');
  
});
const app = express()

app.use(express.static('public'))
app.use(filesUploader())
app.use(express.urlencoded({extended:true}))
app.set('view engine' , 'ejs')


// setup sessions 

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }))
 

  // setup messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
  //Routes
app.use('/admin/categories' , require('./routes/admin-category'))
app.use('/admin/pages' , require('./routes/admin-pages'))
app.use('/' , require('./routes/pages'))
app.use('/admin/products' , require('./routes/admin-products.js'))

const PORT = 3000;

app.listen(PORT , ()=>{
    console.log('connected to port');
    
})