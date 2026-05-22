import { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import styles from "./Favoritos.module.css";

const Favoritos = () => {
  const { user, db } = useContext(AppContext);
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Protección de ruta */
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* Carga de favoritos de la base de datos de Capacitor */
  /* Carga de favoritos de la base de datos de Capacitor */
  const cargarFavoritos = async () => {
    if (!db || !user) return;
    try {
      setLoading(true);
      const res = await db.query(`
        SELECT o.id, o.titulo, o.parrafos, o.favorito, c.nombre AS categoria, 'es' AS idioma
        FROM oraciones o
        LEFT JOIN categorias c ON o.categoriaID = c.id
        WHERE o.favorito = 1

        UNION

        SELECT o.id, o.titulo, o.parrafos, o.favorito, c.nombre AS categoria, 'qu' AS idioma
        FROM oraciones_qu o
        LEFT JOIN categorias_qu c ON o.categoriaID = c.id
        WHERE o.favorito = 1

        UNION

        SELECT o.id, o.titulo, o.parrafos, o.favorito, c.nombre AS categoria, 'ay' AS idioma
        FROM oraciones_ay o
        LEFT JOIN categorias_ay c ON o.categoriaID = c.id
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

  /* Función para extraer el primer párrafo del JSON */
  const getPreview = (jsonParrafos) => {
    try {
      const p = JSON.parse(jsonParrafos);
      return p.length > 0 ? p[0] : "Sin contenido";
    } catch (e) {
      return "Error al cargar texto";
    }
  };

  return (
    <>
      <SideBar />
      
      <div className={styles.mainContainer}>
        
        {/* Encabezado editorial 1/5 de pantalla con Bokeh móvil encapsulado */}
        <div className={styles.topHeader}>
          <div className={styles.bokehContainer}>
            <div className={`${styles.bokeh} ${styles.p1}`} />
            <div className={`${styles.bokeh} ${styles.p2}`} />
            <div className={`${styles.bokeh} ${styles.p3}`} />
            <div className={`${styles.bokeh} ${styles.p4}`} />
          </div>
          
          <h1 className={styles.title}>Favoritas</h1>
        </div>

        {/* Panel inferior curvo (Bottom Sheet) */}
        <div className={styles.bottomSheet}>
          <Container fluid="md">
            
            {/* Etiqueta minimalista por encima del listado de favoritos */}
            <div className={styles.sectionLabelAboveList}>
              Tu lista personal
            </div>

            {loading ? (
              <div className={styles.spinnerWrapper}>
                <Spinner animation="grow" variant="info" size="sm" />
              </div>
            ) : (
              <Row className="g-2 justify-content-center">
                {favoritos.length === 0 ? (
                  <Col xs={12}>
                    <div className={styles.emptyMessage}>
                      No hay oraciones guardadas
                    </div>
                  </Col>
                ) : (
                  favoritos.map((o) => (
                    <Col key={o.id} xs={6} md={6}>
                      <div 
                        className={styles.prayerCard}
                        onClick={() => navigate(`/detalle/${o.id}`, { state: { idioma: o.idioma } })}
                      >
                        <div className={styles.cardMeta}>
                          <span className={styles.categoryTag}>
                            {o.categoria || "General"}
                          </span>
                          <h6 className={styles.prayerTitle}>
                            {o.titulo}
                          </h6>
                        </div>
                        <p className={styles.excerpt}>
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
      </div>
    </>
  );
};

export default Favoritos;