const User = require("../../models/user") 
const OtpVerification = require("../../models/otp_verification") 
const Profile = require("../../models/profile") 
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
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
          return { userData: newUser._doc, token:accessToken, refreshToken: refreshToken, responseStatus : {status: 200, message: "Sign up successfully"} }  
        }
        
      } catch (error) {
        throw error
      } 
  },
  
  updateCookProfile: async (args, req) => {
    try {   
      if(ValidateToken(req.headers.accesstoken)){
        console.log("hii");
        return { status: 403, message: "Invalid token"}
      }
      let { flags, aboutme, hoursOfOperation, heading, availibility, address, delivery, userId, speciality, kitchenTourFile, currency } = args.profile;
      const profile = new Profile();
      const cookProfile = await Profile.findAndModify(
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
      return { ...cookProfile._doc, userData: userData._doc}
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
        return { userData: user, token:accessToken, refreshToken: refreshToken, responseStatus : {status: 200, message: "Login successfully"} }  
      } else {
        return {  status: 403, message: err.message }
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
        return { responseStatus : {status: 403, message: "Email already exists"} };
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
        return { responseStatus : {status: 200, message: "Email sent successfully"} };
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
        return { responseStatus : {status: 200, message: "OTP verified"}};
      }else{  
        return { responseStatus : {status: 403, message: "Invalid OTP"}};
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
                return {  responseStatus: { status: 200, message: "Token renews"}, token: session.accessToken.jwtToken, refreshToken: session.refreshToken.jwtToken }
            }
        });
        console.log(response)
        return response;
      } catch (error) {
        throw error
      }
  }
}

function ValidateToken(token) { 
  request({
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          pems = {};
          var keys = body['keys'];
          for(var i = 0; i < keys.length; i++) {
              //Convert each key to PEM
              var key_id = keys[i].kid;
              var modulus = keys[i].n;
              var exponent = keys[i].e;
              var key_type = keys[i].kty;
              var jwk = { kty: key_type, n: modulus, e: exponent};
              var pem = jwkToPem(jwk);
              pems[key_id] = pem;
          }
          //validate the token
          var decodedJwt = jwt.decode(token, {complete: true});
          if (!decodedJwt) { 
            return false;
          }

          var kid = decodedJwt.header.kid;
          var pem = pems[kid];
          if (!pem) { 
            return false;
          }

          console.log(jwt.verify(token, pem, function(err, payload) {
            console.log(err);
              if(err) {  
                return false;
              } else { 
                return true;
              }
          }));
      } else {
        return false;
      }
  }); 
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
