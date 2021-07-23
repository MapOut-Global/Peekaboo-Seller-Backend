const User = require("../../models/user") 
const Profile = require("../../models/profile") 
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const poolData = {
  UserPoolId: 'eu-west-2_BCKgWkbfG', // Your user pool id here
  ClientId: 'u1ppqp4u1na016giknetf55lm', // Your client id here
};
const pool_region = 'eu-west-2';
module.exports = { 
  signUp: async args => {
    try {
      let { first_name, last_name, middle_name, email, password, phone } = args.user  
      const user = new User({
        first_name,
        last_name,
        middle_name,
        email, 
        phone
      }) 
      var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData); 
      var attributeList = [];   

      var dataEmail = {
        Name: 'email',
        Value: email,
      };
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
      attributeList.push(attributeEmail);
      await userPool.signUp(email, password, attributeList, null, function(
        err,
        result
      ) {
        if (err) {
          console.log(err)
          return;
        }
        var cognitoUser = result.user; 
        console.log('user name is ' + cognitoUser.getUsername()); 
      });  
      const newUser = user.save();
      jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      return { ...newUser._doc, _id: newUser.id, token:jwtToken }
      
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
        return { userData: user, token:accessToken, refreshToken: refreshToken, status: 200, message: "Login successfully" }  
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