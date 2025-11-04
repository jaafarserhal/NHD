import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/About";
import Cart from "./components/Cart/Index";
import ComingSoon from "./components/ComingSoon/Index";


const App: React.FC = () => {
  return (
    <Router>
      <Cart />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
      </Routes>
    </Router>
  );
};

export default App;
