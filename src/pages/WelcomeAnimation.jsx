import SplashScreen from "../components/SplashScreen";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

const WelcomeAnimation = () => {
const navigate = useNavigate();

  return (
      <SplashScreen onFinish={() => navigate("/principal")} />
  );
};

export default WelcomeAnimation;