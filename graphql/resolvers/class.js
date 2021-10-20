const Class = require("../../models/class")  
const { authorizationFunction } = require('../checkCognitoToken.js'); 

const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader'); 
module.exports = {  
  addClass: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { description, userId, name, date, from, to, price, participant_limit, zoom_link, image, _id } = args.classData;  
      var checkClassOldImage = {};
      if(_id !== undefined ){
        var checkClassOldImage = await Class.findOne({_id: _id}).exec();   
      }
      
      /************************* Upload avtar on S3 Server ********************/
      if (image) { 
        let { file } = await image;  
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
        params.Key = `class_images/${timestamp}${file_extension}`;

        let upload = util.promisify(s3.upload.bind(s3));

        let result = await upload(params).catch(console.log);    
        image = {};
        image.Location = result.Location;
        image.Key = result.Key; 
        console.log(image); 
        if(checkClassOldImage.image !== null && checkClassOldImage.image !== undefined && checkClassOldImage.image.Key !== undefined){
          oldKey = checkClassOldImage.image.Key;
          const deleteParams = {
              Bucket:"peekaboo2", 
              Key:oldKey, 
          };
          let removeObject = util.promisify(s3.deleteObject.bind(s3));
          await removeObject(deleteParams).catch(console.log); 
        } 
      }else{
        if(checkClassOldImage.image !== "" ){
          image = checkClassOldImage.image; 
        }
      } 
    /************************* Upload avtar on S3 Server ********************/ 
      if(checkClassOldImage.length > 0){
        await Class.findOneAndUpdate(
          {_id: _id},
          {
            name:name,
            description: description,
            date: date,
            from: from,
            to: to,
            price: price,
            participant_limit: participant_limit,
            userId: userId,
            zoom_link: zoom_link,
            image: image
          },
          {
            new: true,
            upsert: true
          }
        );   
        let classData = await Class.findOne(
          {
            _id: _id
          }
        ).exec();
        return { classData: classData, responseStatus : {status: true, message: "Class added successfully"} }  
      }else{
        const newClass = new Class({
          name:name,
          description: description,
          date: date,
          from: from,
          to: to,
          price: price,
          participant_limit: participant_limit,
          userId: userId,
          zoom_link: zoom_link,
          image:image
        });
        await newClass.save(); 
        return { classData: newClass._doc, responseStatus : {status: true, message: "Class added successfully"} }  
      }
    } catch (error) {
      throw error
    }
  },

  classes: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { userId } = args; 
      const classFetched = await Class.find({userId : userId}); 
      return classFetched.map(classData => { 
        return {
          ...classData._doc,
          _id: classData.id, 
          createdAt: new Date(classData._doc.createdAt).toISOString(),
          date: new Date(classData._doc.date).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  },

  removeClass: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try {
      let { userId, classId } = args 
      const classData = await Class.findById(classId); 
      if(classData.userId == userId){
        oldKey = classData.image.Key;
        const deleteParams = {
            Bucket:"peekaboo2", 
            Key:oldKey, 
        };
        let removeObject = util.promisify(s3.deleteObject.bind(s3)); 
        await removeObject(deleteParams).catch(console.log); 

        await Class.findByIdAndDelete(classId);
        return { status: true, message: "Class has been removed"}
      }else{
        return { status: false, message: "Invalid User ID"}
      }
    } catch (error) {
      throw error
    }

  }
}