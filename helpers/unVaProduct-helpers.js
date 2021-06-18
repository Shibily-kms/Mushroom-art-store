var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const { response } = require('express')




module.exports = {
    addUbvalidProduct: (unValidProduct) => {
        console.log("valid", unValidProduct)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).insertOne(unValidProduct).then((data) => {
                resolve(data.ops[0])
                console.log("response", data.ops[0])
            })
        })
    },

    getArtistProduct: (artist) => {
        return new Promise(async (resolve, reject) => {
            let ArtId = artist.ArId

            let allunProductArtist = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).find({ "ArId": ArtId }).toArray()

            resolve(allunProductArtist)
        })

    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            allProducts = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).find().toArray()
            resolve(allProducts)
        })
    },

    getProductDetails: (ProId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).findOne({ _id: objectId(ProId) }).then((product) => {
                resolve(product)
                if (product) {
                    db.get().collection(collection.ARTIST_COLLECTION).findOne({ ArId: product.ArId }).then((Artist) => {
                        resolve(Artist)
                    })
                }
            })
        })
    },

    getProductCreater: (ProId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).findOne({ _id: objectId(ProId) }).then((product) => {
                if (product) {
                    db.get().collection(collection.ARTIST_COLLECTION).findOne({ ArId: product.ArId }).then((Artist) => {
                        resolve(Artist)
                    })
                }
            })
        })
    },

    updateStatusProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Status: proDetails.Status
                          } }).then((response) => {
                    if(response){
                        db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                            resolve(product)
                           if(product.Status === "Confiemed"){

                            create_random_id(6)
                            function create_random_id(sting_length){
                                var randomString ='';
                                var numbers = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                                for(var i,i =0; i< sting_length; i++){
                                    randomString += numbers.charAt(Math.floor(Math.random()*numbers.length))
                                }
                                
                                product.PrId = "PrID_"+randomString
                               
                            }
                              
                               db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(product).then((data)=>{
                                  if(data){
                                      db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).removeOne({_id:objectId(proId)}).then((status)=>{
                                          console.log("product Deleted")
                                          resolve()
                                      })
                                  }
                               })
                           }else{
                               resolve()
                           }
                        })
                    }
                })
        })
    },

    adminEditUnproduct: (ProId,ProDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION)
            .updateOne({_id:objectId(ProId)},{
                $set:{
                    ProductName: ProDetails.ProductName,
                    Price: ProDetails.Price,
                    Description: ProDetails.Description,
                    Status: ProDetails.Status,
                    Category: ProDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    deleteUnProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
                console.log(response,"delete")
            })
        })
    }



}
