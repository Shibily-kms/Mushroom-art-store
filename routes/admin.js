var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path')
var carowselHelper = require('../helpers/carowsel-helpers')
var adminHelper = require('../helpers/admin-helpers');
var productsHelper = require('../helpers/product-helpers');
var artistHelpers = require('../helpers/artist-helpers');
const { response } = require('express');
const userHelper = require('../helpers/user-helpers');
const unVaProductHelpers = require('../helpers/unVaProduct-helpers');


const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
};


/* GET users listing. */
router.get('/', verifyAdminLogin, async function (req, res, next) {
  let admin = req.session.admin
  let OrdersCount = await adminHelper.getOrderCount()
  let allProductsCount = await adminHelper.getProductCount()
  let allUsersCount = await adminHelper.getUserCount()
  let allartistCount = await adminHelper.getArtistCount()
  let allMemberCount = allUsersCount + allartistCount
  let allunvalidProductCount = await adminHelper.getPendingPrductCount()
  let forSaleCount = await adminHelper.getForSalesCount()
  let forDrowingCount = allProductsCount - forSaleCount
  let allPendingProductsCount = await adminHelper.getAllpendingproduct()
  let allNotvalidProductsCount = await adminHelper.getAllNotvalidProduct()
  let allEditedProductCount = allunvalidProductCount - (allPendingProductsCount + allNotvalidProductsCount)
  let allAdminCount = await adminHelper.getAllAdminCount()
  let trashUserCount = await adminHelper.getTrashUserCount()
  let trashArtistCount = await adminHelper.getTrashArtistCount()
  let allTenArtist = await adminHelper.getTopTenArtist()
  let toArtistCount = await adminHelper.getToArtitCount()



  res.render('admin/dashboard', {
    admin, OrdersCount, allProductsCount, allMemberCount, allartistCount, allUsersCount, allunvalidProductCount, forSaleCount, forDrowingCount,
    allPendingProductsCount, allNotvalidProductsCount, allEditedProductCount, allAdminCount, trashUserCount, trashArtistCount, allTenArtist, toArtistCount
  })

});

router.get('/all-products', verifyAdminLogin, function (req, res) {
  if (req.session.addSuccess) {
    productsHelper.getAllProuducts().then((allproducts) => {
      res.render('admin/all-products', { allproducts, admin: true, "addSuccess": req.session.addSuccess })
      req.session.addSuccess = false
    })
  } else {
    productsHelper.getAllProuducts().then((allproducts) => {
      res.render('admin/all-products', { allproducts, admin: true })

    })
  }


});

router.get('/add-products', verifyAdminLogin, function (req, res) {
  if (req.session.artistInvalid) {
    res.render('admin/add-products', { admin: true, "artistInvalid": req.session.artistInvalid })
    req.session.artistInvalid = false
  } else {
    res.render('admin/add-products', { admin: true })
  }

});

router.post('/add-products', verifyAdminLogin, (req, res) => {
  productsHelper.addProducts(req.body).then((response) => {
    console.log(req.body)
    if (response) {
      req.session.addSuccess = 'New product added successfully completed !'
      let image = req.files.Image
      let id = req.body._id
      image.mv('./public/products-images/' + id + 'm-art' + '.jpg', (err) => {
        if (!err) {
          res.redirect('/admin/all-products')
        } else {
          console.error(err)
        }
      })
    } else {
      req.session.artistInvalid = 'Artist Id not valid. Pleace check !'
      res.redirect('/admin/add-products')
    }
  })
});


router.get('/edit-pages', verifyAdminLogin, function (req, res) {
  carowselHelper.getAllCarowsel().then((allcarowsel) => {
    res.render('admin/edit-pages', { admin: true, allcarowsel })
  })

});

router.post('/edit-carowsel', verifyAdminLogin, (req, res) => {
  carowselHelper.editCarowsel(req.body).then((response) => {
    let image = req.files.CarowselImage
    let id = req.body.id
    image.mv('./public/carowsel-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect('/admin/edit-pages')
      } else {
        console.log(err);
      }
    })
  })

});

router.get('/admin-login', function (req, res) {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login', { "loginErrA": req.session.loginErrA })
    req.session.loginErrA = false
  }
  res.render('admin/admin-login')
});

