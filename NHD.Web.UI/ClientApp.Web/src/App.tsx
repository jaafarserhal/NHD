import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/About";
import Cart from "./components/Cart/Index";
import ComingSoon from "./components/ComingSoon/Index";
import Signup from "./pages/Signup";
import MyAccount from "./pages/MyAccount";


const App: React.FC = () => {
  return (
    <Router>
      <Cart />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/create-account" element={<Signup />} />
        <Route path="/my-account" element={<MyAccount />} />
      </Routes>
    </Router>
  );
};

export default App;
