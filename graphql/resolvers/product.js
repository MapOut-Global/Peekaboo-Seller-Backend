const Product = require("../../models/product")   
const Profile = require("../../models/profile")   
const Speciality = require("../../models/speciality")   
const Category = require("../../models/category")   
const Like = require("../../models/like")   
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader'); 
const cdnUrl = 'https://d24bvnb428s3x7.cloudfront.net/';

module.exports = {
  addProduct: async (args, req) =>  {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { 
        name,  
        description, 
        categories, 
        sub_categories, 
        cuisines, 
        dietary_need, 
        key_ingredients,
        allergens,
        mood_tags,
        product_image, 
        packaging_price, 
        product_availibility, 
        old_product_images,
        userId,    
        variation_details,
        discount_details,
        _id 
      } = args.productData; 
      var productImageArr = old_product_images; 

      var categoryData = await Profile.findOne({ userId: userId }, 'categories').exec();

      /* 
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
            catId = newCategories._doc._id.toString();
          }else{
            catId = val._id
          }
          categoryExist = false;

          for(const [profileKey, profileCat] of Object.entries(categoryData.categories)) {
            if(profileCat._id == catId){  
              categoryExist = true;
            }
          }  

          if(!categoryExist){
            categoryData.categories.push(categories[key]);
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
        for(const [key, val] of Object.entries(sub_categories)) {
          if(val._id === undefined){
            let status = true;
            let name = val.name;
            let parent_id = val.parent_id;
            const newSubCategories = new Category({
              name,
              parent_id,
              status
            });
            await newSubCategories.save(); 
            sub_categories[key]['_id'] = newSubCategories._doc._id.toString();
          }
        } 

        for(const [key, val] of Object.entries(cuisines)) {
          if(val._id === undefined){
            let status = true;
            let type = "cuisine";
            let name = val.name;
            let checkSpecialityExist = await Speciality.findOne(
              {
                name: name,
                type: "cuisine"
              }
            ).exec();   
            if(!checkSpecialityExist){
              const newSpeciality = new Speciality({
                name,
                type,
                status
              });
              await newSpeciality.save(); 
              cuisines[key]['_id'] = newSpeciality._doc._id.toString();
            }else{ 
              cuisines[key]['_id'] = checkSpecialityExist._id.toString();
            } 
          }
        } 

        for(const [key, val] of Object.entries(dietary_need)) {
          if(val._id === undefined){
            let status = true;
            let type = "dietary_need";
            let name = val.name;
            let checkSpecialityExist = await Speciality.findOne(
              {
                name: name,
                type: "dietary_need"
              }
            ).exec();   
            if(!checkSpecialityExist){
              const newSpeciality = new Speciality({
                name,
                type,
                status
              });
              await newSpeciality.save(); 
              dietary_need[key]['_id'] = newSpeciality._doc._id.toString();
            }else{ 
              dietary_need[key]['_id'] = checkSpecialityExist._id.toString();
            } 
          }
        }  

        for(const [key, val] of Object.entries(key_ingredients)) {
          if(val._id === undefined){
            let status = true;
            let type = "key_ingredients";
            let name = val.name;
            let checkSpecialityExist = await Speciality.findOne(
              {
                name: name,
                type: "key_ingredients"
              }
            ).exec();   
            if(!checkSpecialityExist){
              const newSpeciality = new Speciality({
                name,
                type,
                status
              });
              await newSpeciality.save(); 
              key_ingredients[key]['_id'] = newSpeciality._doc._id.toString();
            }else{ 
              key_ingredients[key]['_id'] = checkSpecialityExist._id.toString();
            } 
          }
        } 

        for(const [key, val] of Object.entries(allergens)) {
          if(val._id === undefined){
            let status = true;
            let type = "allergens";
            let name = val.name;
            let checkSpecialityExist = await Speciality.findOne(
              {
                name: name,
                type: "allergens"
              }
            ).exec();   
            if(!checkSpecialityExist){
              const newSpeciality = new Speciality({
                name,
                type,
                status
              });
              await newSpeciality.save(); 
              allergens[key]['_id'] = newSpeciality._doc._id.toString();
            }else{ 
              allergens[key]['_id'] = checkSpecialityExist._id.toString();
            } 
          }
        }  

        for(const [key, val] of Object.entries(mood_tags)) {
          if(val._id === undefined){
            let status = true;
            let type = "mood_tags";
            let name = val.name;
            let checkSpecialityExist = await Speciality.findOne(
              {
                name: name,
                type: "mood_tags"
              }
            ).exec();   
            if(!checkSpecialityExist){
              const newSpeciality = new Speciality({
                name,
                type,
                status
              });
              await newSpeciality.save(); 
              mood_tags[key]['_id'] = newSpeciality._doc._id.toString();
            }else{ 
              mood_tags[key]['_id'] = checkSpecialityExist._id.toString();
            } 
          }
        } 
        
      */
      var main_image_arr = [];
      if(product_image !== undefined && product_image.length > 0){
        totArrayLength = parseInt(product_image.length) + parseInt(productImageArr.length);
        j=0;
        for(let i = productImageArr.length; i < totArrayLength; i++){ 
          // Get that single file.
          let fileObj = await product_image[j];   
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
          var imageOrder = 1; 
          // set the key as a combination of the folder name, timestamp, and the file extension of the object.
          params.Key = `product_images/${timestamp}${file_extension}`;

          let upload = util.promisify(s3.upload.bind(s3));
          var message;
          let result = await upload(params).catch(console.log);  
          if(file_extension.toLowerCase() == ".mp4" || file_extension.toLowerCase() == ".mov"){
            var productImageArrObj = {
              Location: cdnUrl + result.Key, 
              Key: result.Key, 
              order: imageOrder, 
              type: "video",
              thumbnail: cdnUrl + 'thumbnails/product_images/' + timestamp + "-0.jpg", 
            }; 
            product_image_obj = Object.create(productImageArrObj);
            product_image_obj.Location = cdnUrl + result.Key;
            product_image_obj.Key = result.Key;  
            product_image_obj.order = imageOrder;  
            product_image_obj.type = "video";  
            product_image_obj.thumbnail = cdnUrl + 'thumbnails/product_images/' + timestamp + "-0.jpg";

            productImageArr.map( (imageArr, imageArrKey) => {
              if(imageArr.Key == filename){
                productImageArr[imageArrKey] =  product_image_obj; 
              }
            })  
          }else{
            var productImageArrObj = {
              Location: result.Location, 
              Key: result.Key, 
              type: "image",
              order: imageOrder, 
            }; 
            product_image_obj = Object.create(productImageArrObj);
            product_image_obj.Location = cdnUrl + result.Key;;
            product_image_obj.Key = result.Key;  
            product_image_obj.type = "image";  
            product_image_obj.order = imageOrder;   
            productImageArr.map( (imageArr, imageArrKey) => {
              if(imageArr.Key == filename){ 
                productImageArr[imageArrKey] =  product_image_obj; 
              }
            }) 
          } 
          j++;
        };
      }  
      productImageArr.map( (imageArr, imageArrKey) => {
        if(main_image_arr.length === 0 && imageArr.type == 'image'){
          var productImageArrObj = {
            Location: imageArr.Location, 
            Key: imageArr.Key,  
          }; 
          main_image_arr = Object.create(productImageArrObj);
          main_image_arr.Location = imageArr.Location;
          main_image_arr.Key = imageArr.Key;   
        } 
      })

      productImageArr.map( (imageArr, imageArrKey) => {
        if(main_image_arr.length === 0){
          var productImageArrObj = {
            Location: imageArr.Location, 
            Key: imageArr.Key,  
          }; 
          main_image_arr = Object.create(productImageArrObj);
          main_image_arr.Location = imageArr.thumbnail;;
          main_image_arr.Key = imageArr.Key;    
        } 
      }); 
      if(_id !== undefined && _id !== null){
        await Product.findOneAndUpdate(
          {_id: _id},
          {
            name: name,
            mood_tags: mood_tags,
            allergens: allergens,
            description: description,
            categories: categories,
            product_image_url: productImageArr,
            sub_categories: sub_categories,
            cuisines: cuisines,
            dietary_need: dietary_need,
            packaging_price: packaging_price,
            product_availibility: product_availibility,
            key_ingredients: key_ingredients, 
            variation_details: variation_details,
            discount_details: discount_details,
            main_image: main_image_arr
          },
          {
            new: true,
            upsert: true
          }
        );   
        let productData = await Product.findOne(
          {
            _id: _id
          }
        ).exec();
        return { productData: productData, responseStatus : {status: true, message: message} }  
      }else{
        let status = true;
        product_image_url = productImageArr;
        const newProduct = new Product({
          name, mood_tags, allergens, description, categories, product_image_url, sub_categories, 
          cuisines, dietary_need, packaging_price, 
          product_availibility, userId, key_ingredients, status,variation_details,
          main_image: main_image_arr, discount_details
        });
        let productData = await newProduct.save(); 
        return { productData: productData._doc, responseStatus : {status: true, message: message} }  
      }
      
      
    } catch (error) {
      throw error
    }
  }, 

  products: async (args, req) =>  {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { userId, categoryId, subcategoryId } = args 
      if((categoryId === undefined && subcategoryId == undefined) || (categoryId === null && subcategoryId == null)){
         productList = await Product.find({userId:new ObjectId(userId)}); 
      }else{
        if(subcategoryId === undefined || subcategoryId === null){
           productList = await Product.find({userId:new ObjectId(userId), 'categories._id': categoryId}); 
        }else{ 
           productList = await Product.find({userId:new ObjectId(userId), 'sub_categories._id': subcategoryId}); 
        }
      } 
      
      return productList.map(product => { 
        console.log(product.product_availibility);
        return {
          ...product._doc,
          _id: product.id,
          createdAt: new Date(product._doc.createdAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  },

  deleteProduct: async (args, req) =>  {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try {
      let { userId, productId } = args 
      const productData = await Product.findById(productId); 
      if(productData.userId == userId){
        oldKey = productData.product_image_url.Key;
        const deleteParams = {
            Bucket:"peekaboo2", 
            Key:oldKey, 
        };
        let removeObject = util.promisify(s3.deleteObject.bind(s3)); 
        await removeObject(deleteParams).catch(console.log); 

        await Product.findByIdAndDelete(productId);
        return { status: true, message: "Product has been removed"}
      }else{
        return { status: false, message: "Invalid User ID"}
      }
    } catch (error) {
      throw error
    }
  },  

  changeProductStatus: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }

    try {
      let { status, _id} = args;
      await Product.findOneAndUpdate(
        {_id: _id},
        {
          status: status,
        },
        {
          new: true,
          upsert: true
        }
      );   
      return { status: true, message: "Product status has been updated"}
    } catch (error) {
      throw error
    }
  },

  removeMedia: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    let { _id, Key } = args;
    var mediaData = await Product.findById(_id); 
    for(const [key, val] of Object.entries(mediaData.product_image_url)) {
      if(val.Key == Key){
        mediaData.product_image_url.splice(key, 1);
        const deleteParams = {
          Bucket:"peekaboo2", 
          Key:Key, 
        };
        let removeObject = util.promisify(s3.deleteObject.bind(s3));
        await removeObject(deleteParams).catch(console.log); 
      }
    }
    await Product.findOneAndUpdate(
      {_id: _id},
      {
        product_image_url: mediaData.product_image_url
      },
      {
        new: true,
        upsert: true
      }
    );  
    return { responseStatus: {status: true, message: "Media removed"}, Key:Key };
  },

  productDetail: async (args, req) => { 
    try{
      let { product_id, userId } = args;

      if(userId != "0"){
        checkLiked = await Like.countDocuments({ userId: userId, itemId: product_id, type: "product"});  
      }
      let productData = await Product.findById(product_id);  
      productData.is_liked =  checkLiked ? true : false;
      if(productData !== null){
        return { responseStatus: { status: true, message: "Product detail fetched"}, productData: productData}
      }else{
        return { responseStatus: { status: false, message: "Invalid Product ID"}}
      }
    } catch (error) {
      return { responseStatus : {status: false, message: "Invalid Product ID"} }  
    }
  }
}