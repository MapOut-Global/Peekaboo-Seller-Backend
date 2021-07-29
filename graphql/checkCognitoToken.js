

module.exports = class AwsCognitoAuthenticate{
	ValidateToken(token) { 
		console.log("hii");
		  return cognitoExpress.validate(token, function(err, response) { 
			//If API is not authenticated, Return 401 with error message. 
			if (err) return false;
			
			//Else API has been authenticated. Proceed.
			res.locals.user = response; 
			return true;
		});
	}
}
