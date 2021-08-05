const Category = require("../../models/category") 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

module.exports = {
  categories: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { parentIds } = args;
      var searchById = [];
      for(const [key, val] of Object.entries(parentIds)) {
        searchById.push(val._id);
      }  
      const categoriesFetched = await Category.find({parent_id : { $in : searchById}, status:true}); 
      return categoriesFetched.map(category => {
        return {
          ...category._doc,
          _id: category.id,
          createdAt: new Date(category._doc.createdAt).toISOString(),
        }
      })
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
  },

  updateUserCategoryFlag: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
  }
}