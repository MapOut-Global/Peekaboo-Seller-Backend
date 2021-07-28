const Category = require("../../models/category") 

module.exports = {
  categories: async args =>  {
    try {
      let { parent_id } = args;
      console.log(parent_id);
      const categoriesFetched = await Category.find({parent_id:parent_id, status:true});
      console.log(categoriesFetched);
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