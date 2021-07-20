const express = require("express");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const mongoose = require("mongoose");
const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers");
const expressPlayground = require('graphql-playground-middleware-express')
  .default

const app = express()

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
  })
);
const uri = `mongodb://localhost/${process.env.MONGO_DB}`;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(uri, options)
.then(() => app.listen(3000, console.log("Server is running")))
.catch(error => {
  throw error
})