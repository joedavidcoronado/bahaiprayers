// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { populateDB } from "../db/populateDB"; // Asegúrate de que esta ruta sea correcta

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);       // <-- NUEVO: Estado para la instancia de la DB
  const [loading, setLoading] = useState(true); // Controla la carga inicial (Usuario Y DB)

  // Cargar usuario y Inicializar DB al montar
  useEffect(() => {
    const loadAppData = async () => {
      // 1. Cargar Usuario
      const res = await Preferences.get({ key: "user" });
      if (res.value) setUser(JSON.parse(res.value));

      // 2. Inicializar DB
      // Esta función debe ser llamada solo una vez
      try {
        const dbInstance = await populateDB();
        setDb(dbInstance);
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
      }

      setLoading(false); // La aplicación está lista para renderizar
    };
    loadAppData();
  }, []);

  const setUserInfo = async (userData) => {
    setUser(userData);
    await Preferences.set({ key: "user", value: JSON.stringify(userData) });
  };

  const removeUserInfo = async () => {
    setUser(null);
    await Preferences.remove({ key: "user" });
  };

  // Renderiza hijos solo cuando terminó de cargar (usuario y DB)
  // Esto previene que Principal se monte antes de que db esté disponible.
  if (loading) return null;

  return (
    <AppContext.Provider value={{ user, db, setUserInfo, removeUserInfo }}>
      {children}
    </AppContext.Provider>
  );
};