const { buildSchema } = require("graphql")

module.exports = buildSchema(`

  type User {
    _id: ID!
    full_name: String
    middle_name: String
    email: String
    password: String
    phone: String
    createdAt: String
    updatedAt: String
    responseStatus: ResponseStatus
  } 

  type LoginType {
    userData: User
    token: String
    refreshToken: String
    responseStatus: ResponseStatus
  }

  type SignupType {
    userData: User
    token: String
    refreshToken: String
    responseStatus: ResponseStatus
  }

  type EmailVerify{
    otp: Int
    responseStatus: ResponseStatus
  }
  
  type OtpVerify{ 
    responseStatus: ResponseStatus
  }

  scalar Upload

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
    speciality: [Speciality]
    kitchenTourFile: String
    currency: String
    createdAt: String!
    updatedAt: String!
    responseStatus: ResponseStatus
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
    _id: ID
    name: String
    status: Boolean
    createdAt: String!
    updatedAt: String!
  }  
 
  input UserInput {
    full_name: String! 
    middle_name: String
    email: String!
    password: String!
    phone: String
  }

  input EmailVerifyInput {
    email: String!
  }

  input OtpVerifyInput {
    email: String!
    otp: Int!
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
    latitude: Float
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
    avatar: Upload,
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

  type ResponseStatus{
    status: Boolean
    message: String
  }

  type RefreshToken{
    token: String!
    refreshToken: String!
    responseStatus: ResponseStatus
  }
  
  type ForgetPassword{
    responseStatus: ResponseStatus
  }
  
  type ResetPassword{
    responseStatus: ResponseStatus
  }

  type FbLogin{
    responseStatus: ResponseStatus
  }

  type Query { 
    specialities(type:String!):[Speciality!]
    verifyEmail(verify:EmailVerifyInput): EmailVerify
    verifyOtp(verify:OtpVerifyInput): OtpVerify
    renewJwtToken(refreshToken: String): RefreshToken
    forgetPassword(email: String): ForgetPassword
    resetPassword(email: String!, verificationCode: String!, newPassword: String!): ResetPassword
    fbLogin(fbAccessToken: String!, full_name:String, email:String): FbLogin
  }

  type Mutation {
    signUp(user:UserInput): SignupType
    updateCookProfile(profile:ProfileInput): Profile
    login(user:UserLoginInput): LoginType
  }

  schema {
    query: Query
    mutation: Mutation
  }
`)