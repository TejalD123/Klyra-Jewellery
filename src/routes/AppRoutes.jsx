import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import OtpPage from "../features/auth/pages/OtpPage";
import HomePage from "../Home/pages/HomePage";
import AllCategoriesPage from "../features/categories/pages/AllCategoriesPage";
import CategorySubcategoriesPage from "../features/categories/pages/CategorySubcategoriesPage";
import SearchPage from "../features/search/pages/SearchPage";
import AllProducts from "../features/product/pages/AllProducts";
import ProductDetailPage from "../features/product/pages/ProductDetailPage";
import WishlistPage from "../features/wishlist/pages/WishlistPage";
import CartPage from "../features/cart/pages/CartPage";
import MainLayout from "../layout/MainLayout";
import AdminRoute from "./AdminRoute";
import AdminRoutes from "./AdminRoutes";

// account section
import AccountLayout from "../layout/profileLayout";
import ProfilePage from "../features/profile/pages/ProfilePage";
import MyOrdersPage from "../features/profile/pages/MyOrdersPage";
import TrackOrderPage from "../features/profile/pages/TrackOrderPage";
import NotificationPage from "../features/profile/pages/NotificationPage";
import CheckoutPage from "../features/checkout/pages/CheckoutPage";
import OrderConfirmationPage from "../features/payment/page/OrderConfirmationPage"; // ⚠️ adjust path if different

import AboutUs from "../features/servicesPages/AboutUs";
import ContactUs from "../features/servicesPages/ContactUs";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/otp" element={<OtpPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<AllCategoriesPage />} />
        <Route
          path="/categories/:slug"
          element={<CategorySubcategoriesPage />}
        />
        <Route path="/products" element={<SearchPage />} />
        {/* NEW — this was previously unrouted; Navbar's "Jewellery" link
            already points here, it just had nowhere to land */}
        <Route path="/search" element={<AllProducts />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderConfirmationPage />} />

        {/* ===== Account section — nested under AccountLayout (sidebar) ===== */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<ProfilePage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminRoutes />
          </AdminRoute>
        }
      />

      <Route
        path="*"
        element={<div style={{ padding: 40 }}>Page not found</div>}
      />
    </Routes>
  );
};

export default AppRoutes;