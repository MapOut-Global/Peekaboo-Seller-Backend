const express = require("express");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const { graphqlUploadExpress } = require('graphql-upload');
const mongoose = require("mongoose");
const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers");
const expressPlayground = require('graphql-playground-middleware-express')
  .default

const app = express()

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.use(
  "/graphql",
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
  })
);
const uri = `mongodb+srv://peekaboo:peekaboo@peekaboodb.fvnfz.mongodb.net/peekaboodb?retryWrites=true&w=majority`;
//const uri = `mongodb+srv://peekaboo-user:peekaboo-user@cluster0.elid5.mongodb.net/peekaboo?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, useUnifiedTopology: true  };
mongoose.connect(uri, options)
.then(() => app.listen(3000, console.log("Server is running")))
.catch(error => {
  throw error
})