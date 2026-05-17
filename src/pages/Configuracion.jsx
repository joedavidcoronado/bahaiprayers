import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFont, 
  faTextHeight, 
  faPalette, 
  faMagicWandSparkles 
} from '@fortawesome/free-solid-svg-icons';

const Configuracion = () => {
  const navigate = useNavigate();
  const { config, setConfig } = useContext(AppContext);

  const [tempConfig, setTempConfig] = useState(config || {
    fontScale: 100,
    lineHeight: 1.6,
    theme: 'luxury',
    animations: true
  });

  const updateConfig = (key, value) => {
    const newCfg = { ...tempConfig, [key]: value };
    setTempConfig(newCfg);
    if (setConfig) setConfig(newCfg);
    localStorage.setItem("app_config", JSON.stringify(newCfg));
  };

  const styles = {
    mainContainer: {
      backgroundColor: "#000",
      minHeight: "100vh",
      color: "#fff",
      padding: "60px 20px", // Ajustado como en DetalleOracion
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    },
    // BOTÓN IDÉNTICO AL DE DETALLEORACION
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#666',
      marginBottom: '30px',
      fontSize: '0.65rem',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      zIndex: 3,
      position: 'relative',
      cursor: 'pointer',
      padding: 0 // Importante para que no herede padding de button
    },
    title: {
      letterSpacing: "10px",
      fontWeight: "200",
      textTransform: "uppercase",
      fontSize: "1.4rem",
      marginBottom: "50px",
      textAlign: "center",
      color: "#fff"
    },
    glassCard: {
      background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "25px",
      borderRadius: "2px", // Bordes rectos como tu Login
      marginBottom: "25px",
      backdropFilter: "blur(10px)"
    },
    label: {
      color: "#00d4ff",
      letterSpacing: "2px",
      textTransform: "uppercase",
      fontSize: "0.65rem",
      fontWeight: "700",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    themeBtn: (active) => ({
      height: "45px",
      borderRadius: "2px",
      border: active ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.1)",
      background: active ? "rgba(0, 212, 255, 0.1)" : "transparent",
      color: active ? "#00d4ff" : "#555",
      fontSize: "0.6rem",
      letterSpacing: "1px",
      fontWeight: "600",
      transition: "0.3s",
      flex: 1
    })
  };

  return (
    <>
      <SideBar />
      <div style={styles.mainContainer}>
        <Container style={{ maxWidth: "600px", position: "relative" }}>
          
          {/* AQUÍ ESTÁ EL BOTÓN TAL CUAL LO PEDISTE */}
          <button 
            style={styles.backBtn} 
            className="hover-white" 
            onClick={() => navigate(-1)}
          >
            ← VOLVER
          </button>

          <h2 style={styles.title}>Preferencias</h2>

          {/* Tamaño de Fuente */}
          <div style={styles.glassCard}>
            <span style={styles.label}>
              <FontAwesomeIcon icon={faFont} /> Escala de lectura
            </span>
            <input 
              type="range" 
              min="100" max="130" step="5"
              value={tempConfig.fontScale}
              onChange={(e) => updateConfig('fontScale', parseInt(e.target.value))}
              className="custom-range"
              style={{ width: "100%", accentColor: "#00d4ff", cursor: "pointer" }}
            />
            <div className="d-flex justify-content-between mt-2" style={{fontSize: '0.6rem', color: '#444'}}>
              <span>100%</span>
              <span>130%</span>
            </div>
          </div>

          {/* Interlineado */}
          <div style={styles.glassCard}>
            <span style={styles.label}>
              <FontAwesomeIcon icon={faTextHeight} /> Espaciado de líneas
            </span>
            <div className="d-flex gap-2">
              {[1.4, 1.6, 1.9].map(val => (
                <button 
                  key={val}
                  style={styles.themeBtn(tempConfig.lineHeight === val)}
                  onClick={() => updateConfig('lineHeight', val)}
                >
                  {val === 1.4 ? 'MIN' : val === 1.6 ? 'MED' : 'MAX'}
                </button>
              ))}
            </div>
          </div>

          {/* Animaciones */}
          <div style={styles.glassCard} className="d-flex align-items-center justify-content-between">
            <span style={{...styles.label, marginBottom: 0}}>
              <FontAwesomeIcon icon={faMagicWandSparkles} /> Efectos Visuales
            </span>
            <div 
              onClick={() => updateConfig('animations', !tempConfig.animations)}
              style={{
                width: '45px', height: '22px',
                backgroundColor: tempConfig.animations ? '#00d4ff' : '#222',
                borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.4s'
              }}
            >
              <div style={{
                width: '16px', height: '16px', backgroundColor: '#fff',
                borderRadius: '50%', position: 'absolute', top: '3px',
                left: tempConfig.animations ? '26px' : '3px', transition: '0.4s'
              }} />
            </div>
          </div>

        </Container>
      </div>

      <style>{`
        .hover-white:hover { color: #fff !important; }
        
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
        }
      `}</style>
    </>
  );
};

export default Configuracion;