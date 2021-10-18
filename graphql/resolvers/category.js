const Category = require("../../models/category") 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

module.exports = {
  categories: async (args, req) =>  {
     
    try {
      let { parentIds } = args;
      var searchById = [];
      for(const [key, val] of Object.entries(parentIds)) {
        searchById.push(val._id);
      }  
      const categoriesFetched = await Category.find({parent_id : { $in : searchById}, status:true}); 
      const subcategoriesFetched = await Category.find({parent_id : { $ne : "0"}, status:true}); 
      let categoryList = categoriesFetched.map(category => {
        var subCatArr = [];
        subcategoriesFetched.map( subCat => {
          if(subCat.parent_id == category._id){
            subCatArr.push(subCat);
          }
        })
        return {
          ...category._doc,
          _id: category.id,
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