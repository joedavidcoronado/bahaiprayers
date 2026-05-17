import { useState, useContext } from "react";
import { Offcanvas, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, 
  faBars, 
  faSignOutAlt, 
  faHome, 
  faPray, 
  faStar, 
  faCalculator, 
  faCompass,
  faMessage,
  faCog // Importamos el icono de engranaje
} from '@fortawesome/free-solid-svg-icons';

const SideBar = () => {
  const [show, setShow] = useState(false);
  const { user, removeUserInfo } = useContext(AppContext);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const cerrarSesion = () => {
    removeUserInfo();
    navigate("/");
    handleClose();
  };

  const goToConfig = () => {
    navigate("/config"); // Cambiado a /config para coincidir con tus rutas
    handleClose();
  };

  const handleNav = (path) => {
    navigate(path);
    handleClose();
  };

  const styles = {
    openButton: {
      position: "fixed",
      top: "25px",
      right: "20px",
      zIndex: 999,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "10px",
    },
    canvas: {
      width: "75%", 
      backgroundColor: "rgba(10, 10, 10, 0.98)",
      backdropFilter: "blur(25px)",
      color: "#fff",
      borderLeft: "1px solid rgba(0, 212, 255, 0.2)",
      fontFamily: "'Inter', sans-serif"
    },
    profileSection: {
      padding: "40px 25px",
      background: "linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      position: "relative" // Necesario para ubicar el icono de config
    },
    configIcon: {
      position: "absolute",
      top: "45px",
      right: "20px",
      color: "rgba(255,255,255,0.3)",
      cursor: "pointer",
      fontSize: "1.1rem",
      transition: "0.3s"
    },
    userName: {
      fontSize: "0.85rem",
      letterSpacing: "2px",
      textTransform: "uppercase",
      fontWeight: "600",
      margin: 0,
      color: "#fff"
    },
    sectionLabel: {
      fontSize: "0.62rem",
      letterSpacing: "4px",
      textTransform: "uppercase",
      color: "rgba(255, 255, 255, 0.3)", 
      padding: "30px 25px 12px 25px",
      fontWeight: "800"
    },
    navItem: {
      backgroundColor: "transparent",
      color: "rgba(255, 255, 255, 0.85)", 
      border: "none",
      fontSize: "0.8rem",
      letterSpacing: "2px",
      textTransform: "uppercase",
      padding: "18px 25px",
      transition: "0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "15px"
    },
    logoutBtn: {
      position: "absolute",
      bottom: "30px",
      left: "0",
      width: "100%",
      padding: "20px 25px",
      background: "none",
      border: "none",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      color: "rgba(255, 80, 80, 0.8)", 
      fontSize: "0.72rem",
      letterSpacing: "3px",
      textTransform: "uppercase",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      transition: "0.3s"
    }
  };

  return (
    <>
      <button onClick={handleShow} style={styles.openButton} aria-label="Abrir Menú">
        <FontAwesomeIcon icon={faBars} size="lg" color="#fff" style={{ opacity: 0.7 }} />
      </button>

      <Offcanvas show={show} onHide={handleClose} placement="end" style={styles.canvas}>
        <Offcanvas.Body style={{ padding: 0, overflowX: "hidden" }}>
          
          <div style={styles.profileSection}>
            {/* ICONO DE CONFIGURACIÓN ELEGANTE */}
            <FontAwesomeIcon 
              icon={faCog} 
              style={styles.configIcon} 
              className="hover-cog"
              onClick={goToConfig}
            />

            {user && (
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faUserCircle} size="2x" color="#00d4ff" className="me-3" />
                <div>
                  <p style={styles.userName}>{user.nombre} {user.apellido}</p>
                  <span style={{ fontSize: '0.58rem', color: '#00d4ff', letterSpacing: '1px', opacity: 0.7 }}>Perfil Activo</span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.sectionLabel}>Navegación</div>
          <ListGroup variant="flush">
            <ListGroup.Item action onClick={() => handleNav("/")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faHome} className="icon-width" /> Inicio
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/oraciones")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faPray} className="icon-width" /> Oraciones
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/biblioteca")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faMessage} className="icon-width" /> Mensajes de la Casa
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/favoritos")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faStar} className="icon-width" /> Favoritos
            </ListGroup.Item>
          </ListGroup>

          <div style={styles.sectionLabel}>Herramientas</div>
          <ListGroup variant="flush">
            <ListGroup.Item action onClick={() => handleNav("/contador")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faCalculator} className="icon-width" /> Contador
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/compass")} style={styles.navItem} className="side-item">
              <FontAwesomeIcon icon={faCompass} className="icon-width" /> Brújula
            </ListGroup.Item>
          </ListGroup>

          <button onClick={cerrarSesion} style={styles.logoutBtn} className="hover-logout">
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      <style>{`
        .icon-width { 
          width: 22px; 
          text-align: center; 
          opacity: 0.5; 
          transition: 0.3s;
          font-size: 1rem;
        }

        .hover-cog:hover {
          color: #00d4ff !important;
          transform: rotate(90deg);
        }
        
        .side-item {
          border-left: 3px solid transparent !important;
        }

        .side-item:hover {
          color: #fff !important;
          background-color: rgba(0, 212, 255, 0.06) !important;
          padding-left: 32px !important;
          border-left: 3px solid #00d4ff !important;
        }

        .side-item:hover .icon-width {
          opacity: 1;
          color: #00d4ff;
        }

        .hover-logout:hover {
          color: #ff4d4d !important;
          background-color: rgba(255, 77, 77, 0.06) !important;
        }

        .offcanvas-backdrop.show {
          opacity: 0.8 !important;
          background-color: #000 !important;
          backdrop-filter: blur(8px);
        }

        .side-item {
          white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default SideBar;