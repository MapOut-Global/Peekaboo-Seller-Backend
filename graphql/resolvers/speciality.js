const Speciality = require("../../models/speciality") 
const { authorizationFunction } = require('../checkCognitoToken.js'); 

module.exports = {
  specialities: async (args, req) =>  {
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { type } = args;
      var typeArr = type.split(","); 
      const specialitiesFetched = await Speciality.find({type:{ $in : typeArr}, status:true});
      return specialitiesFetched.map(speciality => {
        return {
          ...speciality._doc,
          _id: speciality.id,
          createdAt: new Date(speciality._doc.createdAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  }, 
}