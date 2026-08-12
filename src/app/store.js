import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Firebase confirmationResult jaisi non-serializable cheezein humne
      // authSlice ke bahar (firebase.config.js mein) rakhi hain, isliye
      // yeh check yaha safely default (true) rakh sakte hain
      serializableCheck: true,
    }),
});