router.get('/settings/create-admin', verifyAdminLogin, function (req, res, next) {
  if (req.session.admincreateErr) {

    res.render('admin/admin-singup', { "admincreateErr": req.session.admincreateErr, admin: true })
    req.session.admincreateErr = false
  } else if (req.session.adminaccountSuccess) {
    res.render('admin/admin-singup', { "adminaccountSuccess": req.session.adminaccountSuccess, admin: true })
    req.session.adminaccountSuccess = false
  } else {
    res.render('admin/admin-singup', { admin: true })
  }

});


router.post('/settings/create-admin', verifyAdminLogin, (req, res) => {
  adminHelper.adminSingup(req.body).then((response) => {
    if (response.EmailErr) {

      req.session.admincreateErr = "Pleace check Email id. Account already created in this email address !"

      res.redirect('/admin/settings/create-admin');
    } else {
      req.session.adminaccountSuccess = "New admin account succesfully created "
      res.redirect('/admin/settings/create-admin');

    }

  })
});

router.post('/admin-login', (req, res) => {
  adminHelper.adminLogin(req.body).then((responseA) => {

    if (responseA.statusA1 && responseA.statusA2) {
      req.session.admin = true
      req.session.EmailErr = false
      req.session.passOneErr = false
      req.session.passTwoErr = false
      req.session.admin = responseA.admin
      res.redirect('/admin')
    } else if (responseA.EmailErr) {
      req.session.EmailErr = true
      req.session.loginErrA = "invalid Email Address"
      res.redirect('/admin/admin-login')
    } else {
      req.session.loginErrA = "Incorrect Passwords"
      res.redirect('/admin/admin-login')
    }
  })
});

router.get('/admin-logout', verifyAdminLogin, (req, res) => {
  req.session.admin = null
  res.redirect('/admin/admin-login')
});

router.get('/settings', verifyAdminLogin, (req, res, next) => {
  res.render('admin/admin-settings', { admin: true })
});

router.get('/all-artist', verifyAdminLogin, (req, res, next) => {
  artistHelpers.getAllArtists().then((allArtists) => {

    if (req.session.createartist) {
      res.render('admin/all-artist', { "createartist": req.session.createartist, admin: true, allArtists })
      req.session.createartist = false
    } else {
      res.render('admin/all-artist', { allArtists, admin: true })
    }
  })
  adminHelper.getAllArtistDetails()

});

router.get('/all-artist/create-artist', verifyAdminLogin, (req, res, next) => {
  if (req.session.searchErr) {
    res.render('admin/add-artist', { "searchErr": req.session.searchErr, admin: true })
    req.session.searchErr = false
  } else if (req.session.searchedUser) {
    let user = req.session.searchedUser
    res.render('admin/add-artist', { "searchSuccess": req.session.searchSuccess, user, admin: true });
    req.session.searchSuccess = false
    req.session.searchedUser = false
    console.log("user", user)
  } else {
    res.render('admin/add-artist', { admin: true });
  }
});

router.get('/all-products/view-product/:id', verifyAdminLogin, async (req, res) => {
  let ProductDetails = await productsHelper.getProductDetails(req.params.id)
  let ProdctCreater = await artistHelpers.getArtistWithProId(req.params.id)

  res.render('admin/view-product', { admin: true, ProductDetails, ProdctCreater })

})

router.get('/all-products/delete/:id', verifyAdminLogin, (req, res) => {
  let Id = req.params.id

  productsHelper.deleteProduct(Id).then((response) => {
    fs.unlink('/project/mushroom 2/public/products-images/' + Id + 'm-art' + '.jpg', function (error) {
      if (error) {
        console.log(error)
      }
      res.redirect('/admin/all-products')
    })

  })
});

router.get('/all-products/edit-product/:id', verifyAdminLogin, async (req, res) => {
  let product = await productsHelper.getProductDetails(req.params.id)

  res.render('admin/edit-product', { admin: true, product })
});

router.post('/all-products/edit-product/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  productsHelper.updateProduct(req.params.id, req.body).then(() => {

    res.redirect('/admin/all-products/')
    let image = req.files.Image
    image.mv('./public/products-images/' + id + 'm-art' + '.jpg')
  })
});

router.post('/all-artist/search-artist', verifyAdminLogin, async (req, res) => {
  let user = await artistHelpers.getUserDetails(req.body).then(response)

  if (user) {
    req.session.searchedUser = user
    req.session.searchSuccess = " The Email Address valid success "
    res.redirect('/admin/all-artist/create-artist')

  } else {
    req.session.searchErr = "User account not created this email address. Check one more..!"
    res.redirect('/admin/all-artist/create-artist')
  }
});

