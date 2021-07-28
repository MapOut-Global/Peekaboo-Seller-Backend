const { mergeResolvers } = require('@graphql-tools/merge');
const userResolver = require('./user'); 
const specialityResolver = require('./speciality'); 
const productResolver = require('./product'); 
const categoryResolver = require('./category'); 

const resolvers = [
  userResolver, 
  specialityResolver,
  productResolver,
  categoryResolver,
];

module.exports  = mergeResolvers(resolvers);