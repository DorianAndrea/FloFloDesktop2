import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { FloFloProvider } from "./context/FloFloContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FloFloProvider>
      <App />
    </FloFloProvider>
  </React.StrictMode>
);