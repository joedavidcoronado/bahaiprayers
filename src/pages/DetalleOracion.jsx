import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import SideBar from "../components/SideBar";
import html2canvas from "html2canvas";

const DetalleOracion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, user } = useContext(AppContext);
  const [oracion, setOracion] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const prayerRef = useRef(null);

  useEffect(() => {
    const loadOracion = async () => {
      if (!db) return;
      // Seleccionamos los nuevos campos
      const res = await db.query(
        `SELECT o.id, o.titulo, o.previo, o.parrafos, o.post, o.autor, o.favorito, c.nombre as categoria 
         FROM oraciones o 
         LEFT JOIN categorias c ON o.categoriaID = c.id 
         WHERE o.id = ?;`,
        [id]
      );
      if (res.values.length > 0) {
        const data = res.values[0];
        // Parseamos los JSON strings que vienen de la DB
        setOracion({
          ...data,
          previo: JSON.parse(data.previo || "[]"),
          parrafos: JSON.parse(data.parrafos || "[]"),
          post: JSON.parse(data.post || "[]")
        });
      }
    };
    loadOracion();
  }, [db, id]);

  const toggleFavorito = async () => {
    if (!db || !user || !oracion) return;
    const nuevoEstado = oracion.favorito ? 0 : 1;
    await db.run("UPDATE oraciones SET favorito = ? WHERE id = ?;", [nuevoEstado, id]);
    setOracion({ ...oracion, favorito: nuevoEstado });
  };

  const copiarTexto = () => {
    // Unificamos todas las partes para el portapapeles
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

  if (!oracion) return <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner animation="grow" variant="info" /></div>;

  const styles = {
    wrapper: {
      backgroundColor: "#000",
      minHeight: "100vh",
      padding: "60px 20px",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    },
    copyToast: {
      position: "fixed",
      bottom: "120px",
      left: "50%",
      transform: showCopyToast ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
      backgroundColor: "rgba(0, 212, 255, 0.9)",
      color: "#000",
      padding: "10px 25px",
      borderRadius: "30px",
      fontSize: "0.7rem",
      letterSpacing: "3px",
      fontWeight: "700",
      zIndex: 2000,
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      opacity: showCopyToast ? 1 : 0,
      boxShadow: "0 10px 30px rgba(0, 212, 255, 0.3)"
    },
    bokehContainer: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: 0,
      filter: "blur(60px)",
      opacity: 0.7
    },
    // CONTENEDOR SIN CARD (Más minimalista)
    contentArea: {
      padding: "20px 10px",
      marginBottom: "120px",
      position: "relative",
      zIndex: 2,
    },
    cat: {
      color: "#00d4ff",
      fontSize: "0.65rem",
      letterSpacing: "5px",
      textTransform: "uppercase",
      display: "block",
      marginBottom: "10px",
      fontWeight: "500",
      textAlign: "center"
    },
    titulo: {
      fontSize: "1.4rem",
      fontWeight: "200",
      textAlign: "center",
      letterSpacing: "4px",
      marginBottom: "40px",
      textTransform: "uppercase"
    },
    textoPrevioPost: {
      fontSize: "0.95rem",
      lineHeight: "1.8",
      color: "#aaa", // Gris
      fontStyle: "italic", // Cursiva
      textAlign: "justify",
      marginBottom: "25px",
      fontWeight: "300"
    },
    parrafoPrincipal: {
      fontSize: "1.15rem",
      lineHeight: "2.1",
      color: "#fff",
      textAlign: "justify", // Justificado
      marginBottom: "20px",
      fontWeight: "300",
    },
    autor: {
      color: "#fff", // Blanco
      fontSize: "0.9rem",
      letterSpacing: "2px",
      textAlign: "right",
      display: "block",
      marginTop: "40px",
      fontWeight: "500",
    },
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
      cursor: 'pointer'
    },
    fabContainer: {
      position: "fixed",
      bottom: "45px",
      right: "30px",
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: "12px",
      zIndex: 1000
    },
    mainFab: {
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.07)", 
      backdropFilter: "blur(10px)",
      border: "none",
      color: menuAbierto ? "#00d4ff" : "rgba(230, 230, 230, 0.8)", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      transform: menuAbierto ? "rotate(-90deg)" : "rotate(0deg)",
    },
    menuItem: (delay) => ({
      backgroundColor: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fff",
      padding: "8px 15px",
      borderRadius: "2px",
      fontSize: "0.6rem",
      letterSpacing: "2px",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "0.4s",
      opacity: menuAbierto ? 1 : 0,
      transform: menuAbierto ? "translateX(0)" : "translateX(20px)",
      transitionDelay: `${delay}s`,
    })
  };

  return (
    <>
      <SideBar />
      <div style={styles.wrapper}>
        
        <div style={styles.copyToast}>COPIADO</div>

        <div style={styles.bokehContainer}>
          <div className="bokeh p1"></div>
          <div className="bokeh p2"></div>
          <div className="bokeh p3"></div>
        </div>

        <Container style={{ maxWidth: '650px', position: 'relative' }}>
          <button style={styles.backBtn} className="hover-white" onClick={() => navigate(-1)}>
            ← VOLVER
          </button>

          {/* ÁREA DE CAPTURA Y CONTENIDO */}
          <div ref={prayerRef} style={styles.contentArea}>
            <span style={styles.cat}>{oracion.categoria}</span>
            <h2 style={styles.titulo}>{oracion.titulo}</h2>

            {/* Texto Previo */}
            {oracion.previo.map((p, i) => (
              <p key={`pre-${i}`} style={styles.textoPrevioPost}>{p}</p>
            ))}

            {/* Párrafos Principales */}
            {oracion.parrafos.map((p, i) => (
              <p key={`par-${i}`} style={styles.parrafoPrincipal}>{p}</p>
            ))}

            {/* Texto Post */}
            {oracion.post.map((p, i) => (
              <p key={`post-${i}`} style={styles.textoPrevioPost}>{p}</p>
            ))}

            <span style={styles.autor}>{oracion.autor}</span>

            {/* Firma discreta para la imagen compartida */}
            <div className="only-capture" style={{ textAlign: 'center', marginTop: '60px', opacity: 0.3 }}>
               <span style={{ fontSize: '0.5rem', letterSpacing: '4px' }}>ORACIONES BAHÁ'ÍS</span>
            </div>
          </div>
        </Container>

        {/* MENÚ FLOTANTE */}
        <div style={styles.fabContainer}>
          <button 
            style={styles.mainFab} 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="fab-touch"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div style={styles.menuItem(0)} className="hover-blur" onClick={copiarTexto}>Copiar</div>
          <div 
            style={styles.menuItem(0.05)} 
            className="hover-blur" 
            onClick={() => navigate(`/imagen-send/${id}`)}
          >
            Imagen
          </div>
          <div 
            style={{
              ...styles.menuItem(0.1), 
              color: oracion.favorito ? "#00d4ff" : "#fff",
              borderColor: oracion.favorito ? "rgba(0, 212, 255, 0.5)" : "rgba(255,255,255,0.1)"
            }} 
            onClick={toggleFavorito}
          >
            {oracion.favorito ? "★ Guardado" : "☆ Guardar"}
          </div>
        </div>
      </div>

      <style>{`
        .bokeh { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: float 25s infinite ease-in-out; opacity: 0; }
        .p1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(0,212,255,0.2) 40%, transparent 70%); top: -20%; right: -10%; }
        .p2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,60,255,0.3) 0%, transparent 70%); bottom: -10%; left: -10%; animation-delay: -5s; }
        .p3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%); top: 30%; left: 10%; animation-delay: -12s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          50% { transform: translate(5vw, -5vh) scale(1.05); opacity: 0.8; }
          100% { transform: translate(-2vw, 2vh) scale(1); opacity: 0; }
        }

        .hover-white:hover { color: #fff !important; }
        .hover-blur:hover { background: rgba(255,255,255,0.1) !important; }
        
        /* Ocultar firma en la web, solo se verá en el canvas compartido si quieres */
        .only-capture { display: none; }
        .prayer-card .only-capture { display: block; }
      `}</style>
    </>
  );
};

export default DetalleOracion;