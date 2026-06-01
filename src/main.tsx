import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// TypeScript may not have declarations for CSS side-effect imports in this project setup.
// @ts-ignore: allow importing plain CSS for side effects
import "./assets/styles/globals.css";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <>
      <App />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "18px",
            padding: "20px",
            fontWeight: "bold",
            maxWidth: "600px",
          },
        }}
      />
    </>
  </React.StrictMode>
);