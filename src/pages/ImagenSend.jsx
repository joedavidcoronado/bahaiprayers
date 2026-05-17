import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import html2canvas from "html2canvas";
import SideBar from "../components/SideBar";
import { Filesystem, Directory } from '@capacitor/filesystem';

// Importamos el Share nativo de Capacitor
import { Share } from '@capacitor/share';

const ImagenSend = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db } = useContext(AppContext);
  const [oracion, setOracion] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [fontSize, setFontSize] = useState(1.1);
  const [activeTheme, setActiveTheme] = useState(0);
  
  const posterRef = useRef(null);

  const themes = [
    { name: "Noche", grad: "linear-gradient(135deg, #000000 0%, #0a0a2e 100%)", color: "#fff", accent: "#00d4ff" },
    { name: "Amanecer", grad: "linear-gradient(135deg, #1a0f1f 0%, #4a1d1d 100%)", color: "#f8e1e1", accent: "#ff8e8e" },
    { name: "Místico", grad: "linear-gradient(135deg, #0f1711 0%, #1a2e1f 100%)", color: "#e0f2f1", accent: "#4db6ac" },
    { name: "Elegante", grad: "#111", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", accent: "#fff" }
  ];

  const fonts = [
    { name: "Moderna", family: "'Inter', sans-serif" },
    { name: "Clásica", family: "'Playfair Display', serif" },
    { name: "Serena", family: "'Lora', serif" }
  ];

  useEffect(() => {
    const loadOracion = async () => {
      if (!db) return;
      const res = await db.query(`SELECT * FROM oraciones WHERE id = ?`, [id]);
      if (res.values.length > 0) {
        const data = res.values[0];
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

  const handleShare = async () => {
  if (!posterRef.current) return;
  setLoading(true);

  try {
    // 1. Capturar el canvas
    const canvas = await html2canvas(posterRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#000",
    });
    
    // 2. Obtener base64 y limpiar el prefijo "data:image/png;base64,"
    const base64Data = canvas.toDataURL("image/png");
    const base64String = base64Data.split(',')[1];

    // 3. Guardar el archivo temporalmente en el teléfono
    const fileName = `oracion_${Date.now()}.png`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64String,
      directory: Directory.Cache, // Se guarda en la caché para no llenar el cel
    });

    // 4. Compartir usando la URI del archivo guardado
    await Share.share({
      title: oracion.titulo,
      text: 'Compartido desde Oraciones Bahá\'ís',
      url: savedFile.uri, // Ahora compartimos un archivo real
      dialogTitle: 'Compartir Oración',
    });

  } catch (err) {
    console.error("Error detallado:", err);
    alert("No se pudo compartir la imagen. Verifica los permisos.");
  } finally {
    setLoading(false);
  }
};

  if (!oracion) return <div style={s.loader}><Spinner animation="grow" variant="info" /></div>;

  return (
    <>
      <SideBar />
      <div style={s.container}>
        {/* Header con Título central */}
        <div style={s.header}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>←</button>
          <h1 style={s.mainTitle}>COMPARTIR ORACIÓN</h1>
          <button onClick={handleShare} style={s.shareBtn} disabled={loading}>
            {loading ? "..." : "ENVIAR"}
          </button>
        </div>

        {/* Preview del Poster */}
        <div style={s.previewArea}>
          <div 
            ref={posterRef} 
            style={{
              ...s.poster,
              background: themes[activeTheme].grad,
              border: themes[activeTheme].border || "none",
              fontFamily: fontFamily
            }}
          >
            <div style={s.innerContent}>
              <span style={{...s.cat, color: themes[activeTheme].accent}}>{oracion.categoria}</span>
              <h2 style={{...s.titulo, color: themes[activeTheme].color}}>{oracion.titulo}</h2>
              
              <div style={{...s.bodyText, fontSize: `${fontSize}rem`, color: themes[activeTheme].color}}>
                {oracion.previo.map((p, i) => <p key={i} style={s.italic}>{p}</p>)}
                {oracion.parrafos.map((p, i) => <p key={i}>{p}</p>)}
                {oracion.post.map((p, i) => <p key={i} style={s.italic}>{p}</p>)}
              </div>
              
              <span style={{...s.autor, color: themes[activeTheme].color}}>{oracion.autor}</span>
              
              <div style={s.watermark}>ORACIONES BAHÁ'ÍS</div>
            </div>
          </div>
        </div>

        {/* Controles Inferiores */}
        <div style={s.controls}>
          <div style={s.controlGroup}>
            <span style={s.label}>TAMAÑO LETRA</span>
            <input 
              type="range" min="0.7" max="1.5" step="0.05" 
              value={fontSize} onChange={(e) => setFontSize(e.target.value)}
              style={s.range}
            />
          </div>

          <div style={s.controlGroup}>
            <span style={s.label}>TEMA</span>
            <div style={s.chipContainer}>
              {themes.map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTheme(i)}
                  style={{...s.colorChip, background: t.grad, border: activeTheme === i ? '2px solid #00d4ff' : '1px solid #444'}}
                />
              ))}
            </div>
          </div>

          <div style={s.controlGroup}>
            <span style={s.label}>FUENTE</span>
            <div style={s.chipContainer}>
              {fonts.map((f, i) => (
                <button 
                  key={i} 
                  onClick={() => setFontFamily(f.family)}
                  style={{...s.fontBtn, borderColor: fontFamily === f.family ? '#00d4ff' : '#333'}}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Lora:ital@0;1&display=swap');
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

const s = {
  container: { backgroundColor: "#000", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" },
  loader: { backgroundColor: "#000", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "20px", 
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    backgroundColor: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  mainTitle: {
    fontSize: "0.7rem",
    letterSpacing: "4px",
    fontWeight: "600",
    margin: 0,
    color: "#fff",
    textAlign: "center"
  },
  backBtn: { background: "none", border: "none", color: "#666", fontSize: "1.2rem", padding: "0 10px" },
  shareBtn: { backgroundColor: "#00d4ff", border: "none", color: "#000", padding: "6px 18px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "800", letterSpacing: "1px" },
  
  previewArea: { flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "20px" },
  poster: {
    width: "100%",
    maxWidth: "420px",
    minHeight: "700px",
    padding: "50px 35px",
    borderRadius: "2px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
  },
  innerContent: { display: "flex", flexDirection: "column", height: "100%" },
  cat: { fontSize: "0.55rem", letterSpacing: "4px", textTransform: "uppercase", textAlign: "center", marginBottom: "20px", opacity: 0.8 },
  titulo: { fontSize: "1.3rem", textAlign: "center", fontWeight: "300", letterSpacing: "3px", marginBottom: "40px", textTransform: "uppercase" },
  bodyText: { lineHeight: "1.9", textAlign: "justify", fontWeight: "300" },
  italic: { fontStyle: "italic", opacity: 0.8, marginBottom: "15px" },
  autor: { marginTop: "40px", textAlign: "right", fontSize: "0.85rem", fontWeight: "500" },
  watermark: { marginTop: "auto", paddingTop: "50px", textAlign: "center", fontSize: "0.45rem", letterSpacing: "6px", opacity: 0.2 },

  controls: { backgroundColor: "#0a0a0a", padding: "25px 20px 40px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" },
  controlGroup: { marginBottom: "25px" },
  label: { fontSize: "0.55rem", letterSpacing: "2px", color: "#444", display: "block", marginBottom: "12px", fontWeight: "700" },
  range: { width: "100%", accentColor: "#00d4ff" },
  chipContainer: { display: "flex", gap: "15px", alignItems: "center", overflowX: "auto", paddingBottom: "5px" },
  colorChip: { width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer", flexShrink: 0 },
  fontBtn: { background: "none", border: "1px solid #333", color: "#fff", fontSize: "0.6rem", padding: "6px 15px", borderRadius: "2px", letterSpacing: "1px", textTransform: "uppercase" }
};

export default ImagenSend;