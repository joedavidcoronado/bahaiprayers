// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { populateDB } from "../db/populateDB";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👇 Config con valor guardado o default
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("app_config");
    return saved ? JSON.parse(saved) : { fontScale: 100 };
  });

  // 👇 Aplica fontScale al DOM cada vez que cambia
  useEffect(() => {
    if (config?.fontScale) {
      document.documentElement.style.fontSize = `${config.fontScale}%`;
    }
  }, [config.fontScale]);

  useEffect(() => {
    const loadAppData = async () => {
      const res = await Preferences.get({ key: "user" });
      if (res.value) setUser(JSON.parse(res.value));

      try {
        const dbInstance = await populateDB();
        setDb(dbInstance);
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
      }

      setLoading(false);
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

  if (loading) return null;

  return (
    // 👇 Agregá config y setConfig al value
    <AppContext.Provider value={{ user, db, setUserInfo, removeUserInfo, config, setConfig }}>
      {children}
    </AppContext.Provider>
  );
};