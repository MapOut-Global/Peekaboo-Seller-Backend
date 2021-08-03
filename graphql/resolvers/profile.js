const User = require("../../models/user")  
const Profile = require("../../models/profile") 
const Speciality = require("../../models/speciality") 
const { authorizationFunction } = require('../checkCognitoToken.js'); 
 
const Aws = require('aws-sdk'); 
const path = require('path');
const util = require('util') 

Aws.config.update({
  secretAccessKey:'yozM9l4734aDNxi4MpCVmAo4k2kbdvr9Tx8yzAud',
  accessKeyId:'AKIAUV3FFSC7JRCJM25R',
  region:'us-west-2'
});
const s3 = new Aws.S3();
 
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
      var { flags, aboutme, avatar, hoursOfOperation, messageForMe, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency, attachments } = args.profile;
      var checkProfileOldAvtar = await Profile.findOne({userId: userId}).exec();   

      /************************* Upload avtar on S3 Server ********************/
        if (avatar) { 
          let {file} = await avatar; 
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
          avatar_url = Object.create(avatar_url_arr);
          avatar_url.Location = result.Location;
          avatar_url.Key = result.Key; 
          if(checkProfileOldAvtar.avatar_url !== null && checkProfileOldAvtar.avatar_url.Key !== undefined){
            console.log(checkProfileOldAvtar.avatar_url.Key);
            oldKey = checkProfileOldAvtar.avatar_url.Key;
            const deleteParams = {
                Bucket:"peekaboo2", 
                Key:oldKey, 
            };
            let removeObject = util.promisify(s3.deleteObject.bind(s3));
            await removeObject(deleteParams).catch(console.log); 
          } 
        }else{  
          if(checkProfileOldAvtar.avatar_url !== "" ){
            avatar_url = checkProfileOldAvtar.avatar_url; 
          }
        }  
      /************************* Upload avtar on S3 Server ********************/

      /************************* Upload attachments on S3 Server ********************/
        if(checkProfileOldAvtar.attachments !== null && checkProfileOldAvtar.attachments !== undefined){
          var attachmentArr = checkProfileOldAvtar.attachments; 
        }else{
          var attachmentArr = []; 
        }
        
        if(attachments !== undefined && attachments.length > 0){
          totArrayLength = parseInt(attachments.length) + parseInt(attachmentArr.length);
          for(let i = attachmentArr.length; i < totArrayLength; i++){ 
            // Get that single file.
            let fileObj = attachments[i];  
            let { createReadStream,  filename} = fileObj.file;
            console.log(fileObj);
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
  
            // get the file extension.
            let file_extension = path.extname(filename);
  
            // set the key as a combination of the folder name, timestamp, and the file extension of the object.
            params.Key = `cook_attachments/${timestamp}${file_extension}`;
  
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
          };
        } 
      /************************* Upload attachments on S3 Server ********************/
 
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
              name: name
            }
          ).exec();   
          if(checkSpecialityExist.length == 0){
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
      var { flags, aboutme, hoursOfOperation, messageForMe, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency, avatar_url, attachments } = cookProfile;
       
      return { 
        flags: flags, 
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
  }
}
 