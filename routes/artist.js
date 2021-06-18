var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path')
const { response } = require('../app');
var productsHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers')
const artistHelpers = require('../helpers/artist-helpers')
var carowselHelper = require('../helpers/carowsel-helpers')
const unVaProductHelpers = require('../helpers/unVaProduct-helpers');
const verifyArtistLogin = (req, res, next) => {
  if (req.session.artist) {
    next()
  } else {
    res.redirect('/login')
  }
};


/* GET users listing. */
router.get('/', verifyArtistLogin, function (req, res, next) {

  productsHelper.getAllProuducts().then((allproducts) => {
    let artist = req.session.artist
    let cartCount = null
    carowselHelper.getAllCarowsel().then(async (allcarowsel) => {
      cartCount = await userHelper.getCartCount(req.session.artist._id)
      res.render('user/user-home', { allcarowsel, allproducts, artist, cartCount, artists: true })
    })
  })
});

router.get('/login', function (req, res) {
  if (req.session.artist) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
});


router.get('/logout', verifyArtistLogin, (req, res) => {
  req.session.artist = null
  res.redirect('/')
});

router.get('/account', verifyArtistLogin, async (req, res) => {
  let ArtistId = req.session.artist._id
  let starRate = await artistHelpers.getStarRate(ArtistId)
  let starRate100 = starRate * 20
  let totalStars = await artistHelpers.totalStaredUser(ArtistId)
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let favorites = await userHelper.getFavorites(req.session.artist._id)
  artistHelpers.getArtistDetails(ArtistId).then((artist) => {
    if(req.session.passwordError){
    res.render('artist/account', { artists: true, artist, cartCount,starRate,starRate100,totalStars,favorites,"passwordError":req.session.passwordError  })
    req.session.passwordError = false
  }else if(req.session.passwordSuccess){
    res.render('artist/account', { artists: true, artist, cartCount,starRate,starRate100,totalStars,favorites,"passwordSuccess":req.session.passwordSuccess  })
    req.session.passwordSuccess = false
  }else{
    res.render('artist/account', { artists: true, artist, cartCount,starRate,starRate100,totalStars,favorites })
  }
  })

})

router.post('/account/settings', verifyArtistLogin, (req, res) => {
  let id = req.body.id
  console.log("body", id)
  artistHelpers.updateArtist(req.body).then(() => {
    let image = req.files.Profile
    image.mv('./public/artist-images/' + id + '.jpg')

    res.redirect('/artist/account')

  })

});

router.post('/account/change-password', verifyArtistLogin, (req, res) => {
  artistHelpers.changePassword(req.body).then((response)=>{
    if(response.PasswordErr){
      req.session.passwordError = 'Invalid cerrent password. Pleace check'
      res.redirect('/artist/account')
    }else{
      req.session.passwordSuccess = 'Password successfully changed'
      res.redirect('/artist/account')
    }
  })
});

router.get('/dashboard/add-product', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  res.render('artist/add-product', { dashboard: true, artist, cartCount,starRate,starRate100 })
})

router.get('/dashboard/status', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = req.session.artist
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  let totalStars = await artistHelpers.totalStaredUser(artist._id)
  let allunvalidCount = await artistHelpers.getUnvalidProductCount(artist._id)
  let allConfirmedCount = await artistHelpers.getCounfirmedCount(artist._id)
  // let allOrdersCount = await artistHelpers.gerOrdersCount(artist._id)
  
  console.log(allConfirmedCount)
  res.render('artist/status-dashboard', { dashboard: true, artist, cartCount, starRate100, starRate,totalStars,allunvalidCount,allConfirmedCount })
});

router.post('/dashboard/add-product', verifyArtistLogin, (req, res) => {
  unVaProductHelpers.addUbvalidProduct(req.body).then((response) => {
    let id = req.body._id
    let image = req.files.Image
    image.mv('./public/unproducts-images/' + id + 'm-art' + '.jpg', (err) => {
      if (!err) {
        req.session.success = 'New Product added your Product List. White for admin approve'
        res.redirect('/artist/dashboard/product-list')
      } else {
        console.log(err);
      }
    })
  })
});

