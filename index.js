const express = require("express");
const graphqlHttp = require("express-graphql").graphqlHTTP; 
const mongoose = require("mongoose");
const graphqlGuestSchema = require("./graphql/schema/guestSchema"); 
const graphqlGuestResolvers = require("./graphql/resolvers/guestResolver"); 
const bodyParser =  require('body-parser');
const { graphqlUploadExpress } = require('graphql-upload');
const expressPlayground = require('graphql-playground-middleware-express')
  .default
const app = express() 
app.get('/playground', expressPlayground({ endpoint: '/graphql' })) 
app.use(
  "/graphql",
  bodyParser.json(),
  graphqlUploadExpress({ 
    maxFileSize: 512000000, // 512 MB
    maxFiles: 20,
  }),
  graphqlHttp({
    schema: graphqlGuestSchema,
    rootValue: graphqlGuestResolvers,
    graphiql: true,
    
  })
); 
const uri = `mongodb+srv://mapout:mapout@mapoutdb.hj2on.mongodb.net/mapout-staging`; 
const options = { useNewUrlParser: true, useUnifiedTopology: true  };
mongoose.connect(uri, options)
.then(() => app.listen(3000, console.log("Server is running")))
.catch(error => {
  throw error
})
