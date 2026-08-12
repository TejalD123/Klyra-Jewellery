import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartSidebar from "../features/cart/components/CartSidebar";
import CartToast from "../features/cart/components/CartToast";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <CartToast />
    </>
  );
}