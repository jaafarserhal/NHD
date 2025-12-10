import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/About";
import Cart from "./components/Cart/Index";
import ComingSoon from "./components/ComingSoon/Index";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import EmailVerify from "./pages/Auth/EmailVerify";
import EmailVerified from "./pages/Auth/EmailVerified";
import { routeUrls } from "./api/base/routeUrls";


const App: React.FC = () => {
  return (
    <Router>
      <Cart />
      <Routes>
        <Route path={routeUrls.home} element={<HomePage />} />
        <Route path={routeUrls.about} element={<AboutPage />} />
        <Route path={routeUrls.comingSoon} element={<ComingSoon />} />
        <Route path={routeUrls.register} element={<Register />} />
        <Route path={routeUrls.login} element={<Login />} />
        <Route path={routeUrls.emailVerify} element={<EmailVerify />} />
        <Route path={routeUrls.emailVerified} element={<EmailVerified />} />
      </Routes>
    </Router>
  );
};

export default App;
