const User = require("../../models/user") 
const OtpVerification = require("../../models/otp_verification") 
const Profile = require("../../models/profile") 
const Speciality = require("../../models/speciality")  

const CognitoExpress = require("cognito-express") 
//const fileUpload = require("../fileuploader/uploader") 
const { GraphQLUpload } = require('graphql-upload');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Aws = require('aws-sdk');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const poolData = {
  UserPoolId: 'eu-west-2_SuZiAI3hl', // Your user pool id here
  ClientId: '6t8n8rlmb4tn1omfuvlr2rirt4', // Your client id here
};
const pool_region = 'eu-west-2';
module.exports = { 
  signUp: async args => { 
      let { full_name, email, password, phone } = args.user  
      const user = new User({
        full_name,
        email, 
        phone
      }) 
      var userPool = new CognitoUserPool(poolData); 
      var attributeList = [];   

      var dataEmail = {
        Name: 'email',
        Value: email,
      };
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
      attributeList.push(attributeEmail);
      try {  
        let result = await asyncSignUp(userPool, email, password, attributeList); 
        if(result !== undefined){
          var authenticationData = {
            Username: email,
            Password: password,
          };
          var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
            authenticationData
          ); 
  
          var userData = {
            Username: email,
            Pool: userPool,
          };
          var cognitoUserLogin = new AmazonCognitoIdentity.CognitoUser(userData);
          let resultLogin = await asyncAuthenticateUser(cognitoUserLogin, authenticationDetails); 
          var accessToken = resultLogin.getAccessToken().getJwtToken(); 
          var refreshToken = resultLogin.getRefreshToken().getToken();  
  
          const newUser = await user.save();
          return { userData: newUser._doc, token:accessToken, refreshToken: refreshToken, responseStatus : {status: true, message: "Sign up successfully"} }  
        }
        
      } catch (error) {
        throw error
      } 
  },
  
  updateCookProfile: async (args, req) => {
    try {    
      let checkToken = await ValidateToken(req.headers.accesstoken);
      console.log(checkToken);
      if(!checkToken){ 
        return { status: 403, message: "Invalid token"}
      }
      var { flags, aboutme, hoursOfOperation, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency } = args.profile;
      /*let { filename, mimetype, createReadStream } = await avatar.file; 
      fileUpload({ filename, stream: createReadStream() }) */
      userData = await User.findById(userId).exec(); 
      if(userData == null){
        return {  responseStatus : {status: false, message: "Invalid user id"}, userData : null, userId: userId }
      }
      for(const [key, val] of Object.entries(speciality)) {
        if(val._id === undefined){
          let status = false;
          let type = "speciality";
          let name = val.name;
          const newSpeciality = new Speciality({
            name,
            type,
            status
          });
          await newSpeciality.save();
          console.log(newSpeciality._doc._id);
          speciality[key]['_id'] = newSpeciality._doc._id.toString();
        }
      } 
      let cookProfileSave = await Profile.findOneAndUpdate(
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
      let cookProfile = await Profile.findOne(
        {
          userId: userId
        }
      ).exec();   
      var { flags, aboutme, hoursOfOperation, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency } = cookProfile;
      return { 
        flags: flags, 
        aboutme:aboutme, 
        hoursOfOperation:hoursOfOperation, 
        heading: heading, 
        availibility:availibility, 
        address:address, 
        delivery:delivery, 
        userId:userId, 
        speciality:speciality,
        kitchenTourFile:kitchenTourFile,
        currency:currency, 
        userData: userData, 
        responseStatus: {status: true, message: "Profile saved"}};
    } catch (error) {
      throw error
    }
  },

  login: async args => {
    const { email, password } = args.user
    var authenticationData = {
      Username: email,
      Password: password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
    ); 
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username: email,
      Pool: userPool,
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    user = User.findOne(
      {
        email: email
      }
    ).exec();
    try { 
      let result = await asyncAuthenticateUser(cognitoUser, authenticationDetails);
      if ('idToken' in result) {
        var accessToken = result.getAccessToken().getJwtToken(); 
        var refreshToken = result.getRefreshToken().getToken();  
        return { userData: user, token:accessToken, refreshToken: refreshToken, responseStatus : {status: true, message: "Login successfully"} }  
      } else {
        return {  responseStatus : {status: true, message: "Email sent successfully"} }
      } 
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
        return { responseStatus : {status: false, message: "Email already exists"} };
      }else{ 
        //let randomOtp = Math.floor(1000 + Math.random() * 9999);
        let otp = 9999; 
        await OtpVerification.findOneAndRemove(
          {
            email: email
          }
        );  
        const otpDoc = new OtpVerification({
          email,
          otp, 
        });
        await otpDoc.save();
        return { responseStatus : {status: true, message: "Email sent successfully"} };
      }
    } catch (error) {
      throw error
    }
  },

  verifyOtp: async args => {
    try {
      const { otp, email } = args.verify
      let checkUserOtp = await OtpVerification.countDocuments(
        {
          email: email,
          otp: otp
        }
      );  
      if(checkUserOtp){ 
        return { responseStatus : {status: true, message: "OTP verified"}};
      }else{  
        return { responseStatus : {status: false, message: "Invalid OTP"}};
      }
    } catch (error) {
      throw error
    }
  },

  renewJwtToken: async args => {
      try {
        const { refreshToken } = args; 
        
        const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken: refreshToken});

        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        const userData = {
            Username: "sample@gmail.com",
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        let response = await cognitoUser.refreshSession(RefreshToken, (err, session) => {
            if (err) {
                console.log(err);
            } else {
                let retObj = {
                    "access_token": session.accessToken.jwtToken,
                    "id_token": session.idToken.jwtToken,
                    "refresh_token": session.refreshToken.token,
                }
                console.log(retObj);
                return {  responseStatus: { status: true, message: "Token renews"}, token: session.accessToken.jwtToken, refreshToken: session.refreshToken.jwtToken }
            }
        });
        console.log(response)
        return response;
      } catch (error) {
        throw error
      }
  },

  forgetPassword: async args => {
    let { email } = args;
    let checkUserExist = await User.countDocuments(
      {
        email: email
      }
    ); 
    if(checkUserExist){ 
      try { 
        let result = await resetPassword(email);
        return { responseStatus : {status: true, message: "Please check your inbox for verification code"} };
      } catch (error) {
        throw error
      }
    }else{
      return { responseStatus : {status: false, message: "Email not found"} };
    }
  },

  resetPassword: async args => {
    let { email, verificationCode, newPassword } = args;
    let checkUserExist = await User.countDocuments(
      {
        email: email
      }
    ); 
    if(checkUserExist){ 
      try { 
        let result = await confirmPassword(email, verificationCode, newPassword );
        return { responseStatus : {status: true, message: "Password has been updated. Please login with new password."} };
      } catch (error) {
        throw error
      }
    }else{
      return { responseStatus : {status: false, message: "Email not found"} };
    }
  },

  fbLogin: async args => {
    let { fbAccessToken, full_name, email } = args;
    fbCognitoCredentials = new Aws.CognitoIdentityCredentials({
      IdentityPoolId: 'eu-west-2:6ad6f321-7376-4f32-b390-f5cc1957eed0',
      Logins: {
        'graph.facebook.com': fbAccessToken
      }
      // Obtain AWS credentials 
    });
    let fbCognitoDetails = await fbCognitoCredentials.get(function(){
      
    });
    console.log(fbCognitoDetails)
  },

  updateCookOffer: async args => {
    let { categories, userId } = args;
    for(const [key, val] of Object.entries(categories)) {
      if(val._id === undefined){
        let status = false;
        let name = val.name;
        const newCategories = new Category({
          name,
          status
        });
        await newCategories.save(); 
        categories[key]['_id'] = newCategories._doc._id.toString();
      }
    } 
    await Profile.findOneAndUpdate(
      {userId: userId},
      {
        categories: categories
      },
      {
        new: true,
        upsert: true
      }
    ); 
    return { responseStatus : {status: true, message: "Cook offer updated"} };
  }
}

