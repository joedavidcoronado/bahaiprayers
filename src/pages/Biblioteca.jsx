import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Spinner, Modal, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import styles from "./Biblioteca.module.css";

const Biblioteca = () => {
    const { db }       = useContext(AppContext);
    const navigate     = useNavigate();
    const location     = useLocation();

    const [view,                 setView]                 = useState("list");
    const [mensajes,             setMensajes]             = useState([]);
    const [mensajeSeleccionado,  setMensajeSeleccionado]  = useState(null);
    const [parrafos,             setParrafos]             = useState([]);
    const [loading,              setLoading]              = useState(false);
    const [showModal,            setShowModal]            = useState(false);
    const [parrafoAEditar,       setParrafoAEditar]       = useState(null);
    const [nuevoTitulo,          setNuevoTitulo]          = useState("");

    const cargarMensajes = async () => {
        if (!db) return;
        setLoading(true);
        try {
            const res = await db.query("SELECT * FROM biblioteca_mensajes ORDER BY id DESC");
            setMensajes(res.values || []);
        } finally {
            setLoading(false);
        }
    };

    const abrirMensaje = async (msg, parrafoIdToScroll = null) => {
        setLoading(true);
        try {
            const res = await db.query(
                "SELECT * FROM biblioteca_parrafos WHERE mensajeID = ? ORDER BY num_parrafo",
                [msg.id]
            );
            setParrafos(res.values || []);
            setMensajeSeleccionado(msg);
            setView("reading");
            sessionStorage.setItem('biblioteca_mensaje_activo', JSON.stringify(msg));

            if (parrafoIdToScroll) {
                setTimeout(() => {
                    const elemento = document.getElementById(`parrafo-${parrafoIdToScroll}`);
                    if (elemento) elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            } else {
                window.scrollTo(0, 0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (db) {
            cargarMensajes();
            const savedMsg      = sessionStorage.getItem('biblioteca_mensaje_activo');
            const savedScrollPos = sessionStorage.getItem('biblioteca_scroll_id');

            if (savedMsg && location.pathname === '/biblioteca') {
                const msg = JSON.parse(savedMsg);
                abrirMensaje(msg, savedScrollPos);
                sessionStorage.removeItem('biblioteca_scroll_id');
            }
        }
    }, [db]);

    const handleOpenModal = (p) => {
        setParrafoAEditar(p);
        setNuevoTitulo(p.titulo_luxury || "");
        setShowModal(true);
    };

    const handleSaveTitle = async () => {
        if (!parrafoAEditar) return;
        await db.run(
            "UPDATE biblioteca_parrafos SET titulo_luxury = ? WHERE id = ?",
            [nuevoTitulo.toUpperCase().trim(), parrafoAEditar.id]
        );
        const res = await db.query(
            "SELECT * FROM biblioteca_parrafos WHERE mensajeID = ? ORDER BY num_parrafo",
            [mensajeSeleccionado.id]
        );
        setParrafos(res.values || []);
        setShowModal(false);
    };

    const irAReflexiones = (p_id) => {
        sessionStorage.setItem('biblioteca_scroll_id', p_id);
        navigate(`/reflexiones/${p_id}`);
    };

    const volverALista = () => {
        sessionStorage.removeItem('biblioteca_mensaje_activo');
        sessionStorage.removeItem('biblioteca_scroll_id');
        setView("list");
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

                <Container>
                    {view === "list" ? (

                        /* ── Vista lista ── */
                        <div style={{ position: "relative", zIndex: 2 }}>
                            <h2 className={styles.title}>BIBLIOTECA</h2>

                            {loading ? (
                                <div className="text-center mt-5">
                                    <Spinner animation="grow" variant="info" size="sm" />
                                </div>
                            ) : (
                                <Row className="justify-content-center">
                                    {mensajes.map((m) => (
                                        <Col md={6} key={m.id}>
                                            <div
                                                className={styles.card}
                                                onClick={() => abrirMensaje(m)}
                                            >
                                                <small className={styles.cardFecha}>{m.fecha}</small>
                                                <h5 className={`fw-light mt-2 ${styles.cardTitulo}`}>{m.titulo}</h5>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>

                    ) : (

                        /* ── Vista lectura ── */
                        <div style={{ position: "relative", zIndex: 2 }}>
                            <button className={styles.backBtn} onClick={volverALista}>
                                ← VOLVER AL ARCHIVO
                            </button>

                            <div className={styles.readingWrapper}>
                                <h3 className={`text-center mb-5 fw-light ${styles.readingTitle}`}>
                                    {mensajeSeleccionado?.titulo}
                                </h3>

                                {parrafos.map((p) => (
                                    <div
                                        key={p.id}
                                        id={`parrafo-${p.id}`}
                                        className="mb-5 animate__animated animate__fadeIn"
                                    >
                                        {p.titulo_luxury && (
                                            <span className={styles.luxuryGray}>{p.titulo_luxury}</span>
                                        )}

                                        <div className="d-flex align-items-start">
                                            <span
                                                className={styles.paraNum}
                                                onClick={() => handleOpenModal(p)}
                                            >
                                                {p.num_parrafo.toString().padStart(2, '0')}
                                            </span>
                                            <p
                                                className={styles.paraTexto}
                                                onClick={() => irAReflexiones(p.id)}
                                            >
                                                {p.texto}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    )}
                </Container>
            </div>

            {/* Modal editar subtítulo */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <div className={styles.modalContent}>
                    <Modal.Header className={styles.modalHeader}>
                        <Modal.Title className={styles.modalTitle}>EDITAR SUBTÍTULO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            type="text"
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            className={styles.modalInput}
                            placeholder="Escribe un título para este párrafo..."
                            autoFocus
                        />
                    </Modal.Body>
                    <Modal.Footer className={styles.modalFooter}>
                        <Button
                            variant="link"
                            className={styles.modalCancelBtn}
                            onClick={() => setShowModal(false)}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            variant="outline-info"
                            className={styles.modalSaveBtn}
                            onClick={handleSaveTitle}
                        >
                            GUARDAR
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
};

export default Biblioteca;