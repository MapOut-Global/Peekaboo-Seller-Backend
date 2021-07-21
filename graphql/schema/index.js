const { buildSchema } = require("graphql")

module.exports = buildSchema(`

  type User {
    _id: ID!
    first_name: String!
    last_name: String!
    middle_name: String
    email: String!
    password: String!
    phone: String
    createdAt: String!
    updatedAt: String!
    token: String
  } 

  type EmailVerify{
    status: Int!
    otp: Int
    message: String!
  }

  type Profile { 
    userData: User
    flags: Flag
    aboutme: String 
    hoursOfOperation: [HoursOfOperation] 
    heading: String
    messageForMe: String
    availibility: Availibility
    address: Address
    delivery: Delivery
    userId: ID!
    speciality: Speciality
    kitchenTourFile: String
    currency: String
    createdAt: String!
    updatedAt: String!
  }
  
  type Flag{
    termAccepted: Boolean
    active: Boolean
    geoAccepted: Boolean
  }  

  type Week{
    dayNumber: Int
  } 
    
  type Time{
    from: String,
    to: String,
  } 

  type HoursOfOperation{
    dayOfWeek: [Week]
    timeOfDay: Time
  }  

  type Availibility{ 
    status: Boolean
    pauseDateTime: String
    pauseTillDateTime: String
    pauseReason: String
  }  

  type Address{ 
    country: String
    region: String
    city: Boolean
    street: String
    buildNumber: String
    floor: String
    apartment: String
    postCode: String
    geoCordinate: String
  }

  type Delivery{ 
    address: Address
    deliveryAvailable: Boolean
    deliveryRadius: Float
    deliveryType: Int
  }  
 
  type Speciality{
    _id: ID!
    name: String!
    status: Boolean
    createdAt: String!
    updatedAt: String!
  }  
 
  input UserInput {
    first_name: String!
    last_name: String!
    middle_name: String
    email: String!
    password: String!
    phone: String
  }

  input EmailVerifyInput {
    email: String!
  }

  input FlagInput{
    termAccepted: Boolean
    active: Boolean
    geoAccepted: Boolean
  }  

  input WeekInput{
    dayNumber: Int
  } 
    
  input TimeInput{
    from: String,
    to: String,
  } 

  input HoursOfOperationInput{
    dayOfWeek: [WeekInput]
    timeOfDay: TimeInput
  }  

  input AvailibilityInput{ 
    status: Boolean
    pauseDateTime: String
    pauseTillDateTime: String
    pauseReason: String
  }  

  input AddressInput{ 
    address1: String
    address2: String
    lattitude: Float
    longitude: Float
  }

  input DeliveryInput{ 
    address: AddressInput
    deliveryAvailable: Boolean
    freeDeliveryRadius: String
    pickupOnly: Boolean
    sameAsAddress:Boolean
  }   

  input SpecialityInput{
    name: String
    _id: ID
  } 
 
  input ProfileInput {
    flags: FlagInput
    aboutme: String 
    hoursOfOperation: [HoursOfOperationInput] 
    heading: String
    messageForMe: String
    availibility: AvailibilityInput
    address: AddressInput
    delivery: DeliveryInput
    userId: ID!
    speciality: [SpecialityInput]
    kitchenTourFile: String
    currency: String
  }
  
  input UserLoginInput { 
    email: String!
    password: String! 
  }

  type Query {
    users:[User!]
    specialities:[Speciality!]
    verifyEmail(verify:EmailVerifyInput): EmailVerify
  }

  type Mutation {
    signUp(user:UserInput): User
    updateCookProfile(profile:ProfileInput): Profile
    login(user:UserLoginInput): User
  }

  schema {
    query: Query
    mutation: Mutation
  }
`)