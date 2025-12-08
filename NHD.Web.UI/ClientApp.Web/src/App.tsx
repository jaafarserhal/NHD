import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/About";
import Cart from "./components/Cart/Index";
import ComingSoon from "./components/ComingSoon/Index";
import CreateAccount from "./pages/CreateAccount";
import MyAccount from "./pages/MyAccount";
import EmailVerification from "./pages/EmailVerfication";
import { routeUrls } from "./api/base/routeUrls";


const App: React.FC = () => {
  return (
    <Router>
      <Cart />
      <Routes>
        <Route path={routeUrls.home} element={<HomePage />} />
        <Route path={routeUrls.about} element={<AboutPage />} />
        <Route path={routeUrls.comingSoon} element={<ComingSoon />} />
        <Route path={routeUrls.createAccount} element={<CreateAccount />} />
        <Route path={routeUrls.myAccount} element={<MyAccount />} />
        <Route path={routeUrls.emailVerification} element={<EmailVerification />} />
      </Routes>
    </Router>
  );
};

export default App;
