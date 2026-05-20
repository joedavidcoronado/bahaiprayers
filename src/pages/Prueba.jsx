import SplashScreen from "../components/SplashScreen";
    import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

const Prueba = () => {
const navigate = useNavigate();

  return (
    <>
      <SideBar />
      <SplashScreen onFinish={() => navigate("/")} />
    </>
  );
};

export default Prueba;