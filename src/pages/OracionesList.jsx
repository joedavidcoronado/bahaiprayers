import { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const OracionesList = () => {
  const [categorias, setCategorias] = useState([]);
  const [todasLasOraciones, setTodasLasOraciones] = useState([]);
  const [oracionesPorCategoria, setOracionesPorCategoria] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { user, db } = useContext(AppContext);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const initData = async () => {
      if (!db) return;
      try {
        setLoading(true);
        // Cargar Categorías
        const resCat = await db.query("SELECT * FROM categorias ORDER BY nombre ASC;");
        setCategorias(resCat.values || []);

        // CAMBIO: Ahora seleccionamos titulo, parrafos y autor para la búsqueda
        const resOra = await db.query("SELECT id, titulo, parrafos, autor FROM oraciones;");
        setTodasLasOraciones(resOra.values || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [db]);

  const cargarOracionesDeCategoria = async (cat) => {
    setLoading(true);
    try {
      // CAMBIO: Query actualizada con los nuevos campos
      const resOra = await db.query(
        "SELECT id, titulo, parrafos, autor FROM oraciones WHERE categoriaID = ?;",
        [cat.id]
      );
      setOracionesPorCategoria(resOra.values || []);
      setCategoriaSeleccionada(cat);
      setSearchTerm("");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado mejorada para buscar en título, párrafos o autor
  const filtrarOracion = (o) => {
    const term = searchTerm.toLowerCase();
    const titulo = (o.titulo || "").toLowerCase();
    const autor = (o.autor || "").toLowerCase();
    const parrafos = (o.parrafos || "").toLowerCase(); // Buscamos en el string JSON directamente
    
    return titulo.includes(term) || autor.includes(term) || parrafos.includes(term);
  };

  const categoriasFiltradas = categorias.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globalOracionesFiltradas = todasLasOraciones.filter(filtrarOracion).slice(0, 20);

  const oracionesDeCategoriaFiltradas = oracionesPorCategoria.filter(filtrarOracion);

  // Función auxiliar para mostrar un pedacito del texto en la tarjeta
  const getPreviewTexto = (o) => {
    try {
      const p = JSON.parse(o.parrafos);
      return p.length > 0 ? p[0] : ""; // Retorna el primer párrafo
    } catch (e) {
      return "";
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
      opacity: 0.6,
      pointerEvents: "none"
    },
    title: {
      fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
      fontWeight: "200",
      textAlign: "center",
      letterSpacing: "8px",
      textTransform: "uppercase",
      marginBottom: "40px",
      color: "#ffffff",
      zIndex: 2,
      position: "relative"
    },
    separator: {
      width: "100%",
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent)",
      margin: "50px 0 30px 0",
      position: "relative",
      zIndex: 2
    },
    sectionLabel: {
      fontSize: "0.65rem",
      letterSpacing: "4px",
      color: "rgba(0, 212, 255, 0.7)",
      textTransform: "uppercase",
      textAlign: "center",
      marginBottom: "25px",
      fontWeight: "600",
      zIndex: 2,
      position: "relative"
    },
    searchInput: {
      width: "100%",
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "2px",
      color: "#fff",
      padding: "15px",
      fontSize: "0.75rem",
      letterSpacing: "3px",
      textAlign: "center",
      outline: "none",
      transition: "0.4s",
      textTransform: "uppercase"
    },
    card: {
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "30px 20px",
      textAlign: "center",
      backgroundColor: "rgba(255,255,255,0.02)",
      backdropFilter: "blur(15px)",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
      height: "100%",
      display: "flex",
      flexDirection: "column", // Cambiado a column para acomodar título y preview
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      zIndex: 2
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
            <h1 style={styles.title}>
              {categoriaSeleccionada ? categoriaSeleccionada.nombre : "ORACIONES"}
            </h1>
          </header>

          <div style={{maxWidth: "500px", margin: "0 auto 40px auto", zIndex: 2, position: "relative", padding: "0 20px"}}>
            {categoriaSeleccionada && (
                <button style={styles.backBtn} className="hover-cyan" onClick={() => setCategoriaSeleccionada(null)}>
                  ← VOLVER AL ARCHIVO
                </button>
            )}
            <input 
              type="text"
              placeholder={categoriaSeleccionada ? "FILTRAR EN ESTA CATEGORÍA" : "BUSCAR CATEGORÍA U ORACIÓN"}
              style={styles.searchInput}
              className="search-focus"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center" style={{padding: '50px', zIndex: 2, position: 'relative'}}>
              <Spinner animation="grow" variant="info" size="sm" />
            </div>
          ) : (
            <Row className="gy-4 gx-4 justify-content-center">
              {!categoriaSeleccionada ? (
                <>
                  {/* SECCIÓN CATEGORÍAS */}
                  {categoriasFiltradas.length > 0 && (
                    <>
                      <Col xs={12}><div style={styles.sectionLabel}>Categorías</div></Col>
                      {categoriasFiltradas.map((c) => (
                        <Col key={`cat-${c.id}`} xs={11} md={4}>
                          <div style={styles.card} className="luxury-card-v2" onClick={() => cargarOracionesDeCategoria(c)}>
                            <span style={{ letterSpacing: "3px", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: "300" }}>
                              {c.nombre}
                            </span>
                          </div>
                        </Col>
                      ))}
                    </>
                  )}

                  {/* SECCIÓN BÚSQUEDA GLOBAL */}
                  {searchTerm.length > 1 && (
                    <>
                      <div style={styles.separator}></div>
                      <Col xs={12}><div style={styles.sectionLabel}>Resultados Globales de "{searchTerm}"</div></Col>
                      {globalOracionesFiltradas.length > 0 ? (
                        globalOracionesFiltradas.map((o) => (
                          <Col key={`glob-${o.id}`} xs={11} md={6}>
                            <div style={styles.card} className="luxury-card-v2" onClick={() => navigate(`/detalle/${o.id}`)}>
                              <h6 style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "#00d4ff", marginBottom: "10px", fontWeight: "400" }}>{o.titulo}</h6>
                              <p style={{ fontSize: "0.75rem", color: "#bbb", margin: 0, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", fontWeight: "300" }}>
                                {getPreviewTexto(o)}
                              </p>
                              <span style={{ fontSize: "0.6rem", color: "#555", marginTop: "8px", fontStyle: "italic" }}>{o.autor}</span>
                            </div>
                          </Col>
                        ))
                      ) : (
                        <Col xs={12} className="text-center" style={{color: '#444', fontSize: '0.7rem', letterSpacing: '2px'}}>NO SE ENCONTRARON ORACIONES</Col>
                      )}
                    </>
                  )}
                </>
              ) : (
                /* VISTA DE UNA CATEGORÍA SELECCIONADA */
                oracionesDeCategoriaFiltradas.length > 0 ? (
                  oracionesDeCategoriaFiltradas.map((o) => (
                    <Col key={`ora-${o.id}`} xs={11} md={6}>
                      <div style={styles.card} className="luxury-card-v2" onClick={() => navigate(`/detalle/${o.id}`)}>
                        <h6 style={{ fontSize: "0.75rem", letterSpacing: "2px", color: "#00d4ff", marginBottom: "12px", fontWeight: "400" }}>{o.titulo}</h6>
                        <p style={{ fontSize: "0.8rem", color: "#bbb", margin: 0, display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.6", fontWeight: "300" }}>
                          {getPreviewTexto(o)}
                        </p>
                        <span style={{ fontSize: "0.65rem", color: "#555", marginTop: "10px", fontStyle: "italic" }}>{o.autor}</span>
                      </div>
                    </Col>
                  ))
                ) : (
                  <Col xs={12} className="text-center" style={{color: '#444', fontSize: '0.7rem', letterSpacing: '2px'}}>CATEGORÍA VACÍA</Col>
                )
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

        .search-focus:focus {
          border-color: rgba(0, 212, 255, 0.8) !important;
          background: rgba(255,255,255,0.05) !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }
        
        .hover-cyan:hover { color: #fff !important; text-shadow: 0 0 10px #00d4ff; }
        ::placeholder { color: #444 !important; }
        .row { margin: 0 !important; }
      `}</style>
    </>
  );
};

export default OracionesList;