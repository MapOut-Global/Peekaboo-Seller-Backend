const Speciality = require("../../models/speciality") 

module.exports = {
  specialities: async args =>  {
    try {
      let { type } = args;
      const specialitiesFetched = await Speciality.find({type:type, status:true});
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