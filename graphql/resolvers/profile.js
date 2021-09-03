const User = require("../../models/user")  
const Profile = require("../../models/profile") 
const Speciality = require("../../models/speciality") 
const Product = require("../../models/product") 
const Class = require("../../models/class") 
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken'); 
 
const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader');   
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
      var { flags, shop_name, aboutme, phone, payment_details, avatar, hoursOfOperation, messageForMe, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency, attachments, latitude, longitude, zipcode } = args.profile;
      var { full_name} = args.user;
      var checkProfileOldAvtar = await Profile.findOne({userId: userId}).exec();   

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


      /************************* Upload avtar on S3 Server ********************/
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
          Location: 'https://d24bvnb428s3x7.cloudfront.net/' + result.Key, 
          Key: result.Key, 
          thumbnail: 'https://d24bvnb428s3x7.cloudfront.net/thumbnails/kitchen_tours' + timestamp + "-0.jpg", 
        }; 
        kitchenTourFile = Object.create(kitchenTourFile_url_arr);
        kitchenTourFile.Location = 'https://d24bvnb428s3x7.cloudfront.net/' + result.Key;
        kitchenTourFile.Key = result.Key;  
        kitchenTourFile.thumbnail = 'https://d24bvnb428s3x7.cloudfront.net/thumbnails/kitchen_tours/' + timestamp + "-0.jpg";  
        
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
    /************************* Upload avtar on S3 Server ********************/

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
      User.findOneAndUpdate(
        { _id: userId },
        {
          full_name: full_name
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
          payment_details: payment_details,
          aboutme: aboutme, 
          hoursOfOperation: hoursOfOperation, 
          heading: heading,
          availibility: availibility, 
          address: address,
          delivery: delivery,
          userId: userId,
          speciality: speciality,
          kitchenTourFile: kitchenTourFile,
          currency: currency,
          avatar_url: avatar_url,
          attachments: attachmentArr,
          latitude:latitude,
          longitude:longitude,
          zipcode: zipcode,
          messageForMe: messageForMe
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
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { userId } = args;
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
    var { flags, shop_name, phone, aboutme, payment_details, hoursOfOperation, messageForMe, heading, availibility, address, delivery, speciality, kitchenTourFile, currency, avatar_url, attachments } = cookProfile;
    let productList = await Product.find({userId:new ObjectId(userId)});  
    var categoriesArr = [];
    var subCategoryArr = [];
    var addeddSubCatId = [];
    var sKey = 0;
    productList.map((product, pKey)  => {
      product.sub_categories.map( (pSubCategory) => { 
        if(addeddSubCatId.indexOf(pSubCategory._id) == -1){ 
          subCategoryArr[sKey] = pSubCategory;
          addeddSubCatId.push(pSubCategory._id);
          sKey++;
        } 
      });
    }); 

    classes = await Class.find({userId:new ObjectId(userId)});   

    user = await User.findOne(
      {
        _id: userId
      }
    ).exec(); 
    cookProfile.categories.map( (category, key) => { 
      categoriesArr[key] = category; 
      categoriesArr[key]['sub_category'] = [];
      var subCatKey = 0;
      subCategoryArr.map ( (subCategory) => { 
        if(subCategory.parent_id == category._id){ 
          categoriesArr[key]['sub_category'][subCatKey] = subCategory;
          categoriesArr[key]['sub_category'][subCatKey]['productList'] = [];
          var productKey = 0;
          productList.map((product)  => {
            product.sub_categories.map( (pSubCategory ) => {
              if(subCategory._id == pSubCategory._id){
                categoriesArr[key]['sub_category'][subCatKey]['productList'][productKey] = product;
                productKey++;
              }
            })
          }) 
          categoriesArr[key]['sub_category'][subCatKey]['product_count'] = productKey;
          subCatKey++;
        }
      }) 
    })  
    return {  
      userData: user,
      categories: categoriesArr,
      flags: flags, 
      shop_name: shop_name, 
      aboutme:aboutme, 
      hoursOfOperation:hoursOfOperation, 
      heading: heading, 
      availibility:availibility, 
      address:address, 
      delivery:delivery, 
      userId:userId, 
      speciality:speciality,
      kitchenTourFile:kitchenTourFile,
      currency:currency, 
      avatar_url: avatar_url,
      messageForMe: messageForMe,
      attachments: attachments, 
      classes: classes,
      payment_details: payment_details,
      phone: phone,
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
    return { status: true, message: "Attachment removed" };
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
    var categoryData = await Profile.findOne({ userId: userId }, 'categories').exec();
    for(const [key, val] of Object.entries(categoryData.categories)) {
      if(val._id == categoryId){  
        updateCat._id = val._id;
        updateCat.name = val.name;   
        updateCat.availibility_flag = status;
        categoryData.categories[key] = updateCat
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
      let { file } = await attachment;  
      let { createReadStream,  filename} = file;
      // read the data from the file.
      let fileStream = createReadStream();  
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

  stopRecievingOrder: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try{
      let { pause_status, pause_duration, pause_reason} = args;
    }catch (error){
      throw error;
    }
  }
}
 
