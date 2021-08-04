const User = require("../../models/user") 
const OtpVerification = require("../../models/otp_verification") 
const Profile = require("../../models/profile")  
const { authorizationFunction } = require('../checkCognitoToken.js'); 

 
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
    try { 
      let result = await asyncAuthenticateUser(cognitoUser, authenticationDetails);
      if ('idToken' in result) {
        var accessToken = result.getAccessToken().getJwtToken(); 
        var refreshToken = result.getRefreshToken().getToken();  
        var checkCookProfile = await Profile.findOne({userId: user._id}).exec();  
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
        let otp = Math.floor(1000 + Math.random() * 9999);
        //let otp = 9999; 
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

  socialLogin: async args => {
    let checkToken = await authorizationFunction(req); 
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    
    try { 
      let { full_name, email } = args; 
      userData = await User.findOne(
        {
          email: email
        }
      ).exec(); 
      if (userData) { 
        var checkCookProfile = await Profile.findOne({userId: userData._id}).exec();  
        return { 
          userData: userData, 
          cookProfile: checkCookProfile, 
          responseStatus : {
            status: true, 
            message: "Login successfully"
          } 
        }  
      } else {
        const user = new User({
          full_name,
          email 
        });
        const newUser = await user.save();
        cookProfile.userId = newUser._id;
        return { userData: newUser._doc, cookProfile: cookProfile , responseStatus : {status: true, message: "Login successfully"} } 
      } 
    } catch (error) {
       
    }
     
  }, 
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
 
