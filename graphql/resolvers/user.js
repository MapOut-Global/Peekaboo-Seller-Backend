const User = require("../../models/user") 
const Profile = require("../../models/profile") 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const superagent = require('superagent');
//const nodemailer = require('nodemailer');

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
      let { flags, aboutme, hoursOfOperation, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency } = args.profile;
      const profile = new Profile();
      const cookProfile = await Profile.findOneAndUpdate(
        {userId: userId},
        {
          flags: flags,
          aboutme: aboutme, 
          hoursOfOperation: hoursOfOperation, 
          heading: heading,
          availibility: availibility, 
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
      userData = await User.findById(userId).exec();
      console.log(userData);
      return { ...cookProfile._doc, userData: userData._doc}
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

  verifyEmail: async args => {
    try {
      const { email } = args.verify
      let checkUserExist = await User.countDocuments(
        {
          email: email
        }
      );  
      if(checkUserExist){ 
        return { status: 403, message: "Email already exists", otp: null};
      }else{ 
        //let randomOtp = Math.floor(1000 + Math.random() * 9999);
        let randomOtp = 9999; 
        return { status: 200, message: "Email sent successfully", otp: randomOtp};
      }
    } catch (error) {
      throw error
    }
  },
}