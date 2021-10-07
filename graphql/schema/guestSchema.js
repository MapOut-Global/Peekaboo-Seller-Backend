const { buildSchema } = require("graphql")

module.exports = buildSchema(`

  type User {
    _id: ID!
    full_name: String
    middle_name: String
    email: String
    password: String
    phone: String
    login_type: String
    createdAt: String
    role_id: Int
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

  type ProfileType {
    userData: User
    cookProfile: Profile 
    responseStatus: ResponseStatus
  }

  type UpdateProfile {
    userData: User
    cookProfile: Profile 
    responseStatus: ResponseStatus
  }

  type SignupType {
    userData: User
    cookProfile: Profile
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
    shop_name: String
    aboutme: String 
    hoursOfOperation: [HoursOfOperation] 
    about_shop: String  
    address: Address
    delivery: Delivery
    userId: ID!
    speciality: [Speciality]
    kitchenTourFile: S3Type
    categories: [UserCategory] 
    createdAt: String!
    updatedAt: String!
    avatar_url: S3Type
    attachments: [S3Type]
    classes: [Class]  
    phone: String
    on_boarding: Boolean 
    shop_policy: ShopPolicy
    payment_details: CookPaymentDetail
    operating_details: OperatingDetail 
    follower_count: Int
    followers: [Follower] 
    is_following: Boolean
    posts: [Post]
    reviews: [Review]
    rating: Float
    review_counts: Int
  }
  
  type Review {
    customerData: User
    productData: [Product]
    rating: Int
    review: String
    createdAt: String
  }

  type Follower {
    userData:User
  }

  type CookPaymentDetail {
    is_bank_account: Boolean
    is_wallet: Boolean
    account_numner: String
    ifsc_code: String
    wallet_type: String
    upi_id: String
  }

  type OperatingDetail {
    large_order: Boolean
    customisec_order: Boolean
    other: String
    free_delivery: Boolean
    paid_delivery_amt: Float
    free_devlicery_range: Int
    pick_up: Boolean
    pick_up_timings: [PickUpTiming]
    
  }

  type PickUpTiming {
    from: String
    to: String
  }

  type S3Type {
    Location: String
    Key: String
    thumbnail: String
  }

  type ProductImage {
    Location: String
    Key: String
    thumbnail: String
    order: Int
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
    address1: String
    address2: String 
    latitude: Float
    longitude: Float
  }

  type Delivery{ 
    address: Address
    deliveryAvailable: Boolean
    deliveryRadius: String
    deliveryType: Int
    sameAsAddress: Boolean
    pickupOnly: Boolean
  }  
 
  type Speciality{
    _id: ID
    name: String
    status: Boolean
    type:String
    icon_url: String
    createdAt: String!
    updatedAt: String!
  }  
 
  input UserInput {
    full_name: String! 
    middle_name: String
    email: String!
    password: String!
    avatar: Upload
    phone: String
    login_type: String
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
    pickupOnly: Boolean
    sameAsAddress:Boolean
    deliveryRadius: String
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
    shop_name: String
    hoursOfOperation: [HoursOfOperationInput] 
    about_shop: String  
    address: AddressInput
    delivery: DeliveryInput
    userId: ID!
    speciality: [SpecialityInput]
    kitchenTourFile: Upload 
    attachments: [Upload]
    phone: String
    pause_status: Boolean
    pause_till: String
    zip_code: String
    payment_details: PaymentDetailInput 
  }

  input OperatingDetailInput { 
    free_delivery: Boolean
    paid_delivery_amt: Float
    free_devlicery_range: Int
    pick_up: Boolean
    pick_up_timings: [PickUpTimingInput]
    
  }

  input PickUpTimingInput {
    from: String
    to: String
  } 

  input PaymentDetailInput {
    is_bank_account: Boolean
    is_wallet: Boolean
    account_numner: String
    ifsc_code: String
    wallet_type: String
    upi_id: String
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
    userData: User
    profileData: Profile
    responseStatus: ResponseStatus
  }

  type Product {
    name: String, 
    description: String 
    categories: [Category] 
    sub_categories: [Category] 
    cuisines: [Speciality] 
    dietary_need: [Speciality] 
    key_ingredients: [Speciality] 
    packaging_price: [Packaging]
    product_availibility: [ProductAvailibility]
    allergens: [Speciality] 
    mood_tags: [Speciality] 
    product_image_url: [ProductImage]
    likes: Int
    userId: ID! 
    variation_details: [Variation]
    _id: ID!
    status: Boolean 
    createdAt: String
    updatedAt: String
  } 

  type Variation {
    variation_flag: Boolean
    variation_detail: [VariationDetail]
 } 

 type VariationDetail {
   option_name: String
   price: Float
 }

  input ProductInput {
    name: String!, 
    description: String 
    categories: [CategoryInput] 
    sub_categories: [CategoryInput] 
    cuisines: [SpecialityInput] 
    dietary_need: [SpecialityInput] 
    key_ingredients: [SpecialityInput] 
    packaging_price: [PackagingInput]
    product_availibility: [ProductAvailibilityInput]
    allergens: [SpecialityInput] 
    mood_tags: [SpecialityInput] 
    userId: ID! 
    status: Boolean 
    product_image: [Upload] 
    old_product_images: [OldProductImageInput]
    variation_details: VariationInput
    _id: String
  }

  input OldProductImageInput {
    Location: String
    Key: String
    order: Int
    thumbnail: String
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
    sub_category: [Category]
    productList: [Product]
    product_count: Int
  }
  
  type UserCategory {
    _id:String
    name: String
    parent_id: String
    availibility_flag: Boolean
    sub_category: [Category]
    productList: [Product]
    product_count: Int
  }

  type UpdateProfileCategory {
    categories: [UserCategory]
    responseStatus: ResponseStatus
  }

  input PackagingInput { 
    number_of_pax: String 
    packaging_size: String
    package_price: Float
  }

  type Packaging { 
    number_of_pax: String 
    packaging_size: String
    package_price: Float
  }


  input ProductAvailibilityInput { 
    avalibility_type: ProuductAvailibilityType
    from_date: String
    to_date: String 
    is_recurring: Boolean 
    frequency: ItemFrequencyInput
    notice_period_value: Int
    notice_period_type: NoticePeriodType 
    min_requirment: Boolean
    total_qty: Int
    size_per_qty: String
    stock: Int
    prepration_time: String
    end_in: EndRecurring
    end_value: String
  } 

  enum EndRecurring {
    Never
    On
    Occurences
  }
  input ItemFrequencyInput {
    frequency_type: FrequencyType
    ferquency_value: String
  }

  input VariationInput {
     variation_flag: Boolean
     variation_detail: [VariationDetailInput]
  } 

  input VariationDetailInput {
    option_name: String
    price: Float
  }

  type ProductAvailibility { 
    avalibility_type: ProuductAvailibilityType
    from_date: String
    to_date: String 
    is_recurring: Boolean 
    frequency: ItemFrequency
    notice_period_value: Int
    notice_period_type: NoticePeriodType 
    min_requirment: Boolean
    total_qty: Int
    size_per_qty: String
    stock: Int
    prepration_time: String
    end_in: EndRecurring
    end_value: String
  }

  type ItemFrequency { 
    frequency_type: FrequencyType
    ferquency_value: String
  } 

  enum ProuductAvailibilityType {
    OneOffBasis 
    MadeUponOrder
  }

  enum FrequencyType {
    Day
    Week
    Month 
  }

  enum NoticePeriodType {
    Hours
    Days
    Weeks
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

  type AddCategory{ 
    categoryData: Category
    responseStatus: ResponseStatus
  }

  input CategoryFindInput{
    _id: String
  }

  input CategoryOfferInput{
    _id: String
    name: String
    availibility_flag: Boolean
  }

  type UpdatedOffer{ 
    responseStatus: ResponseStatus
  }

  input PostInput {
    _id: String
    description: String
    image: Upload
    productIds: [PostProductInput]
    userId: String!
    facebook_flag: Boolean
    instagram_flag: Boolean
    watsapp_flag: Boolean
  }

  input PostProductInput {
    _id: String!
  }

  type Post {
    _id: String
    description: String
    image: S3Type
    productData: [Product]
    userId: String!
    facebook_flag: Boolean
    instagram_flag: Boolean
    watsapp_flag: Boolean
    createdAt: String
    updatedAt: String
  }

  type AddPost {
    postData: Post
    responseStatus: ResponseStatus
  }

  
  input ClassInput {
    _id: String
    description: String
    image: Upload 
    userId: String!
    name: String!
    date: String!
    from: String!
    to: String!
    price: Float!
    participant_limit: Int!
    zoom_link: String!
  }

  type Class {
    _id: String
    description: String!
    image: S3Type
    name: String!
    date: String!
    from: String!
    to: String!
    price: Float!
    participant_limit: Int!
    likes: Int
    zoom_link: String!
    userId: String! 
    createdAt: String
    updatedAt: String
  }

  type AddClass {
    classData: Class
    responseStatus: ResponseStatus
  }

  type Order {
    _id: String
    customerData: User
    order_details: [OrderDetail]
    is_asap: Boolean
    is_preorder: Boolean
    preferred_time: PreferredTime
    pick_up: Boolean
    delivery: Boolean
    delivery_address: String
    courier_note: String
    comment_for_cook: String
    delivery_cost: String
    order_total: String
    order_status: String
    userId: String! 
    createdAt: String
    updatedAt: String
  }

  type OrderDetail {
    productData: Product
    price: Float
    quantity: Int
  }

  type PreferredTime {
    from: String
    to: String
  }

  type Support {
    problem: String!
    description: String!
    attachment: S3Type
    responseStatus: ResponseStatus 
  }

  input SupportInput {
    problem: String!
    description: String!
    attachment: Upload 
    userId: String!
  }

  input ShopPolicyInput {
    accept_return: Boolean
    min_contact_time_return: ContactPeriodInput
    accept_cancellation: Boolean
    min_contact_time_cancel: ContactPeriodInput 
  }  

  input ContactPeriodInput {
    value: Int
    unit: String
  }

  type ShopPolicy { 
    accept_return: Boolean
    min_contact_time_return: ContactPeriod
    accept_cancellation: Boolean
    min_contact_time_cancel: ContactPeriod
  }

  type ContactPeriod {
    value: Int
    unit: String
  }
  
  input EditUserInput {
    full_name: String
  }

  type RemoveAttachment{
    Key: String
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
    products(categoryId:String, userId:String!, subcategoryId:String): [Product]
    userProfile(userId:String!, cookId: String!): ProfileType 
    posts(userId:String):[Post!]
    classes(userId:String):[Class!]
    orders(userId: String!): [Order!]
    switchRole(userId: String, roleId: Int): ProfileType
  }

  type Mutation {
    signUp(user:UserInput): SignupType
    addCategory(name: String!, parent_id: String!, userId: String!): AddCategory
    updateCookProfile(profile:ProfileInput, user:EditUserInput): UpdateProfile
    login(user:UserLoginInput): LoginType
    addProduct(productData:ProductInput): AddProduct
    updateCookOffer(categories:[CategoryOfferInput], userId:String): UpdatedOffer
    socialLogin(full_name:String, email:String, login_type: String): LoginType
    removeAttachment(userId: String!, Key: String!): RemoveAttachment
    removeMedia(_id: String!, Key: String!): RemoveAttachment
    removeCategory(userId: String!, categoryId: String!): ResponseStatus
    deleteProduct(userId: String!, productId: String!): ResponseStatus
    uploadFile(fileUpload: Upload): ResponseStatus
    updateUserCategoryFlag(userId: String!,categoryId: String!, status: Boolean!): UpdateProfileCategory
    addPost(postData: PostInput): AddPost
    removePost(userId: String!, postId: String!): ResponseStatus
    addClass(classData: ClassInput): AddClass
    removeClass(userId: String!, classId: String!): ResponseStatus
    acceptDeclineOrder(_id: String!, order_status: String!): ResponseStatus
    submitSupportTicket(support: SupportInput): Support
    changeProductStatus(_id: String!, status: Boolean!): ResponseStatus
    shopPolicy(shop_policy: ShopPolicyInput, userId: String!): ResponseStatus
    operatingDetails(operating_details: OperatingDetailInput, userId: String!, hoursOfOperation: [HoursOfOperationInput] ): ResponseStatus
  }

  schema {
    query: Query
    mutation: Mutation
  }
`)