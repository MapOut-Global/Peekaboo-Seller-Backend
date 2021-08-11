const Order = require("../../models/order") 
const Product = require("../../models/product") 
const User = require("../../models/user") 
var ObjectId = require('mongoose').Types.ObjectId; 
const { authorizationFunction } = require('../checkCognitoToken.js'); 
 
module.exports = {  

  orders: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { userId } = args; 
      const orderList = await Order.find(); 
      productIdArr = [];
      customerIdArr = [];
      orderList.map(order => {
        customerIdArr.push(order.customerId);
        order.order_details.map((item) => {
          productIdArr.push(item.productId);
        });
      })
      let productList = await Product.find({_id: { $in : productIdArr}})
      let customerList = await User.find({_id: { $in : customerIdArr}}) 
      return orderList.map(order => { 
        customerList.map(customer => {
          if(order.customerId == customer._id){
            customerData = customer
          }
        }) 
        order.order_details.map((item, itemKey) => {
          order.order_details[itemKey]['productData'] = {};
          productList.map(product => {
            if(item.productId == product._id){
              order.order_details[itemKey]['productData'] = product
            }
          }) 
        }); 
        return {
          order_details: order.order_details,
          _id: order.id,
          is_asap: order.is_asap,
          is_preorder: order.is_preorder,
          preferred_time: order.preferred_time,
          pick_up: order.pick_up,
          delivery: order.delivery,
          delivery_address: order.delivery_address,
          courier_note: order.courier_note,
          comment_for_cook: order.comment_for_cook,
          delivery_cost: order.delivery_cost,
          order_total: order.order_total,
          order_status: order.order_status,
          customerData: customerData,
          createdAt: new Date(order._doc.createdAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
  },

  acceptDeclineOrder: async (args, req) =>  {
    let checkToken = await authorizationFunction(req);
    if(checkToken.client_id === undefined){
      throw {
        error: checkToken,
        status: 401
      }
    }
    try {
      let { _id, order_status} = args;
      let updateOrderStatus = await Profile.updateOne(
        {_id: _id},
        {
          order_status: order_status
        }
      ); 
      if(updateOrderStatus.nModified > 0){
        return { status: true, message: "Order status updated successfully"};
      }else{
        return { status: false, message: "Error in updating order. Try again!!"};
      }
    } catch (error) {
      throw error
    }  
  },
}