import Toast from "./components/Toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { DicomProvider } from "./context/DicomContext";

function App() {
  return (
    <>
      <DicomProvider>
        <Toast />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </DicomProvider>
    </>
  );
}

export default App;
