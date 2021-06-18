var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
const { response } = require('express')


module.exports = {
    doSingup: (userData) => {
        return new Promise(async (resolve, reject) => {
            // let singStatus=false
            let response = {}



            let userEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ EmailId: userData.EmailId })
            let artistEmail = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ EmailId: userData.EmailId })

            if (!userEmail && !artistEmail) {
                userData.Password1 = await bcrypt.hash(userData.Password1, 10)

                create_random_id(5)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '0123456789'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }

                    userData.UrId = "UrID" + randomString

                }


                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.ops[0])
                });


            } else {
                response.userEmail = true
                response.artistEmail = true
                resolve({ emailerr: true });
            }
        })
    },
    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ EmailId: userData.EmailId })
            let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ EmailId: userData.EmailId })


            if (user) {
                bcrypt.compare(userData.Password1, user.Password1).then((status) => {
                    if (status) {

                        response.user = user
                        response.status = true
                        response.EmailErr = false

                        resolve(response)
                    } else {

                        resolve({ status: false })

                    }
                })
            } else if (artist) {
                bcrypt.compare(userData.Password1, artist.Password1).then((artistStatus) => {
                    if (artistStatus) {

                        response.artist = artist
                        response.artistStatus = true
                        response.EmailErr = false

                        resolve(response)
                    } else {

                        resolve({ aristStatus: false })

                    }
                })

            } else {
                resolve({ EmailErr: true })

            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(allUsers)
        })
    },


    updateUser: (userDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ EmailId: userDetails.EmailId }, {
                $set: {
                    FirstName: userDetails.FirstName,
                    LastName: userDetails.LastName,
                    UserName: userDetails.UserName,
                    Mobile: userDetails.Mobile,
                    Pincode: userDetails.Pincode,
                    House: userDetails.House,
                    Area: userDetails.Area,
                    City: userDetails.City,
                    Landmark: userDetails.Landmark,
                    Country: userDetails.Country,
                    State: userDetails.State,
                    DMobile: userDetails.DMobile,
                    DPincode: userDetails.DPincode,
                    DHouse: userDetails.DHouse,
                    DArea: userDetails.DArea,
                    DCity: userDetails.DCity,
                    DLandmark: userDetails.DLandmark,
                    DCountry: userDetails.DCountry,
                    DState: userDetails.DState,
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    changePassword: (details) => {
        let emailId = details.EmailId
        let passwordOld = details.Password1
        let passwordNew = details.PasswordNew

        

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ EmailId: emailId })
            
            
            if (user) {
                bcrypt.compare(passwordOld, user.Password1).then(async (status) => {

                    if (status) {

                     passwordNew = await bcrypt.hash(passwordNew, 10)
                    
                        db.get().collection(collection.USER_COLLECTION).updateOne({ EmailId: emailId },
                            {
                                $set: {
                                    Password1: passwordNew
                                }
                            }).then((response) => {
                                resolve({passwordSuccess:true})
                                console.log('password Changed')
                            });

                    } else {
                        resolve({ PasswordErr: true })
                    }
                })
            }
        })
    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                if (user) {
                    db.get().collection(collection.TRASH_USER_COLLECTION).insertOne(user).then((response) => {
                        if (response) {
                            db.get().collection(collection.USER_COLLECTION).removeOne({ _id: objectId(userId) }).then((data) => {
                                resolve(data)
                            })
                        }
                    })
                }
            })
        })
    },

    addToCart: (proId, userId, date) => {
        return new Promise(async (resolve, reject) => {
            let proDetails = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(proId) })
            console.log(proDetails)
            let proObj = {
                item: objectId(proId),
                quantity: 1,
                ArId: proDetails.ArId,
                Category: proDetails.Category,
                date: date
            }

            console.log(proObj)


            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 },

                            }
                        ).then((response) => {
                            console.log(response)
                            resolve()
                        })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {

                            $push: { products: proObj }

                        }).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    DrodwingaddToCart: (proId, userId, DateTime) => {
        return new Promise(async (resolve, reject) => {
            let proDetails = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(proId) })
            let proObj = {
                item: objectId(proId),
                quantity: 1,
                ArId: proDetails.ArId,
                category: proDetails.Category,
                DateTime: DateTime
            }

            console.log(proObj)


            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $push: {
                                    products: proObj
                                }
                            }
                        ).then((response) => {
                            resolve()
                        })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {

                            $push: { products: proObj }

                        }).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0

            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)

        })
    },

    changeProductQuandity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) }, {
                        $pull: { products: { item: objectId(details.product) } }
                    }).then((respon) => {
                        resolve({ removeProduct: true })

                    })
            } else {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((respon) => {
                        resolve({ status: true })

                    })
            }
        })
    },

    removeProductQuandity: (details) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) }, {
                    $pull: { products: { item: objectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },

    getTotalAmount: (userId) => {

        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                    }
                }

            ]).toArray()
            resolve(total[0].total)


        })
    },

    placeOrder: (order, products, total, date) => {
        console.log(order, "orderdetails")
        return new Promise((resolve, reject) => {

            create_random_id(6)
            function create_random_id(sting_length) {
                var randomString = '';
                var numbers = '0123456789'
                for (var i, i = 0; i < sting_length; i++) {
                    randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                }

                response.OrId = "OrID" + randomString

            } 

            let DeliveryAddress = {
                Mobile: order.DMobile,
                Pincode: order.DPincode,
                House: order.DHouse,
                Area: order.DArea,
                City: order.DCity,
                Landmark: order.DLandmark,
                State: order.DState,
                Country: order.DCountry

            }
            let staus = order['payment-method'] === 'COD' ? 'Placed' : 'Pending'

            let oderObj = {
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                OrId:response.OrId,
                totalAmout: total,
                status: staus,
                date: date,
                address: DeliveryAddress

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(oderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(order.userId) })
                resolve()
            })
        })
    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },

    editDeliveryAddress: (userDetails) => {
        let userId = userDetails.id
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    DMobile: userDetails.DMobile,
                    DPincode: userDetails.DPincode,
                    DHouse: userDetails.DHouse,
                    DArea: userDetails.DArea,
                    DCity: userDetails.DCity,
                    DLandmark: userDetails.DLandmark,
                    DCountry: userDetails.DCountry,
                    DState: userDetails.DState,
                }
            }).then((detail) => {
                resolve()
            })
        })

    },

    getOrderProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(orders)
        })
    },

    getOrderOnlyProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {

            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        date: '$products.date'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, date: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(orderItems)


        })
    },

    addFavorites: (details) => {
        let userId = details.user
        let proId = details.product
        let productObj = {
            product: objectId(proId)
        }
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.FAVORITE_COLLECTION).findOne({ user: objectId(userId) })
            if (user) {
                let proExist = user.favorite.findIndex(favorites => favorites.product == proId)
                console.log('pro', proExist)
                if (proExist != -1) {
                    db.get().collection(collection.FAVORITE_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {
                            $pull: { favorite: { product: objectId(proId) } }
                        }).then((respon) => {
                            resolve({ favoriteRemove: true })
                            console.log('removed')
                        })


                } else {
                    db.get().collection(collection.FAVORITE_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {

                            $push: { favorite: productObj }

                        }).then((respon) => {
                            resolve({ favoriteNewAdd: true })
                            console.log('added new')
                        })
                }

            } else {
                let favoriteObj = {
                    user: objectId(userId),
                    favorite: [productObj]
                }
                db.get().collection(collection.FAVORITE_COLLECTION).insertOne(favoriteObj).then((respon) => {
                    resolve({ userFavoriteAdd: true })
                    console.log('added')
                })
            }
        })
    },

    getFavorites: (userId) => {
        return new Promise(async (resolve, reject) => {
            let favorites = await db.get().collection(collection.FAVORITE_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$favorite'
                },
                {
                    $project: {
                        product: '$favorite.product'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        product: 1, products: { $arrayElemAt: ['$products', 0] }
                    }
                },
            ]).toArray()
            resolve(favorites)
        })
    },

    removeFavorite: (details) => {
        let userId = details.user
        let proId = details.product

        return new Promise((resolve, reject) => {
            db.get().collection(collection.FAVORITE_COLLECTION)
                .updateOne({ user: objectId(userId) }, {
                    $pull: { favorite: { product: objectId(proId) } }
                }).then((respon) => {
                    resolve({ removeProduct: true })

                })
        })
    },

    artistAddForm:(details)=>{
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(details.id)})
            if(user){
                let userObj={
                    userId : user._id,
                    FirstName: user.FirstName,
                    LastName:user.LastName,
                    EmailId:user.EmailId,
                    UrId:user.UrId,
                    Mobile:user.Mobile
                }
                db.get().collection(collection.TO_ARTIST_COLLECTION).insertOne(userObj).then((response)=>{
                    resolve()
                })
            }
        })
        
    }









}