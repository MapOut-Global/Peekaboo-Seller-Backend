const Category = require("../../models/category") 

module.exports = {
  categories: async args =>  {
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
}