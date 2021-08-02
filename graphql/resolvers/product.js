const Product = require("../../models/product")  
const aws = require('aws-sdk');
const path = require('path');
const util = require('util')
var ObjectId = require('mongoose').Types.ObjectId; 

aws.config.update({
  secretAccessKey:'yozM9l4734aDNxi4MpCVmAo4k2kbdvr9Tx8yzAud',
  accessKeyId:'AKIAUV3FFSC7JRCJM25R',
  region:'us-west-2'
});
const s3 = new aws.S3();

module.exports = {
  addProduct: async args =>  {
    try {
      let { name, description, categories, sub_categories, cuisines, dietary_need, product_image, packaging_price, product_availibility, userId, delivery_details, stock, discount_details } = args.productData;
      
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
          const newSpeciality = new Speciality({
            name,
            type,
            status
          });
          await newSpeciality.save(); 
          cuisines[key]['_id'] = newSpeciality._doc._id.toString();
        }
      } 

      for(const [key, val] of Object.entries(dietary_need)) {
        if(val._id === undefined){
          let status = false;
          let type = "dietary_need";
          let name = val.name;
          const newSpeciality = new Speciality({
            name,
            type,
            status
          });
          await newSpeciality.save(); 
          dietary_need[key]['_id'] = newSpeciality._doc._id.toString();
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
      } 

      const newProduct = new Product({
        name, description, categories, product_image_url, sub_categories, cuisines, dietary_need, packaging_price, product_availibility, userId, delivery_details, stock, discount_details
      });
      const productData = await newProduct.save();
      console.log(productData);
      return { productData: productData._doc, responseStatus : {status: true, message: "Product added successfully"} }  
    } catch (error) {
      throw error
    }
  }, 

  products: async args =>  {
    try {
      let { categoryId, userId, subcategoryId} = args 
      const productList = await Product.find({userId:new ObjectId(userId)});
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
  }
}