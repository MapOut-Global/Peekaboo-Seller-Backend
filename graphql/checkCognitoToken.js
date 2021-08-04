const CognitoExpress = require("cognito-express");

const { parse, print, getIntrospectionQuery } = require('graphql');
// format introspection query same way as apollo tooling do
const introspectionQuery = print(parse(getIntrospectionQuery()));

module.exports = {
	authorizationFunction: async (req, res) => {  
		var cognitoExpress = new CognitoExpress({
			region: "us-west-2",
			cognitoUserPoolId: "us-west-2_s968WrlYz",
			tokenUse: "access", //Possible Values: access | id
			tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
		});
		var token = req.headers.accesstoken
		try{
			let tokenResponse = await cognitoExpress.validate(token); 
			if(tokenResponse.client_id !== undefined){
				return tokenResponse;
			} 
		} catch(err) {
			throw err;
		}
	}
}