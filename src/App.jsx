import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { bootstrapAuth } from "./features/auth/services/Auth.slice";

function App() {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!authChecked) {
    return <div style={{ padding: 40 }}>Loading...</div>; // ya apna spinner/skeleton
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;