router.post('/all-artist/search-artist/create/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  artistHelpers.createArtist(req.params.id, req.body).then((response) => {
    if (response) {

      const currentPath = path.join('/project/mushroom 2/public/user-images/', id + ".jpg")
      const newPath = path.join('/project/mushroom 2/public/artist-images/', id + ".jpg")

      fs.rename(currentPath, newPath, function (err) {
        if (err) {
          console.log(err)
        } else {
          req.session.createartist = " New artist account Successfully created "
          res.redirect('/admin/all-artist')
        }
      })

    }
  })

});

router.get('/all-users', verifyAdminLogin, (req, res) => {
  userHelper.getAllUsers().then((allUsers) => {
    res.render('admin/all-users', { allUsers, admin: true })
  })

});

router.get('/settings/all-admin', verifyAdminLogin, (req, res) => {
 
  adminHelper.getAllAdmin().then((allAdmin) => {
    if(req.session.deleted){
      res.render('admin/all-admin', { allAdmin, admin: true, 'deleted':req.session.deleted })
      req.session.deleted = false
    }else if(req.session.same){
      res.render('admin/all-admin', { allAdmin, admin: true, 'same':req.session.same })
      req.session.same = false
    }else{
      res.render('admin/all-admin', { allAdmin, admin: true})
    }
  })
});

router.get('/settings/all-admin/delete/:id', verifyAdminLogin, (req, res) => {
  let thisAdmin = req.session.admin._id
  adminHelper.deleteAdmin(req.params.id,thisAdmin).then((result) => {
    if(result.deleted){
      req.session.deleted = 'This Admin account are Deleted'
      res.redirect('/admin/settings/all-admin')
    }else if(result.theSame){
      req.session.same = 'This your account, You cannot delete yourself !'
      res.redirect('/admin/settings/all-admin')
    }
  })
});

router.get('/pending-products', verifyAdminLogin, (req, res) => {
  unVaProductHelpers.getAllProducts().then((allPentingProducts) => {
    res.render('admin/all-artist-products', { allPentingProducts, admin: true })
  })
});

router.get('/pending-products/view-product/:id', verifyAdminLogin, async (req, res) => {
  let ProdctCreater = await unVaProductHelpers.getProductCreater(req.params.id)
  let ProductDetails = await unVaProductHelpers.getProductDetails(req.params.id)
  res.render('admin/view-artist-product', { admin: true, ProductDetails, ProdctCreater })
});

router.post('/pending-products/view-product/:id', verifyAdminLogin, (req, res) => {
  let Id = req.params.id
  unVaProductHelpers.updateStatusProduct(req.params.id, req.body).then((product) => {
    if (product.Status === "Confiemed") {
      const currentPath = path.join('/project/mushroom 2/public/unproducts-images/', Id + "m-art" + ".jpg")
      const newPath = path.join('/project/mushroom 2/public/products-images/', Id + "m-art" + ".jpg")

      fs.rename(currentPath, newPath, function (err) {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/admin/pending-products')
          console.log("success")
        }
      })

    } else {
      res.redirect('/admin/pending-products')
    }

  })
});

router.get('/pending-products/view-product/:id/edit', verifyAdminLogin, async (req, res) => {
  let ProductDetails = await unVaProductHelpers.getProductDetails(req.params.id)
  console.log(req.params.id)
  res.render('admin/edit-artist-product', { admin: true, ProductDetails })
});

router.post('/pending-products/view-product/:id/edit', verifyAdminLogin, (req, res) => {
  unVaProductHelpers.adminEditUnproduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/pending-products')
  })

});

router.get('/pending-products/delete/:id', verifyAdminLogin, (req, res) => {
  id = req.params.id
  unVaProductHelpers.deleteUnProduct(req.params.id).then((response) => {
    fs.unlink('/project/mushroom 2/public/unproducts-images/' + id + 'm-art' + '.jpg', function (error) {
      if (error) {
        console.log(error)
      }
      res.redirect('/admin/pending-products')
    })

  })
});

