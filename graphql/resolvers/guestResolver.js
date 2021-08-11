const { mergeResolvers } = require('@graphql-tools/merge');
const userResolver = require('./user'); 
const specialityResolver = require('./speciality'); 
const productResolver = require('./product'); 
const categoryResolver = require('./category'); 
const profileResolver = require('./profile'); 
const postResolver = require('./post'); 
const classResolver = require('./class'); 
const orderResolver = require('./order'); 

const resolvers = [
  userResolver, 
  specialityResolver,
  productResolver,
  categoryResolver,
  profileResolver,
  postResolver,
  classResolver,
  orderResolver,
];

module.exports  = mergeResolvers(resolvers);