router.get('/dashboard/product-list', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  unVaProductHelpers.getArtistProduct(artist).then((artistAllunProduct) => {

    if (req.session.success) {
      res.render('artist/product-list', { artist, "success": req.session.success, dashboard: true, artistAllunProduct, cartCount, starRate100, starRate })
      req.session.success = false
    } else {

      res.render('artist/product-list', { dashboard: true, artist, artistAllunProduct, cartCount,starRate100,starRate })
    }
  })
});

router.get('/dashboard/product-list/:id', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  unVaProductHelpers.getProductDetails(req.params.id).then((product) => {
    let Edited = product.Status === 'Edited'
    let Pending = product.Status === 'Pending'
    res.render('artist/view-product', { dashboard: true, artist, product, Edited, Pending, cartCount, starRate, starRate100 })
  })
});

router.post('/dashboard/product-list/:id', verifyArtistLogin, (req, res) => {

  unVaProductHelpers.updateStatusProduct(req.params.id, req.body).then((product) => {
    let id = req.params.id
    console.log(id, "id")
    if (product.Status === "Confiemed") {
      const currentPath = path.join('/project/mushroom 2/public/unproducts-images/', id + "m-art" + ".jpg")
      const newPath = path.join('/project/mushroom 2/public/products-images/', id + "m-art" + ".jpg")
      console.log('current', currentPath)

      fs.rename(currentPath, newPath, function (err) {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/artist/dashboard/product-list')
          console.log("success")
        }
      })

    } else {
      res.redirect('/artist/dashboard/product-list')
    }
  })
});

router.get('/dashboard/product-list/:id/edit', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = req.session.artist
  let ProductDetails = await unVaProductHelpers.getProductDetails(req.params.id)
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  res.render('artist/edit-product', { dashboard: true, ProductDetails, artist, cartCount, starRate100, starRate })
});

router.post('/dashboard/product-list/:id/edit', verifyArtistLogin, (req, res) => {
  unVaProductHelpers.adminEditUnproduct(req.params.id, req.body).then(() => {

    res.redirect('/artist/dashboard/product-list')
  })

});

router.get('/dashboard/confimed-products', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = req.session.artist
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  productsHelper.getArtistAllProducts(artist).then((products) => {
    res.render('artist/allConfiemed-products', { dashboard: true, artist, products, cartCount, starRate, starRate100 })
  })
});

router.get('/dashboard/confimed-products/:id', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = req.session.artist
  let starRate = await artistHelpers.getStarRate(artist._id)
  let starRate100 = starRate * 20
  let product = await productsHelper.getProductDetails(req.params.id)
  res.render('artist/product-view', { dashboard: true, artist, product, cartCount, starRate100, starRate })
});

router.get('/dashboard/product-list/delete-product/:id', verifyArtistLogin, (req, res) => {
  let id = req.params.id
  unVaProductHelpers.deleteUnProduct(req.params.id).then((response) => {
    fs.unlink('/project/mushroom 2/public/unproducts-images/' + id + 'm-art' + '.jpg', function (error) {
      if (error) {
        console.log(error)
      }
      res.redirect('/artist/dashboard/product-list/')
    })
  })
});

router.get('/dashboard/confimed-products/delete/:id', verifyArtistLogin, (req, res) => {
  let id = req.params.id
  productsHelper.deleteProduct(req.params.id).then((response) => {
    fs.unlink('/project/mushroom 2/public/products-images/' + id + 'm-art' + '.jpg', function (error) {
      if (error) {
        console.log(error)
      }
      res.redirect('/artist/dashboard/confimed-products/')
    })
  })
});

// cart

router.get('/cart', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = req.session.artist
  let products = await userHelper.getCartProducts(req.session.artist._id)
  let totalValue = 0
  if (products.length > 0) {
    totalValue = await userHelper.getTotalAmount(req.session.artist._id)
    res.render('cart/artist-cart-list', { artist, products, totalValue, artists: true, cartCount })
  } else {
    res.render('cart/empty-cartList', { artist, artists: true, cartCount })
  }
});


