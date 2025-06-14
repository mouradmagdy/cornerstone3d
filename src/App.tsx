import Toast from "./components/Toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { DicomProvider } from "./context/DicomContext";
import { ToolProvider } from "./context/ToolContext";

function App() {
  return (
    <>
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
