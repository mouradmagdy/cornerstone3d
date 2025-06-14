import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DicomProvider } from "./context/DicomContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DicomProvider>
      <App />
    </DicomProvider>
  </StrictMode>
);
