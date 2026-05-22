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
  faCog,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SideBar.module.css';

const SideBar = () => {
  const [show, setShow] = useState(false);
  const { user, removeUserInfo } = useContext(AppContext);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow  = () => setShow(true);

  const cerrarSesion = () => { removeUserInfo(); navigate("/"); handleClose(); };
  const goToConfig   = () => { navigate("/config"); handleClose(); };
  const handleNav    = (path) => { navigate(path); handleClose(); };

  return (
    <>
      <button onClick={handleShow} className={styles.openButton} aria-label="Abrir Menú">
        <FontAwesomeIcon icon={faBars} className={styles.barsIcon} />
      </button>

      <Offcanvas show={show} onHide={handleClose} placement="end" className={styles.canvas}>
        <Offcanvas.Body className={styles.body}>

          {/* ── PERFIL ── */}
          <div className={styles.profileSection}>
            <FontAwesomeIcon icon={faCog} className={styles.cogIcon} onClick={goToConfig} />
            {user && (
              <div className={styles.profileRow}>
                <div className={styles.avatar}>
                  {user.nombre?.[0]}{user.apellido?.[0]}
                </div>
                <div>
                  <p className={styles.userName}>{user.nombre} {user.apellido}</p>
                  <span className={styles.userBadge}>Perfil Activo</span>
                </div>
              </div>
            )}
          </div>

          {/* ── NAV ── */}
          <span className={styles.sectionLabel}>Navegación</span>
          <ListGroup variant="flush">
            <ListGroup.Item action onClick={() => handleNav("/Principal")} className={styles.navItem}>
              <FontAwesomeIcon icon={faHome} className={styles.navIcon} /> Inicio
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/oraciones")} className={styles.navItem}>
              <FontAwesomeIcon icon={faPray} className={styles.navIcon} /> Oraciones
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/biblioteca")} className={styles.navItem}>
              <FontAwesomeIcon icon={faMessage} className={styles.navIcon} /> Mensajes de la Casa
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/favoritos")} className={styles.navItem}>
              <FontAwesomeIcon icon={faStar} className={styles.navIcon} /> Favoritos
            </ListGroup.Item>
          </ListGroup>

          <span className={styles.sectionLabel}>Herramientas</span>
          <ListGroup variant="flush">
            <ListGroup.Item action onClick={() => handleNav("/contador")} className={styles.navItem}>
              <FontAwesomeIcon icon={faCalculator} className={styles.navIcon} /> Contador
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => handleNav("/compass")} className={styles.navItem}>
              <FontAwesomeIcon icon={faCompass} className={styles.navIcon} /> Brújula
            </ListGroup.Item>
          </ListGroup>

          {/* ── FOOTER: LOGOUT + TÉRMINOS ── */}
          <div className={styles.footerRow}>
            <button onClick={cerrarSesion} className={styles.logoutBtn}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
            </button>
            <button onClick={() => handleNav("/condiciones")} className={styles.termnosBtn} title="Términos y condiciones">
              <FontAwesomeIcon icon={faFileAlt} />
            </button>
          </div>

        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SideBar;