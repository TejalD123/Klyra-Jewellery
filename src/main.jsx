import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "./app/store";
import App from "./App";

import "./styles/index.css"; // global CSS variables (colors, font) — no Tailwind


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>

      <App />

    </Provider>
  </StrictMode>
);