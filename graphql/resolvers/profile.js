const User = require("../../models/user")  
const Profile = require("../../models/profile") 
const Speciality = require("../../models/speciality") 
const Product = require("../../models/product") 
const Class = require("../../models/class") 
const Follower = require("../../models/follower") 
const Like = require("../../models/like") 
const Review = require("../../models/review") 
const Order = require("../../models/order") 
const Post = require("../../models/post") 
const Category = require("../../models/category") 
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken'); 
 
const path = require('path');
const util = require('util') ;
const https = require('https')
const s3 =  require('../s3FileUploader');   
const cdnUrl = 'https://d24bvnb428s3x7.cloudfront.net/';
const nodemailer = require("nodemailer") 
module.exports = {  
  updateCookProfile: async (args, req) => { 
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      var { 
        flags, 
        shop_name, 
        aboutme, 
        about_shop,
        phone,  
        avatar,     
        address,  
        userId,  
        kitchenTourFile,  
        attachments,   
        zipcode,
        speciality
      } = args.profile;
      var { full_name } = args.user;
      var checkProfileOldAvtar = await Profile.findOne({userId: userId}).exec();   
      var geo_points = {
        "type": "Point",
        "coordinates": [
          address.longitude,
          address.latitude,
        ]
      }
      /************************* Upload avtar on S3 Server ********************/
        if (avatar) { 
          let { file } = await avatar;  
          let { createReadStream,  filename} = file;
          // read the data from the file.
          let fileStream = createReadStream();
          const params = {
              Bucket:"peekaboo2",
              Key:'',
              Body:'',
              ACL:'public-read'
          };
          // in case of an error, log it.
          fileStream.on("error", (error) => console.error(error));

          // set the body of the object as data to read from the file.
          params.Body = fileStream;
              // get the current time stamp.
          let timestamp = new Date().getTime();

          // get the file extension.
          let file_extension = path.extname(filename);

          // set the key as a combination of the folder name, timestamp, and the file extension of the object.
          params.Key = `cook_images/${timestamp}${file_extension}`;

          let upload = util.promisify(s3.upload.bind(s3));
          
          let result = await upload(params).catch(console.log);   
          var avatar_url_arr = {
            Location: result.Location, 
            Key: result.Key, 
          }; 
          avatar_url = {};
          avatar_url.Location = result.Location;
          avatar_url.Key = result.Key;  
          if(checkProfileOldAvtar !== null){
            if(checkProfileOldAvtar.avatar_url !== null && checkProfileOldAvtar.avatar_url !== undefined && checkProfileOldAvtar.avatar_url.Key !== undefined){
              oldKey = checkProfileOldAvtar.avatar_url.Key;
              const deleteParams = {
                  Bucket:"peekaboo2", 
                  Key:oldKey, 
              };
              let removeObject = util.promisify(s3.deleteObject.bind(s3));
              await removeObject(deleteParams).catch(console.log); 
            } 
          }
          
        }else{
          if(checkProfileOldAvtar.avatar_url !== "" ){
            avatar_url = checkProfileOldAvtar.avatar_url; 
          }
        }
      /************************* Upload avtar on S3 Server ********************/ 


      /************************* Upload kitchen tour file on S3 Server ********************/
        if (kitchenTourFile) { 
          let {file} = await kitchenTourFile; 
          let { createReadStream,  filename} = file;
          // read the data from the file.
          let fileStream = createReadStream();
          const params = {
              Bucket:"peekaboo2",
              Key:'',
              Body:'',
              ACL:'public-read'
          };
          // in case of an error, log it.
          fileStream.on("error", (error) => console.error(error));

          // set the body of the object as data to read from the file.
          params.Body = fileStream;
              // get the current time stamp.
          let timestamp = new Date().getTime();

          // get the file extension.
          let file_extension = path.extname(filename);

          // set the key as a combination of the folder name, timestamp, and the file extension of the object.
          params.Key = `kitchen_tours/${timestamp}${file_extension}`;

          let upload = util.promisify(s3.upload.bind(s3));

          let result = await upload(params).catch(console.log); 
          var kitchenTourFile_url_arr = {
            Location: cdnUrl + result.Key, 
            Key: result.Key, 
            thumbnail: cdnUrl + 'thumbnails/kitchen_tours/' + timestamp + "-0.jpg", 
          }; 
          kitchenTourFile = Object.create(kitchenTourFile_url_arr);
          kitchenTourFile.Location = cdnUrl + result.Key;
          kitchenTourFile.Key = result.Key;  
          kitchenTourFile.thumbnail = cdnUrl + 'thumbnails/kitchen_tours/' + timestamp + "-0.jpg";  
          
          if(checkProfileOldAvtar !== null){
            if(checkProfileOldAvtar.kitchenTourFile !== null && checkProfileOldAvtar.kitchenTourFile !== undefined && checkProfileOldAvtar.kitchenTourFile.Key !== undefined){
              oldKey = checkProfileOldAvtar.kitchenTourFile.Key;
              const deleteParams = {
                  Bucket:"peekaboo2", 
                  Key:oldKey, 
              };
              let removeObject = util.promisify(s3.deleteObject.bind(s3));
              await removeObject(deleteParams).catch(console.log); 

              thumbnailKey = 'thumbnails/' + checkProfileOldAvtar.kitchenTourFile.Key;
              const deleteThumbnailParams = {
                  Bucket:"peekaboo2", 
                  Key:thumbnailKey, 
              }; 
              await removeObject(deleteThumbnailParams).catch(console.log); 
            } 
          }
        }else{  
          if(checkProfileOldAvtar.kitchenTourFile !== "" ){
            kitchenTourFile = checkProfileOldAvtar.kitchenTourFile; 
          }
        }  
      /************************* Upload kitchen tour file on S3 Server ********************/

      /************************* Upload attachments on S3 Server ********************/
        if(checkProfileOldAvtar !== null){
          if(checkProfileOldAvtar.attachments !== null && checkProfileOldAvtar.attachments !== undefined){
            var attachmentArr = checkProfileOldAvtar.attachments; 
          }else{
            var attachmentArr = []; 
          } 
        }else{
          var attachmentArr = []; 
        } 
        if(attachments !== undefined && attachments.length > 0){
          totArrayLength = parseInt(attachments.length) + parseInt(attachmentArr.length);
          j=0;
          for(let i = attachmentArr.length; i < totArrayLength; i++){ 
            // Get that single file.
            let fileObj = await attachments[j];   
            let { createReadStream,  filename} = fileObj.file; 
            const params = {
                Bucket:"peekaboo2",
                Key:'',
                Body:'',
                ACL:'public-read'
            };
            let fileStream = createReadStream();
            // in case of an error, log it.
            fileStream.on("error", (error) => console.error(error));

            // set the body of the object as data to read from the file.
            params.Body = fileStream;
                // get the current time stamp.
            let timestamp = new Date().getTime();
            
            filename = filename.replace(" ", "-");
            // get the file extension.
            let file_extension = path.extname(filename);

            // set the key as a combination of the folder name, timestamp, and the file extension of the object.
            params.Key = `cook_attachments/${filename}`;

            let upload = util.promisify(s3.upload.bind(s3));

            let result = await upload(params).catch(console.log); 

            var attachment_url_arr = {
              Location: result.Location, 
              Key: result.Key, 
            }; 
            attachment_url = Object.create(attachment_url_arr);
            attachment_url.Location = result.Location;
            attachment_url.Key = result.Key; 
            attachmentArr[i] = attachment_url;
            j++;
          };
        } 
      /************************* Upload attachments on S3 Server ********************/
      
        await User.findOneAndUpdate(
        { _id: userId },
        {
          full_name: full_name,
          role_id: 2
        }
      );
      userData = await User.findById(userId).exec();  
      if(userData == null){
        return {  responseStatus : {status: false, message: "Invalid user id"}, userData : null, userId: userId }
      } 


      for(const [key, val] of Object.entries(speciality)) {
        if(val._id === undefined){
          let status = false;
          let type = "speciality";
          let name = val.name;
          let checkSpecialityExist = await Speciality.findOne(
            {
              name: name,
              type: "speciality"
            }
          ).exec();   
          if(!checkSpecialityExist){
            const newSpeciality = new Speciality({
              name,
              type,
              status
            });
            await newSpeciality.save(); 
            speciality[key]['_id'] = newSpeciality._doc._id.toString();
          }else{ 
            speciality[key]['_id'] = checkSpecialityExist._id.toString();
          } 
        }
      } 

      await Profile.findOneAndUpdate(
        {userId: userId},
        {
          flags: flags,
          shop_name: shop_name,
          phone: phone, 
          aboutme: aboutme,  
          address: address, 
          userId: userId, 
          kitchenTourFile: kitchenTourFile,
          about_shop: about_shop,
          avatar_url: avatar_url,
          attachments: attachmentArr, 
          zipcode: zipcode, 
          geo_points: geo_points,
          speciality: speciality, 
        },
        {
          new: true,
          upsert: true
        }
      ); 
      let cookProfile = await Profile.findOne(
        {
          userId: userId
        }
      ).exec();    
      return { 
        cookProfile: cookProfile,
        userData: userData, 
        responseStatus: {status: true, message: "Profile saved"}};
    } catch (error) {
      throw error
    }
  }, 

  updateCookOffer: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { categories, userId } = args;
    for(const [key, val] of Object.entries(categories)) {
      if(val._id === undefined){
        let status = false;
        let name = val.name;
        const newCategories = new Category({
          name,
          status
        });
        await newCategories.save(); 
        categories[key]['_id'] = newCategories._doc._id.toString();
      }
    } 
    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        categories: categories
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { responseStatus : {status: true, message: "Cook offer updated"} };
  },

  userProfile: async (args, req) => { 
    let { userId, cookId } = args;
    var customerId = userId;
    userId = cookId; 
    let cookProfile = await Profile.findOne(
      {
        userId: userId
      }
    ).exec(); 
    if(cookProfile === null){ 
      return {   
        userId:userId,  
        responseStatus: {status: true, message: "Profile saved"}
      };
    } 
 
    const reviewsFetched = await Review.find({userId: userId}, [], {sort: { sort_order: 1}}); 
    var customerIds = orderIds = productIds = [];
    reviewsFetched.map(review => { 
      customerIds.push(review.customerId);
      orderIds.push(review.orderId);
    });

    let customerData = await User.find({_id: {$in: customerIds}})
    let orderData = await Order.find({_id: {$in: orderIds}}) 
    orderData.map(order => { 
      order.order_details.map((item) => {
        productIds.push(item.productId);
      });
    });


    let reviewProductList = await Product.find({_id: { $in : productIds}})
    let followerList = await Follower.find({cookId: userId})
    let followingList = await Follower.find({userId: userId})
    var followerIds = followers = followerInfo = [];
    var followingIds = followings = followingInfo = [];
    followerList.map( follower => {
      followerIds.push(follower.userId);
    })

    followingList.map( following => {
      followingIds.push(following.cookId);
    })

    followerInformation = await User.find({ _id: {$in: followerIds}});
    followerImage = await Profile.find({ userId: {$in: followerIds}}, [ 'avatar_url', 'userId']); 
    followingInformation = await User.find({ _id: {$in: followingIds}});
    followingImage = await Profile.find({ userId: {$in: followingIds}}, [ 'avatar_url', 'userId']);  
    followerList.map( follower => {
      followerInformation.map( (followingUser, followingKey) => {
        if(followingUser._id.toString() === follower.userId.toString()){  
          followers[followingKey]['userData'] = followingUser;
        }
        followerImage.map( followingProfile => {
          if(followingProfile.userId.toString() === follower.userId.toString()){  
            followers[followingKey]['cookData'] = followingProfile;
          }
        })
      }) 
    });

    followingList.map( following => {
      followingInformation.map( (followerUser, followingKey) => {
        if(followerUser._id.toString() === following.cookId.toString()){  
          followings[followingKey]['userData'] = followerUser;
        }
        followingImage.map( followerProfile => {
          console.log(followerProfile);
          console.log(following);
          if(followerProfile.userId.toString() === following.cookId.toString()){  
            followings[followingKey]['cookData'] = followerProfile;
          }
        })
      }) 
    });

    var reviewList = reviewsFetched.map(review => {  
      customerArr = productArr = [];
      customerData.map(customer => {
        if(customer.id.toString() === review.customerId.toString()){
          customerArr = customer
        }
      });

      orderData.map(order => { 
        if(order.id.toString() === review.orderId.toString()){
          order.order_details.map((item) => {
            reviewProductList.map(product => {
              if(product.id.toString() === item.productId.toString()){
                productArr.push(product);
              }
            });
          });
        }
      }); 
      
      return {
        customerData: customerArr,
        productData: productArr,
        ...review._doc,
        _id: review.id, 
        createdAt: new Date(review._doc.createdAt).toISOString(), 
      }
    })
    let checkAlreadyFollowing = null;
    let myLikes = []
    if(customerId !== "0"){
      checkAlreadyFollowing = await Follower.countDocuments({userId: customerId, cookId: userId})
      myLikes = await Like.find({ userId: customerId}); 
    }
    
    if(checkAlreadyFollowing){
      is_following = true
    }else{
      is_following = false;
    }

    let productList = await Product.find({userId:new ObjectId(userId)});  
    var categoriesArr = [];
    var subCategoryArr = [];
    var addeddSubCatId = [];
    var sKey = 0;
    productList.map((product, pKey)  => {
      product.sub_categories.map( (pSubCategory) => { 
        if(addeddSubCatId.indexOf(pSubCategory._id) == -1){ 
          cookProfile.categories.map( (category, key) => { 
            if(category._id == pSubCategory._id.toString()){
              pSubCategory.availibility_flag = category.availibility_flag !== null ? category.availibility_flag : true;
            }
          })
          subCategoryArr[sKey] = pSubCategory;
          addeddSubCatId.push(pSubCategory._id);
          sKey++;
        } 
      });
    });  
    
    let classesArr = await Class.find({userId:new ObjectId(userId)});   
    let classes = classesArr.map( classObj => {
      let is_liked = false;
      myLikes.map( myLike => {
        if(myLike.type == 'class' && myLike.itemId == classObj._id.toString()){
          is_liked = true;
        }
      })
      return {
        ...classObj._doc,
        is_liked: is_liked
      }
    })
    
    user = await User.findOne(
      {
        _id: userId
      }
    ).exec(); 

    let postArr = await Post.find({userId:new ObjectId(userId)});  

    let postList = postArr.map( ( post ) => {
      let is_liked = false;
      myLikes.map( myLike => {
        if(myLike.type == 'post' && myLike.itemId == post._id.toString()){
          is_liked = true;
        }
      })
      let productData = [];
      post.productIds.map( postProduct => {
        productList.map( product => {
          if(product._id.toString() === postProduct._id){
            productData.push(product);
          }
        })
      })
      return {
        ...post._doc,
        is_liked: is_liked,
        full_name: user.full_name,
        avatar_url: cookProfile.avatar_url,
        productData: productData
      } 
    })
    var userCategory = cookProfile.categories; 

    cookProfile.categories.map( (category, key) => {   
      if(category.parent_id !== undefined && category.parent_id != null && category.parent_id != "0"){  
        return
      }  
      var mainProductCount = 0;
      
      if(productList !== null){ 
        productList.map( product => {
          product.categories.map( pCat => {
            if(pCat._id === category._id.toString()){
              mainProductCount++; 
            }
          })
        })
      }  
      if(mainProductCount == 0){
        return 
      }
      categoriesArr[key] = category;
      categoriesArr[key]['product_count'] = mainProductCount;
      categoriesArr[key]['sub_category'] = [];
      var subCatKey = 0;
      subCategoryArr.map ( (subCategory) => {  
        if(subCategory.parent_id == category._id){  
          if(!subCategory.availibility_flag && subCategory.availibility_flag !== null && subCategory.availibility_flag !== undefined){
            return;
          } 
          categoriesArr[key]['sub_category'][subCatKey] = subCategory;
          categoriesArr[key]['sub_category'][subCatKey]['availibility_flag'] = true;
          categoriesArr[key]['sub_category'][subCatKey]['productList'] = [];
          var productKey = 0;
          productList.map((product)  => {
            product.sub_categories.map( (pSubCategory ) => {
              if(subCategory._id == pSubCategory._id){
                categoriesArr[key]['sub_category'][subCatKey]['productList'][productKey] = product;
                let is_liked = false;
                myLikes.map( myLike => {
                  if(myLike.type == 'product' && myLike.itemId == product._id.toString()){
                    is_liked = true;
                  }
                })
                categoriesArr[key]['sub_category'][subCatKey]['productList'][productKey]['is_liked'] = is_liked;
                productKey++;
              }
            })
          }) 
          categoriesArr[key]['sub_category'][subCatKey]['product_count'] = productKey;
          subCatKey++;
        }
      }) 
    })   
    categoriesArr = categoriesArr.filter(function(val){if(val !== undefined)return val}); 
    var userCategoriesArr = []; 
    if(user.role_id === undefined || user.role_id === null){
      user.role_id = 2;
    }
     
    if(cookProfile.on_boarding === undefined || cookProfile.on_boarding === null){
      cookProfile.on_boarding = false;
    }  

    const weekDayArr = {
      "1": "Mon",
      "2": "Tue",
      "3": "Wed",
      "4": "Thu",
      "5": "Fri",
      "6": "Sat",
      "7": "Sun",
    };
    if(cookProfile.hoursOfOperation.length > 0){
      var workingsTime = [];
      cookProfile.hoursOfOperation.map( workingDetails => {
        var timingStr = "";
        timingStrArr = [];
        workingDetails.dayOfWeek.map( weekDay => {
          for(var i=1; i<=7; i++){
            if(weekDay.dayNumber == i){ 
              timingStrArr.push(weekDayArr[i]);
            }
          }
        })  
        timingStr = timingStrArr.join(", "); 
        
        var from = workingDetails.timeOfDay.from;
        var hours = Number(from.match(/^(\d+)/)[1]);
        var minutes = Number(from.match(/:(\d+)/)[1]);
        var AMPM = from.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes; 
        timingStr += " " + sHours + ":" + sMinutes;

        var to = workingDetails.timeOfDay.to;
        var endhours = Number(to.match(/^(\d+)/)[1]);
        var endminutes = Number(to.match(/:(\d+)/)[1]);
        var AMPM = to.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && endhours<12) endhours = endhours+12;
        if(AMPM == "AM" && endhours==12) endhours = endhours-12;
        var eHours = endhours.toString();
        var eMinutes = endminutes.toString();
        if(endhours<10) eHours = "0" + eHours;
        if(endminutes<10) eMinutes = "0" + eMinutes; 
        timingStr += " | " + eHours + ":" + eMinutes;
        var workingTempArr = {};
        workingTempArr['workings'] = timingStr;
        workingsTime.push(workingTempArr);
      })
    }

    cookProfile.workingTimings = workingsTime;
    cookProfile.classes = classes;
    cookProfile.posts = postList;
    cookProfile.reviews = reviewList;
    cookProfile.followers = followers;
    cookProfile.followings = followings;
    cookProfile.is_following = is_following;
    cookProfile.categories = categoriesArr;
    return {  
      userData: user,
      cookProfile: cookProfile, 
      responseStatus: {status: true, message: "Profile saved"}};
       
  },

  removeAttachment: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { userId, Key } = args;
    var attachmentData = await Profile.findOne({ userId: userId }, 'attachments').exec();
    for(const [key, val] of Object.entries(attachmentData.attachments)) {
      if(val.Key == Key){
        attachmentData.attachments.splice(key, 1);
          const deleteParams = {
            Bucket:"peekaboo2", 
            Key:Key, 
        };
        let removeObject = util.promisify(s3.deleteObject.bind(s3));
        await removeObject(deleteParams).catch(console.log); 
      }
    }
    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        attachments: attachmentData.attachments
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { responseStatus: {status: true, message: "Attachment removed"}, Key:Key };
  },

  updateUserCategoryFlag: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { userId, categoryId, status } = args;
    var updateCat = {};
    var statusUpdated = false;
    var categoryData = await Profile.findOne({ userId: userId }, 'categories').exec();
    var i = 0;
    for(const [key, val] of Object.entries(categoryData.categories)) {
      if(val._id == categoryId){  
        updateCat._id = val._id;
        updateCat.name = val.name;   
        if(val.parent_id !== undefined){
          updateCat.parent_id = val.parent_id;   
        } 
        updateCat.availibility_flag = status;
        categoryData.categories[key] = updateCat
        statusUpdated = true;
      }
      i++;
    }  

    if(!statusUpdated){ 
      let subCategoryData = await Category.findById(categoryId); 
      updateCat._id = subCategoryData._id;
      updateCat.name = subCategoryData.name;   
      updateCat.parent_id = subCategoryData.parent_id;   
      updateCat.availibility_flag = status;
      categoryData.categories[i] = updateCat
    }
    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        categories: categoryData.categories
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { responseStatus: {status: true, message: "Category flag updated"}, categories: categoryData.categories };
  }, 

  removeCategory: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { userId, categoryId } = args;
    var categoryData = await Profile.findOne({ userId: userId }, 'categories').exec();
    for(const [key, val] of Object.entries(categoryData.categories)) {
      if(val._id == categoryId){
        categoryData.categories.splice(key, 1); 
      }
    }
    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        categories: categoryData.categories
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { status: true, message: "Category removed" };
  },

  submitSupportTicket: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let  { attachment, problem, userId, description} = args.support;

      if(attachment){
        let { file } = await attachment;  
        let { createReadStream,  filename} = file;
        // read the data from the file.
        var fileStream = createReadStream();  
      }else{
        var fileStraem = null;
      }
      
      let user = await User.findById(userId);
      const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: "info@knowledgly.com",
          pass: "knowledgly@2020",
        },
      });
              // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Peekaboo" <info@peekaboo.com>', // sender address
        to: "bharat.mapout@gmail.com", // list of receivers
        subject: "Support request from Cook on Peekaboo", // Subject line
        attachments: [
          {
            filename: filename,
            content: fileStream
          }
        ],
        text: "New support request on Peekaboo. Check below ", // plain text body
        html: "Dear Admin<br/><br/>Cook has submitted new support ticket on Peekaboo. Please check details below :<br/><br/>Name: "+user.full_name+ "<br/>Email: "+user.email+ "<br/>Problem: "+problem+ "<br/>Detail: "+description+ "<br/>", 
      }); 
      return { responseStatus : {status: true, message: "Support submitted successfully"} };
    } catch(error) {

    }
  },

  shopPolicy: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try{
      let { shop_policy, userId} = args;
      on_boarding = true;
      await Profile.findOneAndUpdate(
        {userId: userId},
        {
          shop_policy: shop_policy,
          on_boarding: on_boarding
        },
        {
          new: true,
          upsert: true
        }
      ); 
      return { status: true, message: "Shop Policy updated" };
    }catch (error){
      throw error;
    }
  },

  operatingDetails: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try{
      let { operating_details, userId, hoursOfOperation} = args;
      await Profile.findOneAndUpdate(
        {userId: userId},
        {
          operating_details: operating_details ,
          hoursOfOperation: hoursOfOperation
        },
        {
          new: true,
          upsert: true
        }
      ); 
      return { status: true, message: "Operating details updated" };
    }catch (error){
      return { responseStatus : {status: false, message: error.message} }  
    }
  }, 

  updateKitchenTourFile: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try{
      let { kitchenTourFile, userId } = args;

      var checkProfileOldAvtar = await Profile.findOne({userId: userId}).exec();   
      /************************* Upload kitchen tour file on S3 Server ********************/
      if (kitchenTourFile) { 
        let {file} = await kitchenTourFile; 
        let { createReadStream,  filename} = file;
        // read the data from the file.
        let fileStream = createReadStream();
        const params = {
            Bucket:"peekaboo2",
            Key:'',
            Body:'',
            ACL:'public-read'
        };
        // in case of an error, log it.
        fileStream.on("error", (error) => console.error(error));

        // set the body of the object as data to read from the file.
        params.Body = fileStream;
            // get the current time stamp.
        let timestamp = new Date().getTime();

        // get the file extension.
        let file_extension = path.extname(filename);

        // set the key as a combination of the folder name, timestamp, and the file extension of the object.
        params.Key = `kitchen_tours/${timestamp}${file_extension}`;

        let upload = util.promisify(s3.upload.bind(s3));

        let result = await upload(params).catch(console.log); 
        var kitchenTourFile_url_arr = {
          Location: cdnUrl + result.Key, 
          Key: result.Key, 
          thumbnail: cdnUrl + 'thumbnails/kitchen_tours/' + timestamp + "-0.jpg", 
        }; 
        kitchenTourFile = Object.create(kitchenTourFile_url_arr);
        kitchenTourFile.Location = cdnUrl + result.Key;
        kitchenTourFile.Key = result.Key;  
        kitchenTourFile.thumbnail = cdnUrl + 'thumbnails/kitchen_tours/' + timestamp + "-0.jpg";  
        
        if(checkProfileOldAvtar !== null){
          if(checkProfileOldAvtar.kitchenTourFile !== null && checkProfileOldAvtar.kitchenTourFile !== undefined && checkProfileOldAvtar.kitchenTourFile.Key !== undefined){
            oldKey = checkProfileOldAvtar.kitchenTourFile.Key;
            const deleteParams = {
                Bucket:"peekaboo2", 
                Key:oldKey, 
            };
            let removeObject = util.promisify(s3.deleteObject.bind(s3));
            await removeObject(deleteParams).catch(console.log); 

            thumbnailKey = 'thumbnails/' + checkProfileOldAvtar.kitchenTourFile.Key;
            const deleteThumbnailParams = {
                Bucket:"peekaboo2", 
                Key:thumbnailKey, 
            }; 
            await removeObject(deleteThumbnailParams).catch(console.log); 
          } 
        }
      }else{  
        if(checkProfileOldAvtar.kitchenTourFile !== "" ){
          kitchenTourFile = checkProfileOldAvtar.kitchenTourFile; 
        }
      }  
    /************************* Upload kitchen tour file on S3 Server ********************/

    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        kitchenTourFile: kitchenTourFile,
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { status: true, message: "Kitchen tour updated successfully"} 
    }catch (error){
      return { status: false, message: error.message} 
    }
  },
}
 
