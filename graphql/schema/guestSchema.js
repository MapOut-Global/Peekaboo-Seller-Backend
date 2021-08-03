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
    cookProfile: Profile
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
    avatar_url: S3Type
    attachments: [S3Type]
    responseStatus: ResponseStatus
  }
  
  type S3Type {
    Location: String
    Key: String
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
    type:String
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
    type: String
    _id: ID
  } 
 
  input ProfileInput {
    avatar: Upload
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
    attachments: [Upload]
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

  type Product {
    name: String!, 
    description: String 
    categories: [Category] 
    sub_categories: [Category] 
    cuisines: [Speciality] 
    dietary_need: [Speciality] 
    packaging_price: Packaging
    product_availibility: ProductAvailibility
    delivery_details: DeliveryDetail
    discount_details: DiscountDetail
    product_image_url: Upload
    userId: ID! 
    _id: ID!
    stock: String 
    createdAt: String
    updatedAt: String
  }
  
  input ProductInput {
    name: String!, 
    description: String 
    categories: [CategoryInput] 
    sub_categories: [CategoryInput] 
    cuisines: [SpecialityInput] 
    dietary_need: [SpecialityInput] 
    packaging_price: PackagingInput
    product_availibility: ProductAvailibilityInput
    delivery_details: DeliveryDetailInput
    discount_details: DiscountDetailInput 
    userId: ID! 
    stock: String
    product_image: Upload 
  }

  input CategoryInput {
    _id:String
    name: String
    parent_id: String
  }

  type Category {
    _id:String
    name: String
    parent_id: String
  }

  input PackagingInput { 
    packagin_type: String
    weight: String
    package_price: Float
  }

  type Packaging { 
    packagin_type: String
    weight: String
    package_price: Float
  }


  input ProductAvailibilityInput { 
    made_upon_order: Boolean
    date: String
    asap: Boolean
    asap_prepration_time: String
    preorder: Boolean
    preorder_prepration_time: String
  } 
  type ProductAvailibility { 
    made_upon_order: Boolean
    date: String
    asap: Boolean
    asap_prepration_time: String
    preorder: Boolean
    preorder_prepration_time: String
  }


  input DeliveryDetailInput { 
    delivery: Boolean 
    pick_up: Boolean 
  }
  type DeliveryDetail { 
    delivery: Boolean 
    pick_up: Boolean 
  }

  input DiscountDetailInput { 
    discount: Boolean
    days: String 
    available_date: String
    available_time: String 
  }
  type DiscountDetail { 
    discount: Boolean
    days: String 
    available_date: String
    available_time: String 
  }

  type AddProduct{
    productData: Product
    responseStatus: ResponseStatus
  }

  input CategoryFindInput{
    _id: String
  }

  input CategoryOfferInput{
    _id: String
    name: String
  }

  type UpdatedOffer{ 
    responseStatus: ResponseStatus
  }

  type Query { 
    specialities(type:String!):[Speciality!]
    categories(parentIds:[CategoryFindInput]):[Category!]
    verifyEmail(verify:EmailVerifyInput): EmailVerify
    verifyOtp(verify:OtpVerifyInput): OtpVerify
    renewJwtToken(refreshToken: String): RefreshToken
    forgetPassword(email: String): ForgetPassword
    resetPassword(email: String!, verificationCode: String!, newPassword: String!): ResetPassword
    fbLogin(fbAccessToken: String!, full_name:String, email:String): FbLogin
    products(categoryId:String, userId:String!, subcategoryId:String): [Product]
  }

  type Mutation {
    signUp(user:UserInput): SignupType
    updateCookProfile(profile:ProfileInput): Profile
    login(user:UserLoginInput): LoginType
    addProduct(productData:ProductInput): AddProduct
    updateCookOffer(categories:[CategoryOfferInput], userId:String): UpdatedOffer
  }

  schema {
    query: Query
    mutation: Mutation
  }
`)