var express = require('express');
var router = express.Router();
// var fs = require('fs');
// var path = require('path')
var carowselHelper = require('../helpers/carowsel-helpers')
// var adminHelper = require('../helpers/admin-helpers');
var productsHelper = require('../helpers/product-helpers');
var artistHelpers = require('../helpers/artist-helpers');

const userHelper = require('../helpers/user-helpers');
const { ReplSet } = require('mongodb');



const verifyUserLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
};




/* GET users listing. */
router.get('/', function (req, res, next) {
  productsHelper.getAllProuducts().then((allproducts) => {
    let user = req.session.user

    let cartCount = null
    carowselHelper.getAllCarowsel().then(async (allcarowsel) => {
      let artist = req.session.artist
      if(artist){
        res.redirect('/artist')
      } else if(req.session.user === null){
        res.render('user/user-home', { allcarowsel, allproducts })
      }else if (req.session.loggedIn) {
        cartCount = await userHelper.getCartCount(req.session.user._id)
        res.render('user/user-home', { allcarowsel, allproducts, user, cartCount, }) 
      } else {
        res.render('user/user-home', { allcarowsel, allproducts })
      }

    })

  })

});

router.get('/login', function (req, res) {
  
  if (req.session.artist) {
    res.redirect('/artist')
  }else if (req.session.user === null){
    res.render('user/login')
  }else if (req.session.loggedIn) {
    res.redirect('/')
  } else if (req.session.loginErr) {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  } else {
    res.render('user/login')
  }
});

router.get('/signup', function (req, res) {

  if (req.session.createErr) {

    res.render('user/signup', { "createErr": req.session.createErr })
    req.session.createErr = false

  } else {
    res.render('user/signup');
  }

});

router.post('/signup', function (req, res) {
  userHelper.doSingup(req.body).then((response) => {
    console.log("body", req.body)

    if (response.emailerr) {
      req.session.createErr = "Account already created this e-mail address !"
      res.redirect('/signup');
    } else {
      req.session.loggedIn = true
      req.session.user = req.body
      res.redirect('/')
    }
  })
});

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.loggedIn = true
      req.session.EmailErr = false
      req.session.user = response.user
      res.redirect('/')
    } else if (response.artistStatus) {
      req.session.artist = true
      req.session.EmailErr = false
      req.session.loggedIn = false
      req.session.artist = response.artist
      res.redirect('/artist')
    } else if (response.EmailErr) {
      req.EmailErr = true
      req.session.loginErr = "Invalid Email id, Please check your Email address"
      res.redirect('/login')
    } else {
      req.session.loginErr = "Invalid Passoword. Please check your Password "
      res.redirect('/login')
    }
  })
});

router.get('/logout', (req, res) => {
  console.log(req.session.user)
  req.session.user = null
  
  res.redirect('/')
});


router.get('/account', verifyUserLogin, async (req, res) => {
  let userId = req.session.user._id
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let favorites = await userHelper.getFavorites(req.session.user._id)
  userHelper.getUserDetails(userId).then((user) => {
    if(req.session.passwordError){
      res.render('user/user-account', { user,cartCount,favorites,"passwordError":req.session.passwordError  })
      req.session.passwordError = false
    }else if(req.session.passwordSuccess){
      res.render('user/user-account', { user,cartCount,favorites,"passwordSuccess":req.session.passwordSuccess  })
      req.session.passwordSuccess = false
    }else{

      res.render('user/user-account', { user,cartCount,favorites })
    }
  })
});

router.post('/settings', verifyUserLogin, (req, res) => {
  let id = req.body.id
  
  userHelper.updateUser(req.body).then(() => {
   
    let image = req.files.Profile
    image.mv('./public/user-images/' + id + '.jpg')
    res.redirect('/account')
  })

});


router.post('/change-password', verifyUserLogin, (req, res) => {
  userHelper.changePassword(req.body).then((response)=>{
    if(response.PasswordErr){
      req.session.passwordError = 'Invalid cerrent password. Pleace check'
      res.redirect('/account')
    }else{
      req.session.passwordSuccess = 'Password successfully changed'
      res.redirect('/account')
    }
  })
 

});

router.get('/For%20Sales/view-item/:id', async (req, res) => {
  let user = req.session.user
  if(user){
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let Product = await productsHelper.getProductDetails(req.params.id)
  let Artist = await artistHelpers.getArtistWithProId(req.params.id)
  let ForSales = Product.Category === 'For Sales'
  let starRate = await artistHelpers.getStarRate(Artist._id)
  res.render('cart/view-product', { Product, Artist, ForSales, user,cartCount,starRate })
  }else{
  let Product = await productsHelper.getProductDetails(req.params.id)
  let Artist = await artistHelpers.getArtistWithProId(req.params.id)
  let ForSales = Product.Category === 'For Sales'
  let starRate = await artistHelpers.getStarRate(Artist._id)
  res.render('cart/view-product', { Product, Artist, ForSales,starRate})
  }
  
});

