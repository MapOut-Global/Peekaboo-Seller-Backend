const { mergeResolvers } = require('@graphql-tools/merge');
const userResolver = require('./user'); 
const specialityResolver = require('./speciality'); 
const productResolver = require('./product'); 

const resolvers = [
  userResolver, 
  specialityResolver,
  productResolver
];

module.exports  = mergeResolvers(resolvers);