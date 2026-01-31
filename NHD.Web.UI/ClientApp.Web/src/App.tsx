import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./components/Cart/Index";
import CartPage from "./pages/CartPage";
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
import Faqs from "./pages/Faqs";
import Shop from "./pages/Shop";
import OurDates from "./pages/OurDates";
import ProductDetails from "./pages/ProductDetails";
import DatesDetails from "./pages/DatesDetails";
import { CartProvider } from "./contexts/CartContext";


const App: React.FC = () => {
  return (
    <CartProvider>
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
          <Route path={routeUrls.faqs} element={<Faqs />} />
          <Route path={routeUrls.shop} element={<Shop />} />
          <Route path={routeUrls.ourDates} element={<OurDates />} />
          <Route path={routeUrls.productDetails} element={<ProductDetails />} />
          <Route path={routeUrls.DatesDetails} element={<DatesDetails />} />
          <Route path={routeUrls.cart} element={<CartPage />} />
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
    </CartProvider>
  );
};

export default App;
