import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Cart/checkout/order-history jaise pages ko isse wrap karna —
// agar user login nahi hai, seedha login page pe bhej dega
const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;