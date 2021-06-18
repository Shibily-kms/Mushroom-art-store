var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

module.exports = {

    getUserDetails: (mail) => {
        return new Promise(async (resolve, reject) => {
            let serchStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ EmailId: mail.EmailId })
            resolve(user)
        })
    },

    createArtist: (userId, userDetils) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {

                resolve(response)

                if (response) {


                    create_random_id(5)
                    function create_random_id(sting_length) {
                        var randomString = '';
                        var numbers = '0123456789'
                        for (var i, i = 0; i < sting_length; i++) {
                            randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                        }

                        response.ArId = "ArID" + randomString

                    }
                    db.get().collection(collection.ARTIST_COLLECTION).insertOne(response).then((data) => {

                        resolve(data)
                        if (data) {
                            db.get().collection(collection.USER_COLLECTION).removeOne({ _id: objectId(userId) }).then((removerespone) => {

                                resolve(removerespone)

                            })
                        }
                    })
                }
            })
        })
    },

    getAllArtists: () => {
        return new Promise(async (resolve, reject) => {
            let allartists = await db.get().collection(collection.ARTIST_COLLECTION).find().toArray()
            resolve(allartists)
        })
    },

    updateArtist: (userDetails) => {
        // ഇവിടെ userDetails പകരം artistDetails ആണ് വിളിക്കേണ്ടത് എളുപ്പത്തിന് ചെയ്തതാണ്
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).updateOne({ EmailId: userDetails.EmailId }, {
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
    getArtistDetails: (ArtistId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: objectId(ArtistId) }).then((response) => {
                resolve(response)
            })
        })
    },

    changePassword: (details) => {
        let emailId = details.EmailId
        let passwordOld = details.Password1
        let passwordNew = details.PasswordNew



        return new Promise(async (resolve, reject) => {

            let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ EmailId: emailId })


            if (artist) {
                bcrypt.compare(passwordOld, artist.Password1).then(async (status) => {

                    if (status) {

                        passwordNew = await bcrypt.hash(passwordNew, 10)

                        db.get().collection(collection.ARTIST_COLLECTION).updateOne({ EmailId: emailId },
                            {
                                $set: {
                                    Password1: passwordNew
                                }
                            }).then((response) => {
                                resolve({ passwordSuccess: true })
                                console.log('password Changed')
                            });

                    } else {
                        resolve({ PasswordErr: true })
                    }
                })
            }
        })
    },

    getArtistWithProId: (ProId) => {
        console.log(ProId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(ProId) }).then((product) => {
                if (product) {
                    db.get().collection(collection.ARTIST_COLLECTION).findOne({ ArId: product.ArId }).then((ArtistDetails) => {
                        resolve(ArtistDetails)
                    })
                }
            })
        })
    },

    deleteArtist: (ArtistId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: objectId(ArtistId) }).then((artist) => {
                if (artist) {
                    db.get().collection(collection.TRASH_ARTIST_COLLECTION).insertOne(artist).then((response) => {
                        if (response) {
                            db.get().collection(collection.ARTIST_COLLECTION).removeOne({ _id: objectId(ArtistId) }).then((data) => {
                                resolve(data)
                            })
                        }
                    })
                }
            })
        })
    },

    editDeliveryAddress: (artistDetails) => {
        console.log(artistDetails, "sldfls")
        let artistId = artistDetails.id
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).updateOne({ _id: objectId(artistId) }, {
                $set: {
                    DMobile: artistDetails.DMobile,
                    DPincode: artistDetails.DPincode,
                    DHouse: artistDetails.DHouse,
                    DArea: artistDetails.DArea,
                    DCity: artistDetails.DCity,
                    DLandmark: artistDetails.DLandmark,
                    DCountry: artistDetails.DCountry,
                    DState: artistDetails.DState,
                }
            }).then((details) => {
                resolve()
            })
        })

    },

    addStarRate: (starBody) => {
        let createrId = objectId(starBody.createrId)

        return new Promise(async (resolve, reject) => {

            let userId = starBody.userId

            let rate = parseInt(starBody.star)
            let userObj = {
                userId: objectId(starBody.userId),
                rate: parseInt(starBody.star)

            }

            let artistStar = await db.get().collection(collection.STAR_COLLECTION).findOne({ artist: objectId(createrId) })
            console.log(artistStar, 'artiststar')
            if (artistStar) {
                let userExist = artistStar.user.findIndex(thisUser => thisUser.userId == userId)
                console.log(userExist, 'exist')
                if (userExist != -1) {
                    db.get().collection(collection.STAR_COLLECTION)
                        .updateOne({ artist: objectId(createrId), 'user.userId': objectId(userId) },

                            {
                                $set: { 'user.$.rate': rate },

                            }
                        ).then((response) => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.STAR_COLLECTION)
                        .updateOne({ artist: objectId(createrId) }, {

                            $push: { user: userObj }

                        }).then((response) => {
                            resolve()
                        })
                }
            } else {
                let starObj = {
                    artist: objectId(createrId),
                    user: [userObj]
                }
                db.get().collection(collection.STAR_COLLECTION).insertOne(starObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    // getArtistStar: (createrId, userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let createrStar = await db.get().collection(collection.STAR_COLLECTION).findOne({ artist: objectId(createrId) })

    //         if (createrStar) {
    //             let userExist = createrStar.user.find(thisUser => thisUser.userId == userId)
    //             if (userExist) {
    //                 let userStarrateCount = userExist.rate
    //                 resolve(userStarrateCount)
    //             } else {
    //                 console.log('not submit start rate this user')
    //             }
    //         } else {
    //             console.log('not Star rate this artist')
    //         }
    //     })

    // },

    gerArtistStarAverage: (createrId) => {
        return new Promise(async (resolve, reject) => {
            let artistStar = await db.get().collection(collection.STAR_COLLECTION).findOne({ artist: objectId(createrId) })
            let staredUser = artistStar.user.length
            console.log(staredUser)
            let total = await db.get().collection(collection.STAR_COLLECTION).aggregate([
                {
                    $match: { artist: objectId(createrId) }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        userId: '$user.userId',
                        rate: '$user.rate'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalStar: { $sum: '$rate' }
                    }
                }
            ]).toArray()

            let totalStar = total[0].totalStar
            let FullStaratUserCount = staredUser * 5
            let artistStarAverage = totalStar * (5 / FullStaratUserCount)
            let a = String(artistStarAverage).substring(0, 3)
            let StarRate5 = parseFloat(a.replace(',', '.').replace(' ', ''))
            console.log(StarRate5,'start5')
            
            if (StarRate5) {
                db.get().collection(collection.STAR_COLLECTION)
                    .updateOne({ artist: objectId(createrId) },

                        {
                            $set: { 'starRate': StarRate5 },

                        }
                    ).then((response) => {
                        resolve()

                        db.get().collection(collection.ARTIST_COLLECTION)
                            .updateOne({ _id: objectId(createrId) },

                                {
                                    $set: { 'starRate': StarRate5 },

                                }
                            ).then((response) => {
                                resolve()


                            })
                    })
            }

            console.log(StarRate5, 'kkkk')
        })


    },

    getStarRate: (artistId) => {
        return new Promise(async(resolve, reject) => {
          let artist =  await  db.get().collection(collection.STAR_COLLECTION).findOne({ artist: objectId(artistId) })
            
                if (artist) {
                    let starRate = artist.starRate
                    console.log(starRate,'star')
                    resolve(starRate)
                } else {
                    let starRate = 0
                    resolve(starRate)
                }

            })

       
    },

    totalStaredUser: (artistId) => {
        return new Promise(async (resolve, reject) => {
            let artistStar = await db.get().collection(collection.STAR_COLLECTION).findOne({ artist: objectId(artistId) })
            if (artistStar) {
                let staredUser = artistStar.user.length
                resolve(staredUser)
            } else {
                let staredUser = 0
                resolve(staredUser)
            }

        })

    },

    getUnvalidProductCount: (artistId) => {
        let pending = 'Pending'
        let edited = 'Edited'
        let NotApprove = 'Not-Approve'

        return new Promise(async (resolve, reject) => {
            let artistDetails = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: objectId(artistId) })
            let ArID = artistDetails.ArId
            let pendingCount = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments({ ArId: ArID, Status: pending })
            let editedCount = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments({ ArId: ArID, Status: edited })
            let notApproveCount = await db.get().collection(collection.UNVALID_PRODUCTS_COLLECTION).countDocuments({ ArId: ArID, Status: NotApprove })
            let totalunvalidCount = pendingCount + editedCount + notApproveCount
            let a = String(totalunvalidCount).substring(0, 6)
            let starRate = parseFloat(a.replace(',', '.').replace(' ', ''))
            let unvalidDetails = {
                pending: pendingCount,
                edited: editedCount,
                notApprove: notApproveCount,
                totalnuvalid: totalunvalidCount
            }

            resolve(unvalidDetails)
        })
    },

    getCounfirmedCount: (artistId) => {
        let Sales = 'For Sales'
        let Drowing = 'For Drowing'

        return new Promise(async (resolve, reject) => {
            let artistDetails = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: objectId(artistId) })
            let ArID = artistDetails.ArId
            let salesCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ ArId: ArID, Category: Sales })
            let drowingCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ ArId: ArID, Category: Drowing })
            let confirmedCount = salesCount + drowingCount
            let a = salesCount * (100 / confirmedCount)
            let x = drowingCount * (100 / confirmedCount)

            let b = String(a).substring(0, 5)
            let c = parseFloat(b.replace(',', '0', '.').replace(' ', '', ''))
            let salesPercent = c != NaN ? c : 0

            let y = String(x).substring(0, 5)
            let z = parseFloat(y.replace(',', '0', '.').replace(' ', '', ''))
            let drowingPercent = z != NaN ? z : 0

            let confirmedDetails = {
                sales: salesCount,
                drowing: drowingCount,
                totalConfirmed: confirmedCount,
                salesPercent: salesPercent,
                drowingPercent: drowingPercent
            }
            resolve(confirmedDetails)

        })

    },

    // gerOrdersCount:(artistId)=>{
    //     return new Promise(async(resolve, reject) => {
    //         let artistDetails = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: objectId(artistId) })
    //         let ArID = artistDetails.ArId
    //         let salesCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //             {

    //             }
    //         ])

    //         console.log('ArId',salesCount)
    //     })

    // }














}