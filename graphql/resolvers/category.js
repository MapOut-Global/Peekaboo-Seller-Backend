const Category = require("../../models/category") 
const Product = require("../../models/product") 
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

module.exports = {
  categories: async (args, req) =>  {
     
    try {
      let { parentIds, userId } = args;
      var searchById = [];
      for(const [key, val] of Object.entries(parentIds)) {
        searchById.push(val._id);
      }  
      let productList = null
      if(userId != null && userId != '0'){
        productList = await Product.find( { userId: new ObjectId(userId)});
      } 
      const categoriesFetched = await Category.find({parent_id : { $in : searchById}, status:true}); 
      const subcategoriesFetched = await Category.find({parent_id : { $ne : "0"}, status:true}); 
      let categoryList = categoriesFetched.map(category => {
        var subCatArr = [];
        mainProductCount = 0;
        subcategoriesFetched.map( subCat => {
          if(subCat.parent_id == category._id){
            var productCount = 0;
            if(productList !== null){ 
              productList.map( product => {
                product.sub_categories.map( pSubCat => {
                  if(pSubCat._id === subCat._id.toString()){
                    productCount++; 
                  }
                })
              })
            } 
            subCat.product_count = productCount;
            subCatArr.push(subCat);
          }
        });
        if(productList !== null){ 
          productList.map( product => {
            product.categories.map( pCat => {
              if(pCat._id === category._id.toString()){
                mainProductCount++; 
              }
            })
          })
        } 
        return {
          ...category._doc,
          _id: category.id,
          product_count: mainProductCount,
          sub_category: subCatArr,
          createdAt: new Date(category._doc.createdAt).toISOString(),
        }
      }) 
      return { categoryList: categoryList, responseStatus: {status: true, message: "Category fetched"}} 
    } catch (error) {
      throw error
    }
  }, 

  addCategory: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { name, parent_id, userId } = args; 
      var status = false;
      const newCategories = new Category({
        name,
        parent_id,
        status
      });
      await newCategories.save(); 
      return { categoryData: newCategories._doc, responseStatus : {status: true, message: "Category added successfully"} }  
    } catch (error) {
      throw error
    }
  }
}