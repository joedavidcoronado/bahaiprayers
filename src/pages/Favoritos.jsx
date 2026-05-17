import { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

const Favoritos = () => {
  const { user, db } = useContext(AppContext);
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const cargarFavoritos = async () => {
    if (!db || !user) return;
    try {
      setLoading(true);
      // CAMBIO: Ahora pedimos titulo y parrafos en lugar de texto
      const res = await db.query(`
        SELECT o.id, o.titulo, o.parrafos, o.favorito, c.nombre AS categoria
        FROM oraciones o
        LEFT JOIN categorias c ON o.categoriaID = c.id
        WHERE o.favorito = 1;
      `);
      setFavoritos(res.values || []);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFavoritos();
  }, [db, user]);

  // Función para extraer el primer párrafo del JSON
  const getPreview = (jsonParrafos) => {
    try {
      const p = JSON.parse(jsonParrafos);
      return p.length > 0 ? p[0] : "Sin contenido";
    } catch (e) {
      return "Error al cargar texto";
    }
  };

  const styles = {
    mainContainer: {
      backgroundColor: "#000",
      minHeight: "100vh",
      width: "100%",
      color: "#fff",
      padding: "60px 0",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    },
    bokehContainer: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: 0,
      filter: "blur(50px)",
      opacity: 0.6
    },
    title: {
      fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
      fontWeight: "200",
      textAlign: "center",
      letterSpacing: "8px",
      textTransform: "uppercase",
      marginBottom: "10px",
      color: "#ffffff",
      textShadow: "0 0 20px rgba(255,255,255,0.3)",
      zIndex: 2,
      position: "relative"
    },
    subtitle: {
      textAlign: "center",
      fontSize: "0.7rem",
      color: "#00d4ff",
      letterSpacing: "4px",
      marginBottom: "60px",
      textTransform: "uppercase",
      zIndex: 2,
      position: "relative",
      opacity: 0.8
    },
    prayerCard: {
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "35px 25px",
      backgroundColor: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(15px)",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      borderRadius: "4px",
      position: "relative",
      zIndex: 2
    },
    categoryTag: {
      fontSize: "0.6rem",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)", // Un poco más discreto para resaltar el título
      marginBottom: "10px",
      display: "block",
      fontWeight: "500"
    },
    prayerTitle: {
      fontSize: "0.8rem",
      letterSpacing: "2px",
      color: "#00d4ff",
      textTransform: "uppercase",
      marginBottom: "15px",
      fontWeight: "600"
    },
    excerpt: {
      fontSize: "0.85rem",
      lineHeight: "1.7",
      color: "#bbb",
      display: "-webkit-box",
      WebkitLineClamp: "3",
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      margin: 0,
      fontWeight: "300"
    },
    emptyMessage: {
      textAlign: "center",
      padding: "100px 0",
      color: "#444",
      letterSpacing: "5px",
      textTransform: "uppercase",
      fontSize: "0.75rem",
      zIndex: 2,
      position: "relative"
    }
  };

  return (
    <>
      <SideBar />
      <div style={styles.mainContainer}>
        
        <div style={styles.bokehContainer}>
          <div className="bokeh p1"></div>
          <div className="bokeh p2"></div>
          <div className="bokeh p3"></div>
          <div className="bokeh p4"></div>
        </div>

        <Container fluid="md">
          <header>
            <h1 style={styles.title}>Favoritas</h1>
            <p style={styles.subtitle}>Tu lista personal</p>
          </header>

          {loading ? (
            <div className="text-center" style={{position:'relative', zIndex:2}}>
              <Spinner animation="grow" variant="info" size="sm" />
            </div>
          ) : (
            <Row className="gy-4 gx-4 justify-content-center">
              {favoritos.length === 0 ? (
                <div style={styles.emptyMessage}>No hay oraciones guardadas</div>
              ) : (
                favoritos.map((o) => (
                  <Col key={o.id} xs={11} md={6} lg={4}>
                    <div 
                      style={styles.prayerCard} 
                      className="luxury-card-v2"
                      onClick={() => navigate(`/detalle/${o.id}`)}
                    >
                      <span style={styles.categoryTag}>{o.categoria}</span>
                      {/* Agregado el Título */}
                      <h6 style={styles.prayerTitle}>{o.titulo}</h6>
                      <p style={styles.excerpt}>
                        {getPreview(o.parrafos)}
                      </p>
                    </div>
                  </Col>
                ))
              )}
            </Row>
          )}
        </Container>
      </div>

      <style>{`
        .bokeh { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: float 25s infinite ease-in-out; opacity: 0; }
        .p1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(0,212,255,0.3) 40%, transparent 70%); top: -10%; left: -10%; }
        .p2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,60,255,0.4) 0%, transparent 70%); bottom: -10%; right: -10%; animation-delay: -5s; }
        .p3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%); top: 40%; right: 10%; animation-delay: -2s; }
        .p4 { width: 250px; height: 250px; background: radial-gradient(circle, rgba(0,255,242,0.4) 0%, transparent 70%); bottom: 20%; left: 10%; animation-delay: -10s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { opacity: 0.5; }
          50% { transform: translate(10vw, -5vh) scale(1.1); opacity: 0.7; }
          100% { transform: translate(-2vw, 2vh) scale(1); opacity: 0; }
        }

        .luxury-card-v2:hover {
          background-color: rgba(255,255,255,0.08) !important;
          border-color: rgba(0, 212, 255, 0.5) !important;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .luxury-card-v2:active { transform: scale(0.98); }
        .row { margin: 0 !important; }
      `}</style>
    </>
  );
};

export default Favoritos;