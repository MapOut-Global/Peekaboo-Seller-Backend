const User = require("../../models/user") 
const OtpVerification = require("../../models/otp_verification") 
const Profile = require("../../models/profile")  
const { authorizationFunction } = require('../checkCognitoToken.js'); 

const path = require('path');
const util = require('util') ;
const s3 =  require('../s3FileUploader');  
const nodemailer = require("nodemailer")  
const AmazonCognitoIdentity = require('amazon-cognito-identity-js'); 

const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const poolData = {
  UserPoolId: 'us-west-2_s968WrlYz', // Your user pool id here
  ClientId: '2dvr8f0s8egqrpii8a9udvpf3h', // Your client id here
};
const pool_region = 'us-west-2';
module.exports = { 
  signUp: async args => { 
      let { full_name, email, password, phone, avatar } = args.user  
      var login_type = "cognito"; 
      var userPool = new CognitoUserPool(poolData); 
      var attributeList = [];   

      var dataEmail = {
        Name: 'email',
        Value: email,
      };
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
      attributeList.push(attributeEmail);
      try {  
        /************************* Upload avtar on S3 Server ********************/
        var avatar_url = [];
        if (avatar !== undefined && avatar !== null) {
          let {file} = await avatar; 
          let { createReadStream,  filename} = file;
          // read the data from the file.
          let fileStream = createReadStream();
          const params = {
              Bucket:"peekaboo2",
              Key:'',
              Body:'',
              ACL:'public-read'
          };
          // in case of an error, log it.
          fileStream.on("error", (error) => { return {responseStatus : {status: false, message: error}} });

          // set the body of the object as data to read from the file.
          params.Body = fileStream;
              // get the current time stamp.
          let timestamp = new Date().getTime();

          // get the file extension.
          let file_extension = path.extname(filename);

          // set the key as a combination of the folder name, timestamp, and the file extension of the object.
          params.Key = `cook_images/${timestamp}${file_extension}`;

          let upload = util.promisify(s3.upload.bind(s3));

          let result = await upload(params).catch(console.log);   
          var avatar_url_arr = {
            Location: result.Location, 
            Key: result.Key, 
          }; 
          avatar_url = Object.create(avatar_url_arr);
          avatar_url.Location = result.Location;
          avatar_url.Key = result.Key;     
        }  
        
      /************************* Upload avtar on S3 Server ********************/
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
          var role_id = 3;
          const user = new User({
            full_name,
            email, 
            phone,
            login_type,
            role_id
          }) 
          
          const newUser = await user.save(); 
          userId = newUser._doc._id;
          const profile = new Profile({
            userId,
            avatar_url,  
          });
          const newProfile = await profile.save();
          
          profileData = newProfile._doc;
          return { userData: newUser._doc, cookProfile:profileData,  token:accessToken, refreshToken: refreshToken, responseStatus : {status: true, message: "Sign up successfully"} }  
        } 
      } catch (error) {
        return { responseStatus : {status: false, message: error.message} }  
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
    user = await User.findOne(
      {
        email: email
      }
    ).exec();
    if(user === null){
      return { responseStatus : {status: false, message: "Invalid email address"} }  
    }
    try { 
      let result = await asyncAuthenticateUser(cognitoUser, authenticationDetails);
      if ('idToken' in result) {
        var accessToken = result.getAccessToken().getJwtToken(); 
        var refreshToken = result.getRefreshToken().getToken();  
        var checkCookProfile = await Profile.findOne({userId: user._id}).exec();  
        if(user.role_id === undefined || user.role_id === null){
          user.role_id = 2;
        }
        if(checkCookProfile != null){
          if(checkCookProfile.on_boarding === undefined || checkCookProfile.on_boarding === null){
            checkCookProfile.on_boarding = false;
          }
        }
        
        return { 
          userData: user, 
          cookProfile: checkCookProfile,
          token:accessToken, 
          refreshToken: refreshToken, 
          responseStatus : {
            status: true, 
            message: "Login successfully"
          } 
        }  
      } else {
        return {  responseStatus : {status: true, message: "Email sent successfully"} }
      } 
    } catch (error) {
      return { responseStatus : {status: false, message: error.message} }  
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
        let otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
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

        const transporter = nodemailer.createTransport({
          host: "smtpout.secureserver.net",
          port: 587,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: "info@knowledgly.com",
            pass: "knowledgly@2020",
          },
        });
                // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Peekaboo" <info@peekaboo.com>', // sender address
          to: email, // list of receivers
          subject: "Verify your email on Peekaboo", // Subject line
          text: "Your one time password for Peekaboo is " + otp, // plain text body
          html: "Dear Sir / Madam<br/><br/>Your One Time Password(OTP) is :<br/><br/>"+otp, 
        });

        return { responseStatus : {status: true, message: "Email sent successfully"} };
      }
    } catch (error) {
      return { responseStatus : {status: false, message: error.message} } 
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
      return { responseStatus : {status: false, message: error.message} }  
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

        let result = await refreshTokenMethod(cognitoUser, RefreshToken);
        console.log(result);
        return {  responseStatus: { status: true, message: "Token renewed"}, token: result.accessToken.jwtToken, refreshToken: result.refreshToken.token }
 
      } catch (error) {
        return { responseStatus : {status: false, message: error.message} } 
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
        return { responseStatus : {status: false, message: error.message} }  
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
        return { responseStatus : {status: false, message: error.message} }  
      }
    }else{
      return { responseStatus : {status: false, message: "Email not found"} };
    }
  },

  socialLogin: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    
    try { 
      let { full_name, email, login_type } = args; 
      userData = await User.findOne(
        {
          email: email
        }
      ).exec(); 
      if (userData) { 
        var checkCookProfile = await Profile.findOne({userId: userData._id}).exec(); 
        if(userData.role_id === undefined || userData.role_id === null){
          userData.role_id = 3;
        }
        if(checkCookProfile !== null){
          if(checkCookProfile.on_boarding === undefined || checkCookProfile.on_boarding === null){
            checkCookProfile.on_boarding = false;
          }
        }
         
        return { 
          userData: userData, 
          cookProfile: checkCookProfile, 
          responseStatus : {
            status: true, 
            message: "Login successfully"
          } 
        }  
      } else {
        role_id = 3;
        const user = new User({
          full_name,
          email,
          login_type,
          role_id
        });
        const newUser = await user.save();
        cookProfile.userId = newUser._id;
        return { userData: newUser._doc, cookProfile: cookProfile , responseStatus : {status: true, message: "Login successfully"} } 
      } 
    } catch (error) {
       
    }
     
  }, 

  uploadFile: async args => {
    try{
    let { fileUpload } = args 
      if (fileUpload !== undefined) {
        let {file} = await fileUpload; 
        let { createReadStream,  filename} = file;
        // read the data from the file.
        let fileStream = createReadStream();
        const params = {
            Bucket:"peekaboo2",
            Key:'',
            Body:'',
            ACL:'public-read'
        };
        // in case of an error, log it.
        fileStream.on("error", (error) => { return {responseStatus : {status: false, message: error}} });

        // set the body of the object as data to read from the file.
        params.Body = fileStream;
            // get the current time stamp.
        let timestamp = new Date().getTime();

        // get the file extension.
        let file_extension = path.extname(filename);

        // set the key as a combination of the folder name, timestamp, and the file extension of the object.
        params.Key = `sample_iamges/${timestamp}${file_extension}`;

        let upload = util.promisify(s3.upload.bind(s3));

        let result = await upload(params).catch(console.log);   
        
        return { status: true, message: "File uploaded"}
          
      }
    } catch (error) {
      return { responseStatus : {status: false, message: error.message} }  
    } 
  },

  switchRole: async (args, req) => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { userId, roleId } = args;
      await User.findOneAndUpdate( {_id: userId}, {role_id: roleId});
      let user = await User.findById(userId).exec();   
 
      var checkCookProfile = await Profile.findOne({userId: userId}).exec();  
      if(user.role_id === undefined || user.role_id === null){
        user.role_id = 2;
      } 
      if(checkCookProfile !== null){
        if(checkCookProfile.on_boarding === undefined || checkCookProfile.on_boarding === null){
          checkCookProfile.on_boarding = false;
        }
      }
      
      return { 
        userData: user, 
        cookProfile: checkCookProfile, 
        responseStatus : {
          status: true, 
          message: "Role changed successfully"
        } 
      }   
    }catch (error) {
       
    }
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

function refreshTokenMethod(cognitoUser, RefreshToken) { 
  return new Promise((resolve, reject) => {
    cognitoUser.refreshSession(RefreshToken, (err, session) => { 
      if (err) {
        console.log(err.message);
        reject(err);
        return;
      }
      newTokenSession = session;
      resolve(newTokenSession)
    });
  });
}
 
