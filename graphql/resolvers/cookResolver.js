const { mergeResolvers } = require('@graphql-tools/merge');
const userResolver = require('./user'); 
const specialityResolver = require('./speciality'); 
const productResolver = require('./product'); 
const categoryResolver = require('./category'); 
const profileResolver = require('./profile'); 

const resolvers = [
  userResolver, 
  specialityResolver,
  productResolver,
  categoryResolver,
  profileResolver,
];

module.exports  = mergeResolvers(resolvers);