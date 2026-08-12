import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/auth/services/Auth.slice";
import categoriesReducer from "../features/categories/services/categories.slice";
import productDetailReducer from "../features/product/services/product.slice";
import cartReducer from "../features/cart/services/cart.slice";
import ordersReducer from "../features/checkout/services/order.slice";
import addressReducer from "../features/address/services/address.slice";
import userReducer from "../features/profile/services/user.slice";
import wishlistReducer from "../features/wishlist/services/wishlist.slice";
import paymentReducer from "../features/payment/services/payment.slice";
import notificationReducer from "../features/notification/services/notification.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  productDetail: productDetailReducer,
  cart: cartReducer,
  orders: ordersReducer,
  address: addressReducer,
  user: userReducer,
  wishlist: wishlistReducer, 
  payment: paymentReducer,
  notifications: notificationReducer,
});

export default rootReducer;