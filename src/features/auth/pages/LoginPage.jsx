import { useLocation } from "react-router-dom";
import AuthLayout from "../../../layout/AuthLayout";
import LoginForm from "../components/LoginForm";
// import poster from "../../../../public/poster.png";

const LoginPage = () => {
  // ProductDetailPage se navigate("/login", { state: { from: location.pathname } })
  // karke bheja gaya path yahan milta hai — login/otp complete hone ke baad
  // wapas usi page pe bhejne ke liye
  const { state } = useLocation();
  const from = state?.from;

  return (
    <AuthLayout tagline="The art of timeless adornment." headerVariant="minimal" showFooter>
      <LoginForm from={from} />
    </AuthLayout>
  );
};

export default LoginPage;