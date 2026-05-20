import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { App } from '@capacitor/app'; 

import './global.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Principal from './pages/Principal.jsx';
import Login from './pages/Login.jsx';
import Favoritos from './pages/Favoritos.jsx';
import OracionesList from './pages/OracionesList.jsx';
import Contador from './pages/Contador.jsx';
import BahiCompass from './pages/BahiCompass.jsx';
import DetalleOracion from './pages/DetalleOracion.jsx';
import Biblioteca from './pages/Biblioteca.jsx';
import Reflexiones from './pages/Reflexiones.jsx';
import Configuracion from './pages/Configuracion.jsx';
import ImagenSend from './pages/ImagenSend.jsx';
import Prueba from './pages/Prueba.jsx';

// Componente para gestionar la navegación física de Android
const AppNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let lastTimeBackPress = 0;
  const timePeriodToExit = 2000;

  useEffect(() => {
    const setupBackButton = async () => {
      await App.addListener('backButton', () => {
        // Si estamos en la raíz o en la página principal
        if (location.pathname === '/' || location.pathname === '/principal') {
          const currentTime = new Date().getTime();
          
          if (currentTime - lastTimeBackPress < timePeriodToExit) {
            App.exitApp(); // Cierra la app al segundo toque
          } else {
            lastTimeBackPress = currentTime;
            // Aquí podrías poner un Toast elegante, por ahora usamos un log o alert
            console.log("Presiona de nuevo para salir");
          }
        } else {
          // Si estamos en cualquier otra página, vamos atrás
          navigate(-1); 
        }
      });
    };

    setupBackButton();

    // Limpiamos el listener al desmontar
    return () => {
      App.removeAllListeners();
    };
  }, [location, navigate]);

  return null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <HashRouter>
        {/* El manejador DEBE estar dentro del Router para poder usar useNavigate y useLocation */}
        <AppNavigationHandler />
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/favoritos" element={<Prueba />} />
          <Route path="/oraciones" element={<OracionesList />} />
          <Route path="/contador" element={<Contador />} />
          <Route path="/compass" element={<BahiCompass />} />
          <Route path="/detalle/:id" element={<DetalleOracion />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/reflexiones/:id" element={<Reflexiones />} />
          <Route path="/config" element={<Configuracion />} />
          <Route path="/imagen-send/:id" element={<ImagenSend />} />
          
        </Routes>
      </HashRouter>
    </AppProvider>
  </StrictMode>
);