router.get('/For%20Drowing/view-item/:id', async (req, res) => {
  let user = req.session.user
  if(user){
    let cartCount = await userHelper.getCartCount(req.session.user._id)
  let Product = await productsHelper.getProductDetails(req.params.id)
  let Artist = await artistHelpers.getArtistWithProId(req.params.id)
  let ForSales = Product.Category === 'For Sales'
  let starRate = await artistHelpers.getStarRate(Artist._id)
  res.render('cart/view-product', { Product, Artist, ForSales, user,cartCount,starRate })
  }else{
    let Product = await productsHelper.getProductDetails(req.params.id)
    let Artist = await artistHelpers.getArtistWithProId(req.params.id)
    let ForSales = Product.Category === 'For Sales'
    let starRate = await artistHelpers.getStarRate(Artist._id)
    res.render('cart/view-product', { Product, Artist,ForSales,starRate })
  }
});

router.get('/For%20Drowing/view-item/:id/choose-image', verifyUserLogin, async(req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let user = req.session.user
  let productId = req.params.id
  res.render('cart/user-choos-image', { user, productId, cartCount })
})

router.get('/cart', verifyUserLogin, async(req, res) => {
  if(req.session.user){
    let cartCount = await userHelper.getCartCount(req.session.user._id)
    let user = req.session.user
    let products = await userHelper.getCartProducts(req.session.user._id)
    let totalValue = 0
    if (products.length > 0) {
      totalValue = await userHelper.getTotalAmount(req.session.user._id)
      res.render('cart/cart-list', { user, products, totalValue, cartCount })
    } else {
      res.render('cart/empty-cartList', { user })
    }
  }else{
    res.redirect('/login')
  }


});


router.get('/For%20Sales/add-to-cart/:id', verifyUserLogin, (req, res) => {
  var d = new Date();
  userHelper.addToCart(req.params.id, req.session.user._id, d).then(() => {
    res.redirect('/')
  })
});

router.post('/add-to-cart/:id', verifyUserLogin, (req, res) => {
  var d = new Date()
  var date = (d.getDate()) + '-' + (d.getMonth() + 1) + '-' + (d.getFullYear()) + '_' + (d.getHours()) + '-' + (d.getMinutes()) + '-' + (d.getSeconds()) + '-' + (d.getMilliseconds());

  let id = req.params.id

  userHelper.DrodwingaddToCart(req.params.id, req.session.user._id, d).then(() => {
    let image = req.files.DrowingImage
    image.mv('./public/drowing-product-images/' + id + '_' + date + '.jpg')

    res.redirect('/')
  })
});

router.post('/change-product-quandity', verifyUserLogin, (req, res) => {

  userHelper.changeProductQuandity(req.body).then(async (respon) => {
    respon.total = await userHelper.getTotalAmount(req.session.user._id)

    res.json(respon)

  })
});

router.post('/remove-product-quandity', verifyUserLogin, (req, res) => {



  userHelper.removeProductQuandity(req.body).then((response) => {
    // let proId = req.body.product

    // fs.unlink('/project/mushroom 2/public/drowing-product-images/' + id + 'm-art' + '.jpg', function (error) {
    //   if (error) {
    //     console.log(error)
    //   }
    //   res.redirect('/artist/dashboard/product-list/')
    // })

    res.json(response)
    console.log(response)

  })
});

router.get('/place-order', verifyUserLogin, async (req, res) => {

  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let user = await userHelper.getUserDetails(req.session.user._id)

  let total = await userHelper.getTotalAmount(req.session.user._id)
  res.render('cart/place-order', { total, user,cartCount })

});

router.post('/place-order', verifyUserLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let products = await userHelper.getCartProductList(req.body.userId)
  let totalPrice = await userHelper.getTotalAmount(req.body.userId)
  let user = req.session.user
  let date = new Date()

  userHelper.placeOrder(req.body, products, totalPrice, date).then((response,) => {
    res.render('cart/success',{cartCount,user})
  })
});

router.get('/my-orders', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let orders = await userHelper.getOrderProducts(req.session.user._id)
  console.log(orders)
  res.render('cart/all-orders', { user, orders,cartCount })
});

router.get('/my-orders/view-order-products/:id', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelper.getCartCount(req.session.user._id)
  let products = await userHelper.getOrderOnlyProducts(req.params.id)
  console.log(products)
  res.render('cart/view-order-products', { user, products,cartCount })

});

router.post('/artistStar',verifyUserLogin,(req,res)=>{
  artistHelpers.addStarRate(req.body).then((respon)=>{
    artistHelpers.gerArtistStarAverage(req.body.createrId)
    res.json(respon)
  })
});

router.post('/add-favorite',verifyUserLogin,(req,res)=>{
  userHelper.addFavorites(req.body).then((respon)=>{
    res.json(respon)
  })
});

router.post('/remove-favorite',verifyUserLogin,(req,res)=>{
  userHelper.removeFavorite(req.body).then((respon)=>{
    res.json(respon)
  })
  
});

router.post('/account/artist-form',verifyUserLogin,(req,res)=>{
  userHelper.artistAddForm(req.body).then(()=>{
    res.redirect('/account')
  })
})




module.exports = router;
