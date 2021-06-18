var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectID
const { getArtistDetails } = require('./artist-helpers')



module.exports={
    addProducts:(newproduct)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ArId:newproduct.ArId}).then((response)=>{
                if(response){
                    
                    create_random_id(6)
                    function create_random_id(sting_length){
                        var randomString ='';
                        var numbers = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                        for(var i,i =0; i< sting_length; i++){
                            randomString += numbers.charAt(Math.floor(Math.random()*numbers.length))
                        }
                        newproduct.PrId = "PrID_"+randomString
                        newproduct.Price = parseInt(newproduct.Price)
                    }
                   

                    db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(newproduct).then((response)=>{
                        resolve(response)
                        console.log(response)
                    })
                }else{
                    resolve()  
                }
            })
        })
    },

    getAllProuducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let allproducts=await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(allproducts)
        })
    },
    deleteProduct:(ProdId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).removeOne({_id:objectId(ProdId)}).then((response)=>{
            resolve(response)
            console.log('delete',response)
        })
        })
    },
    getProductDetails:(ProId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:objectId(ProId)}).then((product)=>{
                resolve (product)
            })
        })
    },
    updateProduct:(ProId,ProDetails)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:objectId(ProId)},{
                $set:{
                    ProductName:ProDetails.ProductName,
                    Category:ProDetails.Category,
                    Description:ProDetails.Description,
                    ArId:ProDetails.ArId,
                    Price:ProDetails.Price
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    getArtistAllProducts:(artist)=>{
        return new Promise(async(resolve,reject)=>{
            let ArtId = artist.ArId
            let allArtistProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ "ArId": ArtId }).toArray()
            resolve(allArtistProduct)
            console.log(allArtistProduct)

        })
    },

    
}   