router.get('/all-artist/view/:id', verifyAdminLogin, (req, res) => {
  artistHelpers.getArtistDetails(req.params.id).then(async(artist) => {
    let starRate = await artistHelpers.getStarRate(req.params.id)
    let starRate100 = starRate * 20
    let totalStars = await artistHelpers.totalStaredUser(req.params.id)
    let allProducts = await adminHelper.allArtistProducts(artist.ArId)
    let allPentingProducts = await adminHelper.allArtistPendingProducts(artist.ArId)
    res.render('admin/view-artist', { artist, admin: true,starRate,starRate100,totalStars,allProducts,allPentingProducts })
  })
});

router.get('/all-artist/delete/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  artistHelpers.deleteArtist(req.params.id).then((response) => {

    const currentPath = path.join('/project/mushroom 2/public/artist-images/', id + ".jpg")
    const newPath = path.join('/project/mushroom 2/public/trash-artist-images/', id + ".jpg")

    fs.rename(currentPath, newPath, function (err) {
      if (err) {
        console.log(err)
      } else {
        res.redirect('/admin/all-artist')
        console.log("success")
      }
    })
  })
});

router.get('/all-users/view/:id', verifyAdminLogin, (req, res) => {
  userHelper.getUserDetails(req.params.id).then((user) => {
    res.render('admin/view-user', { user, admin: true })
  })
});

router.get('/all-users/delete/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  console.log("id", req.params.id)
  userHelper.deleteUser(req.params.id).then((response) => {

    const currentPath = path.join('/project/mushroom 2/public/user-images/', id + ".jpg")
    const newPath = path.join('/project/mushroom 2/public/trash-user-images/', id + ".jpg")

    fs.rename(currentPath, newPath, function (err) {
      if (err) {
        res.redirect('/admin/all-users')
      } else {
        res.redirect('/admin/all-users')
      }
    })
  })
});

router.get('/settings/profile', verifyAdminLogin,(req, res) => {
  let adminId = req.session.admin._id
  adminHelper.getAdminDetails(adminId).then((adminData) => {
    console.log('admin', adminData)
    res.render('admin/view-admin', { adminData, admin: true })
  })
});



router.get('/all-orders', verifyAdminLogin, (req, res) => {
  adminHelper.getAllOrders().then((allOrders) => {

    res.render('admin/all-orders', { allOrders, admin: true })
  })
});

router.get('/all-orders/view-order/:id/:Oid', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  let orderId = req.params.Oid

  let userDetails = await adminHelper.getUserOrArtist(id)
  let orderProductDetails = await adminHelper.getUserOrderProductDetails(orderId)
  console.log(orderProductDetails)
  let orderDetails = await adminHelper.getUserOrderDetails(orderId)
  let orderProductCount = orderDetails.products.length
  let Pending = orderDetails.status === 'Pending'
  let Placed = orderDetails.status === 'Placed'
  let Confiemed = orderDetails.status === 'Confiemed'
  let Processed = orderDetails.status === 'Processed'
  let Shipped = orderDetails.status === 'Shipped'
  let Delivered = orderDetails.status === 'Delivered'
  let Rejected = orderDetails.status === 'Rejected'
  res.render('admin/view-order', {
    admin: true, userDetails, orderProductDetails, orderDetails, orderProductCount,
    Placed, Confiemed, Processed, Shipped, Delivered, Pending, Rejected
  })
});

router.post('/all-orders/change-status/:id', verifyAdminLogin, (req, res) => {

  adminHelper.changeOrderStatus(req.params.id, req.body).then(() => {
    res.redirect('/admin/all-orders')
  })
});
router.get('/settings/artist-forms', verifyAdminLogin, (req, res) => {
  adminHelper.getAllToArtistForm().then((allForms) => {

    res.render('admin/all-artist-form', { admin: true, allForms })
  })
});

router.post('/settings/profile/edit/:id',verifyAdminLogin,(req,res)=>{
  adminHelper.editAdminDetails(req.params.id,req.body).then(()=>{
    res.redirect('/admin/settings/profile')
  })
});

router.get('/settings/artist-trash',verifyAdminLogin,(req,res)=>{
  adminHelper.getAllTrashArtist().then((trashArtist)=>{
    res.render('admin/trash-artist-list',{admin:true,trashArtist})
  })

});

router.get('/settings/user-trash',verifyAdminLogin,(req,res)=>{
  adminHelper.getAllTrashUser().then((trashUser)=>{
    res.render('admin/trash-user-list',{admin:true,trashUser})
  })

});

module.exports = router;




