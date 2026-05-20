import { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import styles from "./OracionesList.module.css";

const OracionesList = () => {
    const [categorias,            setCategorias]            = useState([]);
    const [todasLasOraciones,     setTodasLasOraciones]     = useState([]);
    const [oracionesPorCategoria, setOracionesPorCategoria] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [loading,               setLoading]               = useState(true);
    const [searchTerm,            setSearchTerm]            = useState("");

    const navigate    = useNavigate();
    const { user, db } = useContext(AppContext);

    /* Protección de ruta */
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    /* Carga inicial */
    useEffect(() => {
        const initData = async () => {
            if (!db) return;
            try {
                setLoading(true);
                const resCat = await db.query("SELECT * FROM categorias ORDER BY nombre ASC;");
                setCategorias(resCat.values || []);

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

    /* Cargar oraciones de una categoría */
    const cargarOracionesDeCategoria = async (cat) => {
        setLoading(true);
        try {
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

    /* Filtros */
    const filtrarOracion = (o) => {
        const term    = searchTerm.toLowerCase();
        const titulo  = (o.titulo   || "").toLowerCase();
        const autor   = (o.autor    || "").toLowerCase();
        const parrafos = (o.parrafos || "").toLowerCase();
        return titulo.includes(term) || autor.includes(term) || parrafos.includes(term);
    };

    const categoriasFiltradas         = categorias.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const globalOracionesFiltradas    = todasLasOraciones.filter(filtrarOracion).slice(0, 20);
    const oracionesDeCategoriaFiltradas = oracionesPorCategoria.filter(filtrarOracion);

    /* Preview del primer párrafo */
    const getPreviewTexto = (o) => {
        try {
            const p = JSON.parse(o.parrafos);
            return p.length > 0 ? p[0] : "";
        } catch {
            return "";
        }
    };

    return (
        <>
            <SideBar />

            <div className={styles.mainContainer}>

                {/* Bokeh */}
                <div className={styles.bokehContainer}>
                    <div className={`${styles.bokeh} ${styles.p1}`} />
                    <div className={`${styles.bokeh} ${styles.p2}`} />
                    <div className={`${styles.bokeh} ${styles.p3}`} />
                    <div className={`${styles.bokeh} ${styles.p4}`} />
                </div>

                <Container fluid="md">

                    <header>
                        <h1 className={styles.title}>
                            {categoriaSeleccionada ? categoriaSeleccionada.nombre : "ORACIONES"}
                        </h1>
                    </header>

                    {/* Buscador */}
                    <div className={styles.searchWrapper}>
                        {categoriaSeleccionada && (
                            <button
                                className={styles.backBtn}
                                onClick={() => setCategoriaSeleccionada(null)}
                            >
                                ← VOLVER AL ARCHIVO
                            </button>
                        )}
                        <input
                            type="text"
                            placeholder={categoriaSeleccionada ? "FILTRAR EN ESTA CATEGORÍA" : "BUSCAR CATEGORÍA U ORACIÓN"}
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className={styles.spinnerWrapper}>
                            <Spinner animation="grow" variant="info" size="sm" />
                        </div>
                    ) : (
                        <Row className="gy-4 gx-4 justify-content-center">

                            {!categoriaSeleccionada ? (
                                <>
                                    {/* Categorías */}
                                    {categoriasFiltradas.length > 0 && (
                                        <>
                                            <Col xs={12}>
                                                <div className={styles.sectionLabel}>Categorías</div>
                                            </Col>
                                            {categoriasFiltradas.map((c) => (
                                                <Col key={`cat-${c.id}`} xs={11} md={4}>
                                                    <div
                                                        className={styles.card}
                                                        onClick={() => cargarOracionesDeCategoria(c)}
                                                    >
                                                        <span className={styles.cardCatName}>{c.nombre}</span>
                                                    </div>
                                                </Col>
                                            ))}
                                        </>
                                    )}

                                    {/* Búsqueda global */}
                                    {searchTerm.length > 1 && (
                                        <>
                                            <div className={styles.separator} />
                                            <Col xs={12}>
                                                <div className={styles.sectionLabel}>
                                                    Resultados Globales de "{searchTerm}"
                                                </div>
                                            </Col>
                                            {globalOracionesFiltradas.length > 0 ? (
                                                globalOracionesFiltradas.map((o) => (
                                                    <Col key={`glob-${o.id}`} xs={11} md={6}>
                                                        <div
                                                            className={styles.card}
                                                            onClick={() => navigate(`/detalle/${o.id}`)}
                                                        >
                                                            <h6 className={styles.cardTitle}>{o.titulo}</h6>
                                                            <p className={styles.cardPreview}>{getPreviewTexto(o)}</p>
                                                            <span className={styles.cardAutor}>{o.autor}</span>
                                                        </div>
                                                    </Col>
                                                ))
                                            ) : (
                                                <Col xs={12}>
                                                    <p className={styles.emptyMsg}>NO SE ENCONTRARON ORACIONES</p>
                                                </Col>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                /* Vista de categoría seleccionada */
                                oracionesDeCategoriaFiltradas.length > 0 ? (
                                    oracionesDeCategoriaFiltradas.map((o) => (
                                        <Col key={`ora-${o.id}`} xs={11} md={6}>
                                            <div
                                                className={styles.card}
                                                onClick={() => navigate(`/detalle/${o.id}`)}
                                            >
                                                <h6 className={styles.cardTitleLg}>{o.titulo}</h6>
                                                <p className={styles.cardPreviewLg}>{getPreviewTexto(o)}</p>
                                                <span className={styles.cardAutorLg}>{o.autor}</span>
                                            </div>
                                        </Col>
                                    ))
                                ) : (
                                    <Col xs={12}>
                                        <p className={styles.emptyMsg}>CATEGORÍA VACÍA</p>
                                    </Col>
                                )
                            )}

                        </Row>
                    )}
                </Container>
            </div>
        </>
    );
};

export default OracionesList;