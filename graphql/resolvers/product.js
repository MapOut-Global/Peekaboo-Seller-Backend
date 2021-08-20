const Product = require("../../models/product")   
const Profile = require("../../models/profile")   
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader'); 

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
      let { name, description, categories, sub_categories, cuisines, dietary_need, product_image, packaging_price, product_availibility, userId, delivery_details, stock, discount_details, _id } = args.productData;
       
      var categoryData = await Profile.findOne({ userId: userId }, 'categories').exec();

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
          let status = false;
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
          let status = false;
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
          let status = false;
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

      if (product_image) { 
        let {promise, file, resolve, reject} = await product_image; 
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
        params.Key = `product_images/${timestamp}${file_extension}`;

        let upload = util.promisify(s3.upload.bind(s3));

        let result = await upload(params).catch(console.log);  
        product_image_url = result.Location;
        var product_image_arr = {
          Location: result.Location, 
          Key: result.Key, 
        }; 
        product_image_url = Object.create(product_image_arr);
        product_image_url.Location = result.Location;
        product_image_url.Key = result.Key; 
      }
      if(_id !== undefined && _id !== null){
        await Product.findOneAndUpdate(
          {_id: _id},
          {
            name: name,
            description: description,
            categories: categories,
            product_image_url: product_image_url,
            sub_categories: sub_categories,
            cuisines: cuisines,
            dietary_need: dietary_need,
            packaging_price: packaging_price,
            product_availibility: product_availibility,
            delivery_details: delivery_details,
            stock: stock,
            discount_details: discount_details,
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
        return { productData: productData, responseStatus : {status: true, message: "Product updated successfully"} }  
      }else{
        let status = true;
        const newProduct = new Product({
          name, description, categories, product_image_url, sub_categories, cuisines, dietary_need, packaging_price, 
          product_availibility, userId, delivery_details, stock, discount_details, status
        });
        let productData = await newProduct.save(); 
        return { productData: productData._doc, responseStatus : {status: true, message: "Product added successfully"} }  
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
      console.log(productList);
      
      return productList.map(product => { 
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
  }
}