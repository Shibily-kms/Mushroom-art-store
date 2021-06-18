var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
var objectId = require('mongodb').ObjectID

module.exports = {

    adminSingup: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let singupStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminEmailId: adminData.adminEmailId })
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ EmailId: adminData.adminEmailId })
            let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ EmailId: adminData.adminEmailId })

            if (!user, !artist, !admin) {



                adminData.adminPassword1 = await bcrypt.hash(adminData.adminPassword1, 10),
                    adminData.adminPassword2 = await bcrypt.hash(adminData.adminPassword2, 10)
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                    resolve(data.ops[0])

                })

            } else {
                response.admin = true
                response.user = true
                response.artist = true
                resolve({ EmailErr: true })

            }

        })
    },
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let responseA = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminEmailId: adminData.adminEmailId })

            if (admin) {
                bcrypt.compare(adminData.adminPassword1, admin.adminPassword1).then((statusA1) => {

                    if (statusA1) {
                        bcrypt.compare(adminData.adminPassword2, admin.adminPassword2).then((statusA2) => {


                            if (statusA1 && statusA2) {
                                responseA.admin = admin
                                responseA.statusA1 = true
                                responseA.statusA2 = true
                                responseA.PssOneErr = false
                                responseA.PssTwoErr = false
                                responseA.EmailErr = false
                                resolve(responseA)

                            } else {
                                resolve({ PssTwoErr: true })

                            }
                        })
                    } else {
                        resolve({ PssOneErr: true })

                    }
                })
            } else {
                resolve({ EmailErr: true })

            }
        })
    },
    getAllAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let allAdmin = await db.get().collection(collection.ADMIN_COLLECTION).find().toArray()
            resolve(allAdmin)
        })
    },

    getAdminDetails: (adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: objectId(adminId) }).then((admin) => {
                resolve(admin)
            })
        })
    },

    deleteAdmin: (adminId,thisAdmin) => {
        let result = adminId === thisAdmin
        
        return new Promise((resolve, reject) => {
            if(!result){
                db.get().collection(collection.ADMIN_COLLECTION).removeOne({ _id: objectId(adminId) }).then((response) => {
                    resolve({deleted:true})
                })
            }else{
                resolve({theSame:true})
            }
            
        })
    },

    getOrderCount: () => {
        let Pending = 'Pending'
        let Placed = 'Placed'
        let Confiemed = 'Confiemed'
        let Processed = 'Processed'
        let Shipped = 'Shipped'
        let Delivered = 'Delivered'
        let Rejected = 'Rejected'
        return new Promise(async(resolve, reject) => {

          let PendingCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Pending})
          let PlacedCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Placed})
          let ConfiemedCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Confiemed})
          let ProcessedCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Processed})
          let ShippedCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Shipped})
          let DeliveredCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Delivered})
          let RejectedCount = await  db.get().collection(collection.ORDER_COLLECTION).countDocuments({status:Rejected})
          let TotalOrder = PendingCount + PlacedCount + ConfiemedCount + ProcessedCount + ShippedCount + DeliveredCount + RejectedCount
          
          let OrdersCount = {
              PendingCount: PendingCount,
              PlacedCount : PlacedCount,
              ConfiemedCount : ConfiemedCount,
              ProcessedCount : ProcessedCount,
              ShippedCount : ShippedCount,
              DeliveredCount : DeliveredCount,
              RejectedCount : RejectedCount,
              TotalOrder : TotalOrder
          }
        
          resolve (OrdersCount)


                // resolve(orderCount)
            
        })
    },

    getToArtitCount:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TO_ARTIST_COLLECTION).countDocuments().then((count)=>{
                resolve(count)
            })
        })
        
    },

    getProductCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments().then((productsCount) => {
                resolve(productsCount)
            })
        })
    },

    getUserCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).countDocuments().then((userCount) => {
                resolve(userCount)
            })
        })
    },

    getArtistCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).countDocuments().then((artistCount) => {
                resolve(artistCount)
            })
        })
    },

    getPendingPrductCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments().then((unvalidProductCount) => {
                resolve(unvalidProductCount)
            })
        })
    },

    getForSalesCount: () => {
        let forSales = "For Sales"

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ Category: forSales }).then((forSalesCount) => {

                resolve(forSalesCount)
            })
        })
    },

    getAllpendingproduct: () => {
        let pending = "Pending"

        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments({ Status: pending }).then((pendingCount) => {
                resolve(pendingCount)
            })
        })
    },

    getAllNotvalidProduct: () => {
        let notValid = "Not-Approve"

        return new Promise((resolve, reject) => {
            db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments({ Status: notValid }).then((NotapproveCount) => {
                resolve(NotapproveCount)
            })
        })
    },

    getAllAdminCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).countDocuments().then((adminCount) => {
                resolve(adminCount)
            })
        })
    },

    getTrashUserCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRASH_USER_COLLECTION).countDocuments().then((trashUserCount) => {
                resolve(trashUserCount)
            })
        })
    },

    getTrashArtistCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRASH_ARTIST_COLLECTION).countDocuments().then((trashArtistCount) => {
                resolve(trashArtistCount)
            })
        })
    },

    getAllArtistDetails: () => {
        return new Promise(async (resolve, reject) => {
            let starArray = await db.get().collection(collection.STAR_COLLECTION).find().toArray()
            let artistArray = await db.get().collection(collection.ARTIST_COLLECTION).find().toArray()

            // const arr1 = [
            //     { id: "abdc4051", date: "2017-01-24" }, 
            //     { id: "abdc4052", date: "2017-01-22" },
            //     { id: "abdc4053", date: "2017-01-22" }
            //   ];
            //   const arr2 = [
            //     { nameId: "abdc4051", name: "ab" },
            //     { nameId: "abdc4052", name: "abc" }
            //   ];
            //   ..............................................
            //   const map = new Map();
            //   starArray.forEach(item => map.set(item.artist, item));
            //   artistArray.forEach(item => map.set(item._id, {...map.get(item._id), ...item}));
            //   const mergedArr = Array.from(map.values());

            //   console.log(mergedArr);

            // var members = [{ docId: "1234", userId: 222 }, { docId: "1235", userId: 333 }];
            // var memberInfo = [{ id: 222, name: "test1" }, { id: 333, name: "test2" }];
            // var finalArray = _.map(members, function (member) {
            //     return _.extend(member, _.omit(_.findWhere(memberInfo, { id: member.userId }), 'id'));
            // });
            // console.log(finalArray)

            // ................................

            // var members = [{
            //     docId: "1234",
            //     userId: 222
            // }, {
            //     docId: "1235",
            //     userId: 333
            // }];
            // var memberInfo = [{
            //     id: 222,
            //     name: "test1"
            // }, {
            //     id: 333,
            //     name: "test2"
            // }];
            // var finalArray = [];

            // _.each(memberInfo, function (item) {
            //     finalArray.push(_.each(_.where(members, {
            //         userId: item.id
            //     }),

            //     function (element) {
            //         element.name = item.name
            //     }));
            // });

            // console.log(finalArray);
            // ....................................................
            // let selectedSubjects = [
            //     { subject_id: 711, topics: ["Test", "Test2"] },
            //     { subject_id: 712, topics: ["topic1", "Topic2"] }
            // ]

            // let theOtherSubjects = [
            //     { subject_id: 711, subject_name: "Science" },
            //     { subject_id: 712, subject_name: "Maths" }
            // ] // fixed the ids as I supposed the should be the same, otherwise it makes no sense with the provided data

            let mergedSubjects = artistArray.map(subject => {
                console.log(subject,'subject1')
                let otherSubject = starArray.find(element => element._id === subject._id)
                console.log(starArray,'subject2')
                return { ...subject, ...otherSubject }
                
            })
            console.log(mergedSubjects,'reselt')

            // let mergedSubjects = selectedSubjects.map(subject => {
            //     console.log(subject,'subject1')
            //     let otherSubject = theOtherSubjects.find(element => element.subject_id === subject.subject_id)
            //     console.log(otherSubject,'subject2')
            //     return { ...subject, ...otherSubject }
                
            // })
            // console.log(mergedSubjects,"reselt")



        })

    },

    getAllOrders:()=>{
        return new Promise(async(resolve, reject) => {
            let allOrders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(allOrders)
        })
        
    },

    getUserOrArtist:(id)=>{
        
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(id)})
            console.log(user,'user')
            if(!user){
                db.get().collection(collection.ARTIST_COLLECTION).findOne({_id:objectId(id)}).then((artist)=>{
                    resolve(artist)
                })
            }else{
                resolve(user)
            }
        })
        
    },

    getUserOrderProductDetails:(orderId)=>{
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

    getUserOrderDetails:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((order)=>{
                resolve(order)
            })
        })
    
    },

    changeOrderStatus:(orderId,details)=>{
        
        return new Promise((resolve, reject) => {

                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                    $set:{
                        status:details.status
                    }
                }).then((response)=>{
                    resolve()
                   
                })
            
        })
        
    },

    getAllToArtistForm:()=>{
        return new Promise(async(resolve, reject) => {
            let allForms = await db.get().collection(collection.TO_ARTIST_COLLECTION).find().toArray()
        resolve(allForms)
        })
        
    },

    getTopTenArtist:()=>{
        return new Promise(async(resolve, reject) => {

            let short = await db.get().collection(collection.ARTIST_COLLECTION).find().sort({starRate:-1}).limit(10).toArray()
            resolve(short)
            
        })
        
        
    },

    allArtistProducts:(ArId)=>{
        
        return new Promise(async(resolve, reject) => {
           let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ArId:ArId}).toArray()
           resolve(products)
        })
        
    },

    allArtistPendingProducts:(ArId)=>{
        return new Promise(async(resolve, reject) => {
            let Pendingproducts = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).find({ArId:ArId}).toArray()
            resolve(Pendingproducts)
         })
    },

    editAdminDetails:(adminId,details)=>{
        
        return new Promise(async(resolve, reject) => {
            let password1 = await bcrypt.hash(details.Password1, 10)
            let password2 = await bcrypt.hash(details.Password2, 10)
            console.log(password1,"22",password2)
            let password11 = details.Password1 === ''
            let password22 = details.Password2 === ''
            console.log(password11,password22)

            if(password11 && password22){
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},{
                    $set:{
                        adminFirstName:details.FirstName,
                        adminLastName:details.LastName,
                        adminUserName:details.UserName,
                        adminEmailId:details.EmailId,
                       
                    }
                }).then((response)=>{
                    resolve()
                    console.log('change1')
            })
         } else if (password11){
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},{
                    $set:{
                        adminFirstName:details.FirstName,
                        adminLastName:details.LastName,
                        adminUserName:details.UserName,
                        adminEmailId:details.EmailId,
                        adminPassword2:password2
                    }
                }).then((response)=>{
                    resolve()
                    console.log('change2')
                })
            }else if(password22){
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},{
                    $set:{
                        adminFirstName:details.FirstName,
                        adminLastName:details.LastName,
                        adminUserName:details.UserName,
                        adminEmailId:details.EmailId,
                        adminPassword1:password1,
                        
                    }
                }).then((response)=>{
                    resolve()
                    console.log('change3')
                })
            }else{
                db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},{
                    $set:{
                        adminFirstName:details.FirstName,
                        adminLastName:details.LastName,
                        adminUserName:details.UserName,
                        adminEmailId:details.EmailId,
                        adminPassword1:password1,
                        adminPassword2:password2
                    }
                }).then((response)=>{
                    resolve()
                    console.log('change4')
                })
            }
            
        })
        
    },

    getAllTrashArtist:()=>{
        return new Promise(async(resolve, reject) => {
            let trashArtist = await  db.get().collection(collection.TRASH_ARTIST_COLLECTION).find().toArray()
            resolve(trashArtist)
        })
        
    },
    
    getAllTrashUser:()=>{
        return new Promise(async(resolve, reject) => {
            let trashUser = await  db.get().collection(collection.TRASH_USER_COLLECTION).find().toArray()
            resolve(trashUser)
        })
        
    },


    



}