const Product = require("../../models/product") 

module.exports = {
  addProduct: async args =>  {
    try {
      let { name, description, categories, sub_categories, cuisines, dietary_need, packaging_price, product_availibility, userId, delivery_details, stock, discount_details } = args.productData;
      
      console.log(packaging_price);
      console.log(product_availibility);
      console.log(delivery_details);
      console.log(discount_details);
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
      const newProduct = new Product({
        name, description, categories, sub_categories, cuisines, dietary_need, packaging_price, product_availibility, userId, delivery_details, stock, discount_details
      });
      const productData = await newProduct.save();
      console.log(productData);
      return { productData: productData._doc, responseStatus : {status: true, message: "Sign up successfully"} }  
    } catch (error) {
      throw error
    }
  }, 
}