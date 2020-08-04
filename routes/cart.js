const Product = require('../models/product');

const router = require('express').Router()

router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            console.log(req.session.cart);
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.img
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.img
                });
            }
        }

        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

router.get('/checkout' , function (req , res) {
    res.render('checkout' , {
        title : 'Checkout' ,
        cart : req.session.cart
    })

})
module.exports = router