import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./components/Cart/Index";
import ComingSoon from "./components/ComingSoon/Index";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import EmailVerify from "./pages/Auth/EmailVerify";
import EmailVerified from "./pages/Auth/EmailVerified";
import { routeUrls } from "./api/base/routeUrls";
import MyAccount from "./pages/MyAccount";
import ProtectedRoute from "./components/Common/ProtectedRoute/Index";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ChangePassword from "./pages/Auth/ChangePassword";
import ContactUs from "./pages/ContactUs";


const App: React.FC = () => {
  return (
    <Router>
      <Cart />
      <Routes>
        <Route path={routeUrls.home} element={<Home />} />
        <Route path={routeUrls.about} element={<About />} />
        <Route path={routeUrls.comingSoon} element={<ComingSoon />} />
        <Route path={routeUrls.register} element={<Register />} />
        <Route path={routeUrls.login} element={<Login />} />
        <Route path={routeUrls.emailVerify} element={<EmailVerify />} />
        <Route path={routeUrls.emailVerified} element={<EmailVerified />} />
        <Route path={routeUrls.forgotPassword} element={<ForgotPassword />} />
        <Route path={routeUrls.changePassword} element={<ChangePassword />} />
        <Route path={routeUrls.contactUs} element={<ContactUs />} />
        <Route
          path={routeUrls.myAccount}
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