router.get('/For%20Sales/view-item/:id', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let Product = await productsHelper.getProductDetails(req.params.id)
  let ArtistCreator = await artistHelpers.getArtistWithProId(req.params.id)
  let ForSales = Product.Category === 'For Sales'
  // let ArtsitStar = await artistHelpers.getArtistStar(ArtistCreator._id,artist._id)
  let starRate = await artistHelpers.getStarRate(ArtistCreator._id)

  res.render('cart/artist-view-product', { artists: true, Product, ArtistCreator, ForSales, artist, cartCount, starRate })
});

router.get('/For%20Drowing/view-item/:id', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let Product = await productsHelper.getProductDetails(req.params.id)
  let ArtistCreator = await artistHelpers.getArtistWithProId(req.params.id)
  let ForSales = Product.Category === 'For Sales'
  let starRate = await artistHelpers.getStarRate(ArtistCreator._id)
  res.render('cart/artist-view-product', { artists: true, Product, ArtistCreator, ForSales, artist, cartCount, starRate })
});


router.get('/For%20Drowing/view-item/:id/choose-image', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let productId = req.params.id
  res.render('cart/user-choos-image', { artists: true, artist, productId, cartCount })
});

router.get('/For%20Sales/add-to-cart/:id', verifyArtistLogin, (req, res) => {
  var d = new Date();

  userHelper.addToCart(req.params.id, req.session.artist._id, d).then(() => {
    res.redirect('/')
  })
});



router.post('/add-to-cart/:id', verifyArtistLogin, (req, res) => {
  var d = new Date()
  var date = (d.getDate()) + '-' + (d.getMonth() + 1) + '-' + (d.getFullYear()) + '_' + (d.getHours()) + '-' + (d.getMinutes()) + '-' + (d.getSeconds()) + '-' + (d.getMilliseconds());

  let id = req.params.id

  userHelper.DrodwingaddToCart(req.params.id, req.session.artist._id, d).then(() => {
    let image = req.files.DrowingImage
    image.mv('./public/drowing-product-images/' + id + '_' + date + '.jpg')

    res.redirect('/')
  })
});


router.post('/change-product-quandity', verifyArtistLogin, (req, res) => {

  userHelper.changeProductQuandity(req.body).then(async (respon) => {
    respon.total = await userHelper.getTotalAmount(req.session.artist._id)
    res.json(respon)
    console.log(respon, "rspo")
  })
});


router.post('/remove-product-quandity', verifyArtistLogin, (req, res) => {



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


router.get('/place-order', verifyArtistLogin, async (req, res) => {
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let artist = await artistHelpers.getArtistDetails(req.session.artist._id)
  let total = await userHelper.getTotalAmount(req.session.artist._id)
  res.render('cart/artist-place-order', { artist, total, artists: true, cartCount })

});




router.post('/place-order', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let products = await userHelper.getCartProductList(req.body.userId)
  let totalPrice = await userHelper.getTotalAmount(req.body.userId)
  let date = new Date()

  userHelper.placeOrder(req.body, products, totalPrice, date).then((response,) => {
    res.render('cart/success', { artist, artists: true, cartCount })
  })
});

router.get('/my-orders', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let orders = await userHelper.getOrderProducts(req.session.artist._id)

  res.render('cart/all-orders', { artist, orders, artists: true, cartCount })
});

router.get('/my-orders/view-order-products/:id', verifyArtistLogin, async (req, res) => {
  let artist = req.session.artist
  let cartCount = await userHelper.getCartCount(req.session.artist._id)
  let products = await userHelper.getOrderOnlyProducts(req.params.id)
  console.log(products)
  res.render('cart/view-order-products', { artist, products, artists: true, cartCount })
});

router.post('/artistStar', verifyArtistLogin, (req, res) => {

  artistHelpers.addStarRate(req.body).then((respon) => {
    artistHelpers.gerArtistStarAverage(req.body.createrId)
    res.json(respon)
  })
});

router.post('/add-favorite',verifyArtistLogin,(req,res)=>{
  userHelper.addFavorites(req.body).then((respon)=>{
    res.json(respon)
  })
});

router.post('/remove-favorite',verifyArtistLogin,(req,res)=>{
  userHelper.removeFavorite(req.body).then((respon)=>{
    res.json(respon)
  })
});

module.exports = router;



