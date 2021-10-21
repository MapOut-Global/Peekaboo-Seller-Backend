const Post = require("../../models/post") 
const Product = require("../../models/product") 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader'); 
const cdnUrl = 'https://d24bvnb428s3x7.cloudfront.net/';

module.exports = {  
  addPost: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { description, productIds, userId, facebook_flag, instagram_flag, watsapp_flag, image, _id } = args.postData;  
      var checkPostOldImage = {};
      if(_id !== undefined ){
        var checkPostOldImage = await Post.findOne({_id: _id}).exec();   
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
        params.Key = `post_images/${timestamp}${file_extension}`;

        let upload = util.promisify(s3.upload.bind(s3));

        let result = await upload(params).catch(console.log);    
        image = {};
        image.Location = cdnUrl + result.Key;
        image.Key = result.Key; 
        if(file_extension == ".mp4"){  
          image.type = "video";  
          image.thumbnail = cdnUrl + 'thumbnails/post_images/' + timestamp + "-0.jpg";
        }else{
          image.type = "image";  
        }
        if(checkPostOldImage.image !== null && checkPostOldImage.image !== undefined && checkPostOldImage.image.Key !== undefined){
          oldKey = checkPostOldImage.image.Key;
          const deleteParams = {
              Bucket:"peekaboo2", 
              Key:oldKey, 
          };
          let removeObject = util.promisify(s3.deleteObject.bind(s3));
          await removeObject(deleteParams).catch(console.log); 
        } 
      }else{
        if(checkPostOldImage.image !== "" ){
          image = checkPostOldImage.image; 
        }
      }
      console.log(checkPostOldImage.length);
    /************************* Upload avtar on S3 Server ********************/ 
      if(checkPostOldImage.length > 0){
        await Post.findOneAndUpdate(
          {_id: _id},
          {
            description: description,
            productIds: productIds,
            facebook_flag: facebook_flag,
            instagram_flag: instagram_flag,
            watsapp_flag: watsapp_flag,
            image: image,
            userId: userId
          },
          {
            new: true,
            upsert: true
          }
        );   
        let postData = await Post.findOne(
          {
            _id: _id
          }
        ).exec();
        return { postData: postData, responseStatus : {status: true, message: "Post added successfully"} }  
      }else{
        const newPost = new Post({
          description,
          productIds,
          facebook_flag,
          instagram_flag,
          watsapp_flag,
          image,
          userId
        });
        await newPost.save(); 
        return { postData: newPost._doc, responseStatus : {status: true, message: "Post added successfully"} }  
      }
    } catch (error) {
      throw error
    }
  },

  posts: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { userId } = args; 
      const postFetched = await Post.find({userId : userId}); 
      return postFetched.map(post => {
        productData = [];
        post.productIds.map( (productId, productKey) => {
          let product =  Product.findById(productId);
          productData.push(product);
        })
        return {
          ...post._doc,
          _id: post.id,
          productData: productData,
          createdAt: new Date(post._doc.createdAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  },

  removePost: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try {
      let { userId, postId } = args 
      const postData = await Post.findById(postId); 
      if(postData.userId == userId){
        oldKey = postData.image.Key;
        const deleteParams = {
            Bucket:"peekaboo2", 
            Key:oldKey, 
        };
        let removeObject = util.promisify(s3.deleteObject.bind(s3)); 
        await removeObject(deleteParams).catch(console.log); 

        await Post.findByIdAndDelete(postId);
        return { status: true, message: "Post has been removed"}
      }else{
        return { status: false, message: "Invalid User ID"}
      }
    } catch (error) {
      throw error
    }

  }
}