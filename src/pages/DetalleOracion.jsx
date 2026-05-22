import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import SideBar from "../components/SideBar";
import html2canvas from "html2canvas";
import styles from "./DetalleOracion.module.css";

const getSufijo = (idioma) => idioma === "es" ? "" : `_${idioma}`; 

const DetalleOracion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, user } = useContext(AppContext);
  const [oracion, setOracion] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const prayerRef = useRef(null);
  const location = useLocation(); // 👈
  const idioma = location.state?.idioma || "es"; // 👈 fallback español
  const s = getSufijo(idioma); // 👈

  useEffect(() => {
    const loadOracion = async () => {
      if (!db) return;
      const res = await db.query(
        `SELECT o.id, o.titulo, o.previo, o.parrafos, o.post, o.autor, o.favorito, c.nombre as categoria 
         FROM oraciones${s} o 
         LEFT JOIN categorias${s} c ON o.categoriaID = c.id 
         WHERE o.id = ?;`,  // 👈 tabla dinámica
        [id]
      );
      if (res.values.length > 0) {
        const data = res.values[0];
        setOracion({
          ...data,
          previo:   JSON.parse(data.previo   || "[]"),
          parrafos: JSON.parse(data.parrafos || "[]"),
          post:     JSON.parse(data.post     || "[]")
        });
      }
    };
    loadOracion();
  }, [db, id, s]); // 👈 s como dependencia

  
  const toggleFavorito = async () => {
    if (!db || !user || !oracion) return;
    const nuevoEstado = oracion.favorito ? 0 : 1;
    await db.run(`UPDATE oraciones${s} SET favorito = ? WHERE id = ?;`, [nuevoEstado, id]); // 👈
    setOracion({ ...oracion, favorito: nuevoEstado });
  };

  const copiarTexto = () => {
    const textoCompleto = [
      oracion.titulo,
      ...oracion.previo,
      ...oracion.parrafos,
      ...oracion.post,
      oracion.autor
    ].filter(t => t && t.trim() !== "").join("\n\n");

    navigator.clipboard.writeText(textoCompleto);
    setMenuAbierto(false);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const compartirImagen = async () => {
    if (!prayerRef.current) return;
    try {
      const canvas = await html2canvas(prayerRef.current, {
        backgroundColor: "#000000",
        scale: 3,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "oracion.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: oracion.titulo });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${oracion.titulo}.jpg`;
        link.click();
      }
    } catch (err) { console.error(err); }
  };

  if (!oracion) return (
    <div className={styles.loadingWrapper}>
      <Spinner animation="grow" variant="info" />
    </div>
  );

  const menuItemStyle = (delay) => ({
    opacity:          menuAbierto ? 1 : 0,
    transform:        menuAbierto ? "translateX(0)" : "translateX(20px)",
    transitionDelay:  `${delay}s`,
    pointerEvents:    menuAbierto ? "auto" : "none",
  });

  return (
    <>
      <SideBar />
      <div className={styles.wrapper}>

        {/* Toast */}
        <div className={`${styles.copyToast} ${showCopyToast ? styles.copyToastVisible : ""}`}>
          COPIADO
        </div>

        {/* Bokeh */}
        <div className={styles.bokehContainer}>
          <div className={`${styles.bokeh} ${styles.p1}`} />
          <div className={`${styles.bokeh} ${styles.p2}`} />
          <div className={`${styles.bokeh} ${styles.p3}`} />
        </div>

        <Container style={{ maxWidth: "650px", position: "relative" }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← VOLVER
          </button>

          {/* Área de captura */}
          <div ref={prayerRef} className={styles.contentArea}>
            <span className={styles.cat}>{oracion.categoria}</span>
            <h2 className={styles.titulo}>{oracion.titulo}</h2>

            {oracion.previo.map((p, i) => (
              <p key={`pre-${i}`} className={styles.textoPrevioPost}>{p}</p>
            ))}

            {oracion.parrafos.map((p, i) => (
              <p key={`par-${i}`} className={styles.parrafoPrincipal}>{p}</p>
            ))}

            {oracion.post.map((p, i) => (
              <p key={`post-${i}`} className={styles.textoPrevioPost}>{p}</p>
            ))}

            <span className={styles.autor}>{oracion.autor}</span>

            <div className={styles.onlyCapture}>
              ORACIONES BAHÁ'ÍS
            </div>
          </div>
        </Container>

        {/* FAB */}
        <div className={styles.fabContainer}>
          <button
            className={`${styles.mainFab} ${menuAbierto ? styles.mainFabOpen : ""}`}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div
            className={styles.menuItem}
            style={menuItemStyle(0)}
            onClick={copiarTexto}
          >
            Copiar
          </div>

          <div
            className={styles.menuItem}
            style={menuItemStyle(0.05)}
            onClick={() => navigate(`/imagen-send/${id}`, { state: { idioma } })}
          >
            Imagen
          </div>

          <div
            className={`${styles.menuItem} ${oracion.favorito ? styles.menuItemFav : ""}`}
            style={menuItemStyle(0.1)}
            onClick={toggleFavorito}
          >
            {oracion.favorito ? "★ Guardado" : "☆ Guardar"}
          </div>
        </div>

      </div>
    </>
  );
};

export default DetalleOracion;