import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Admin dashboard/category-manage/product-manage jaise pages ko isse wrap karna
const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;