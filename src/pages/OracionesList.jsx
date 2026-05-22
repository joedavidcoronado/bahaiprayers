import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import styles from "./OracionesList.module.css";

// 👇 sufijo de tabla según idioma
const getSufijo = (idioma) => idioma === "es" ? "" : `_${idioma}`;

const IDIOMAS = [
    { code: "es", label: "Español" },
    { code: "qu", label: "Quechua" },
    { code: "ay", label: "Aymara"  },
];

const OracionesList = () => {
    const [idioma,                setIdioma]                = useState("es"); // 👈 nuevo
    const [categorias,            setCategorias]            = useState([]);
    const [todasLasOraciones,     setTodasLasOraciones]     = useState([]);
    const [oracionesPorCategoria, setOracionesPorCategoria] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [loading,               setLoading]               = useState(true);
    const [searchTerm,            setSearchTerm]            = useState("");

    const navigate = useNavigate();
    const { user, db } = useContext(AppContext);

    /* Protección de ruta */
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    /* Carga inicial — se re-ejecuta al cambiar idioma 👇 */
    useEffect(() => {
        const initData = async () => {
            if (!db) return;
            const s = getSufijo(idioma);
            try {
                setLoading(true);
                setCategoriaSeleccionada(null); // reset al cambiar idioma
                setSearchTerm("");

                const resCat = await db.query(`SELECT * FROM categorias${s} ORDER BY nombre ASC;`);
                setCategorias(resCat.values || []);

                const resOra = await db.query(`SELECT id, titulo, parrafos, autor FROM oraciones${s};`);
                setTodasLasOraciones(resOra.values || []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [db, idioma]); // 👈 idioma como dependencia

    /* Cargar oraciones de una categoría */
    const cargarOracionesDeCategoria = async (cat) => {
        const s = getSufijo(idioma);
        setLoading(true);
        try {
            const resOra = await db.query(
                `SELECT id, titulo, parrafos, autor FROM oraciones${s} WHERE categoriaID = ?;`,
                [cat.id]
            );
            setOracionesPorCategoria(resOra.values || []);
            setCategoriaSeleccionada(cat);
            setSearchTerm("");
        } catch (error) {
            console.error("Error cargando oraciones:", error);
        } finally {
            setLoading(false);
        }
    };

    /* Preview del primer párrafo — sin tocar */
    const getPreviewTexto = useCallback((o) => {
        try {
            const p = JSON.parse(o.parrafos);
            return p.length > 0 ? p[0] : "";
        } catch {
            return "";
        }
    }, []);

    /* Filtros — sin tocar */
    const categoriasFiltradas = useMemo(() => {
        if (!searchTerm) return categorias;
        const term = searchTerm.toLowerCase();
        return categorias.filter(c => c.nombre.toLowerCase().includes(term));
    }, [categorias, searchTerm]);

    const globalOracionesFiltradas = useMemo(() => {
        if (searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();
        return todasLasOraciones.filter(o => {
            const titulo   = (o.titulo   || "").toLowerCase();
            const autor    = (o.autor    || "").toLowerCase();
            const parrafos = (o.parrafos || "").toLowerCase();
            return titulo.includes(term) || autor.includes(term) || parrafos.includes(term);
        }).slice(0, 20);
    }, [todasLasOraciones, searchTerm]);

    const oracionesDeCategoriaFiltradas = useMemo(() => {
        if (!searchTerm) return oracionesPorCategoria;
        const term = searchTerm.toLowerCase();
        return oracionesPorCategoria.filter(o => {
            const titulo   = (o.titulo   || "").toLowerCase();
            const autor    = (o.autor    || "").toLowerCase();
            const parrafos = (o.parrafos || "").toLowerCase();
            return titulo.includes(term) || autor.includes(term) || parrafos.includes(term);
        });
    }, [oracionesPorCategoria, searchTerm]);

    return (
        <>
            <SideBar />
            <div className={styles.mainContainer}>

                {/* 1/5 de pantalla: Cuadrado Verde Oscuro */}
                <div className={styles.topHeader}>
                    <div className={styles.bokehContainer}>
                        <div className={`${styles.bokeh} ${styles.p1}`} />
                        <div className={`${styles.bokeh} ${styles.p2}`} />
                        <div className={`${styles.bokeh} ${styles.p3}`} />
                        <div className={`${styles.bokeh} ${styles.p4}`} />
                    </div>

                    <h1 className={styles.title}>
                        {categoriaSeleccionada ? categoriaSeleccionada.nombre : "ORACIONES"}
                    </h1>

                    {/* 👇 Botones de idioma */}
                    <div className={styles.idiomaSelector}>
                        {IDIOMAS.map(({ code, label }) => (
                            <button
                                key={code}
                                className={`${styles.idiomaBtn} ${idioma === code ? styles.idiomaBtnActivo : ""}`}
                                onClick={() => setIdioma(code)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenedor Inferior — sin tocar */}
                <div className={styles.bottomSheet}>
                    <Container fluid="md">
                        <div className={styles.sectionLabelAboveSearch}>
                            {categoriaSeleccionada ? "Filtrar Oraciones" : "Categorías"}
                        </div>

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

                        {loading ? (
                            <div className={styles.spinnerWrapper}>
                                <Spinner animation="grow" variant="info" size="sm" />
                            </div>
                        ) : (
                            <Row className="g-2 justify-content-center">
                                {!categoriaSeleccionada ? (
                                    <>
                                        {categoriasFiltradas.map((c) => (
                                            <Col key={`cat-${c.id}`} xs={6} sm={4} md={3}>
                                                <div
                                                    className={styles.card}
                                                    onClick={() => cargarOracionesDeCategoria(c)}
                                                >
                                                    <span className={styles.cardCatName}>{c.nombre}</span>
                                                </div>
                                            </Col>
                                        ))}

                                        {searchTerm.length > 1 && (
                                            <>
                                                <div className={styles.separator} />
                                                <Col xs={12}>
                                                    <div className={styles.sectionLabel}>
                                                        Resultados de "{searchTerm}"
                                                    </div>
                                                </Col>
                                                {globalOracionesFiltradas.length > 0 ? (
                                                    globalOracionesFiltradas.map((o) => (
                                                        <Col key={`glob-${o.id}`} xs={12} md={6}>
                                                            <div
                                                                className={styles.prayerCard}
                                                                onClick={() => navigate(`/detalle/${o.id}`, { state: { idioma } })}
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
                                    oracionesDeCategoriaFiltradas.length > 0 ? (
                                        oracionesDeCategoriaFiltradas.map((o) => (
                                            <Col key={`ora-${o.id}`} xs={12} md={6}>
                                                <div
                                                    className={styles.prayerCardLg}
                                                    onClick={() => navigate(`/detalle/${o.id}`, { state: { idioma } })}
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
            </div>
        </>
    );
};

export default OracionesList;