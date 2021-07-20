/*const User = require("../../models/user") 
const Profile = require("../../models/profile") 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  users: async () => {
    try {
      const usersFetched = await User.find()
      return usersFetched.map(user => {
        return {
          ...user._doc,
          _id: user.id,
          createdAt: new Date(user._doc.createdAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  },

  signUp: async args => {
    try {
      let { first_name, last_name, middle_name, email, password, phone } = args.user 
      password = await bcrypt.hash(password, 10);
      const user = new User({
        first_name,
        last_name,
        middle_name,
        email,
        password,
        phone
      })
      const newUser = await user.save();
      jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      return { ...newUser._doc, _id: newUser.id, token:jwtToken }
    } catch (error) {
      throw error
    }
  },
  
  updateCookProfile: async args => {
    try { 
      let { flags, aboutme, preferences, hoursOfOperation, referal, type, availibility, advertisment, address, delivery, userId, speciality, kitchenTourFile, currency } = args.profile;
      const profile = new Profile();
      const cookProfile = await Profile.findOneAndUpdate(
        {userId: userId},
        {
          flags: flags,
          aboutme: aboutme,
          preferences: preferences,
          hoursOfOperation: hoursOfOperation,
          referal: referal,
          type: type,
          availibility: availibility,
          advertisment: advertisment,
          address: address,
          delivery: delivery,
          userId: userId,
          speciality: speciality,
          kitchenTourFile: kitchenTourFile,
          currency: currency,
        },
        {
          new: true,
          upsert: true
        }
      );
      console.log(cookProfile);
      return { ...cookProfile._doc}
    } catch (error) {
      throw error
    }
  },

  login: async args => {
    try {
      const { first_name, last_name, middle_name } = args.user
      const user = new User({
        first_name,
        last_name,
        middle_name
      })
      const newUser = await user.save()
      return { ...newUser._doc, _id: newUser.id }
    } catch (error) {
      throw error
    }
  },
}*/

const { mergeResolvers } = require('@graphql-tools/merge');
const userResolver = require('./user'); 
const specialityResolver = require('./speciality'); 

const resolvers = [
  userResolver, 
  specialityResolver
];

module.exports  = mergeResolvers(resolvers);