function asyncAuthenticateUser(cognitoUser, cognitoAuthenticationDetails) {
  return new Promise(function(resolve, reject) {
    cognitoUser.authenticateUser(cognitoAuthenticationDetails, {
      onSuccess: resolve,
      onFailure: reject,
      newPasswordRequired: resolve
    })
  })
}

function asyncSignUp(userPool, email, password, attribute_list) {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attribute_list, null, (err, result) => {
      console.log('inside');
      if (err) {
        console.log(err.message);
        reject(err);
        return;
      }
      cognitoUser = result.user;
      resolve(cognitoUser)
    });
  });
}

function resetPassword(username) {
   
  // setup cognitoUser first
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: userPool
  });

  // call forgotPassword on cognitoUser
  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: function(result) {
          console.log(result)
          resolve();
        },
        onFailure: function(err) {
          reject(err);
        }
    }); 
  });
  
}

function confirmPassword(username, verificationCode, newPassword) {
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: userPool
  }); 
  return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(verificationCode, newPassword, {
          onFailure(err) { 
              reject(err);
          },
          onSuccess() {
              resolve();
          },
      });
  });
}

function ValidateToken(token) { 
  //Initializing CognitoExpress constructor
  const cognitoExpress = new CognitoExpress({
    region: "eu-west-2",
    cognitoUserPoolId: "eu-west-2_SuZiAI3hl",
    tokenUse: "access", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
  }); 
  return new Promise((resolve, reject) => {
      cognitoExpress.validate(token, function(err, response) {  
      //If API is not authenticated, Return 401 with error message. 
      if (err){
        reject(err);
        return;
      }  
      resolve();
    });
  });
}
