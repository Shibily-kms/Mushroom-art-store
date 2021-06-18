var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb')

module.exports = {
    
    editCarowsel:(carouselId)=>{
       
        return new Promise((resolve, reject) => {
         db.get().collection(collection.CAROWSEL_COLLECTION).updateOne({_id:ObjectId(carouselId.id)},{
                $set:{
                    link:carouselId.CarowselLink
                }
            }).then((response)=>{
                resolve()
                
            })
           
        })
        
      
    },


    getAllCarowsel: () => {
        return new Promise(async (resolve, reject) => {
            let allcarowsel = await db.get().collection(collection.CAROWSEL_COLLECTION).find().toArray()
           
            resolve(allcarowsel)
        })
    }

}


