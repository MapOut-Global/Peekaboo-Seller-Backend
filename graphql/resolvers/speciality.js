const Speciality = require("../../models/speciality") 

module.exports = {
  specialities: async () => {
    try {
      const specialitiesFetched = await Speciality.find()
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