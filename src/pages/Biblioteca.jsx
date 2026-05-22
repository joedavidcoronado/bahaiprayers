import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Spinner, Modal, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import styles from "./Biblioteca.module.css";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';

const Biblioteca = () => {
    const { db }       = useContext(AppContext);
    const navigate     = useNavigate();
    const location     = useLocation();

    const [view,                   setView]                 = useState("list");
    const [mensajes,             setMensajes]             = useState([]);
    const [mensajeSeleccionado,  setMensajeSeleccionado]  = useState(null);
    const [parrafos,             setParrafos]             = useState([]);
    const [loading,               setLoading]              = useState(false);
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

    const handleDownloadPDF = async (e, msg) => {
        e.stopPropagation(); 

        const idEscrito = msg?.id || msg?.ID || msg?.mensajeID;

        if (!idEscrito) {
            alert("No se pudo determinar el identificador de este escrito.");
            return;
        }

        try {
            const pdfUrl = `./pdfs/${idEscrito}.pdf`; 
            const tempFileName = `${msg.fecha}_${msg.titulo}.pdf`;

            const response = await fetch(pdfUrl);
            if (!response.ok) {
                throw new Error(`No se encontró el PDF con el nombre: ${idEscrito}.pdf`);
            }

            const blob = await response.blob();

            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error("Error al convertir el PDF a Base64"));
                reader.onload = () => {
                    const rawBase64 = reader.result.split(',')[1];
                    resolve(rawBase64);
                };
                reader.readAsDataURL(blob);
            });

            const writeResult = await Filesystem.writeFile({
                path: tempFileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await FileOpener.openFile({
                path: writeResult.uri,
                mimeType: 'application/pdf'
            });

        } catch (error) {
            console.error("Error en el flujo nativo de Android:", error);
            alert("Error al intentar abrir el PDF. Verifica que el archivo exista en public/pdfs/ y coincida exactamente con el ID.");
        }
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

                <div className={styles.topHeader}>
                    <div className={styles.bokehContainer}>
                        <div className={`${styles.bokeh} ${styles.p1}`} />
                        <div className={`${styles.bokeh} ${styles.p2}`} />
                        <div className={`${styles.bokeh} ${styles.p3}`} />
                        <div className={`${styles.bokeh} ${styles.p4}`} />
                    </div>

                    <h1 className={styles.title}>
                        {view === "list" ? "Biblioteca" : "Lectura"}
                    </h1>
                </div>

                <div className={styles.bottomSheet}>
                    <Container fluid="md">
                        {view === "list" ? (

                            /* ── VISTA LISTA ── */
                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div className={styles.sectionLabelAboveSearch}>
                                    Colección de Escritos
                                </div>

                                {loading ? (
                                    <div className={styles.spinnerWrapper}>
                                        <Spinner animation="grow" variant="dark" size="sm" />
                                    </div>
                                ) : (
                                    <Row className="g-3 justify-content-center">
                                        {mensajes.length > 0 ? (
                                            mensajes.map((m) => (
                                                <Col xs={12} key={m.id}>
                                                    <div className={styles.card} onClick={() => abrirMensaje(m)}>
                                                        <div className={styles.cardHeaderFlex}>
                                                            <span className={styles.cardFecha}>{m.fecha || "Sin fecha"}</span>
                                                            
                                                            <button 
                                                                className={styles.cardDownloadBtn} 
                                                                onClick={(e) => handleDownloadPDF(e, m)}
                                                                aria-label="Descargar escrito en PDF"
                                                            >
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    width="15" 
                                                                    height="15" 
                                                                    fill="currentColor" 
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <h6 className={styles.cardTitulo}>{m.titulo}</h6>
                                                    </div>
                                                </Col>
                                            ))
                                        ) : (
                                            <Col xs={12}>
                                                <p className={styles.emptyMsg}>No hay escritos disponibles</p>
                                            </Col>
                                        )}
                                    </Row>
                                )}
                            </div>

                        ) : (

                            /* ── VISTA LECTURA EDITORIAL ── */
                            <div style={{ position: "relative", zIndex: 2 }}>
                                <button className={styles.backBtn} onClick={volverALista}>
                                    ← VOLVER AL ARCHIVO
                                </button>

                                <div className={styles.separator} />

                                <div className={styles.readingWrapper}>
                                    <h2 className={styles.readingTitle}>
                                        {mensajeSeleccionado?.titulo}
                                    </h2>

                                    {loading ? (
                                        <div className={styles.spinnerWrapper}>
                                            <Spinner animation="grow" variant="dark" size="sm" />
                                        </div>
                                    ) : (
                                        <div className={styles.paragraphsContainer}>
                                            {parrafos.map((p, index) => {
                                                const esPrimero = index === 0;
                                                const esUltimo = index === parrafos.length - 1;
                                                const seNumera = !esPrimero && !esUltimo;

                                                return (
                                                    <div
                                                        key={p.id}
                                                        id={`parrafo-${p.id}`}
                                                        className="animate__animated animate__fadeIn"
                                                    >
                                                        {p.titulo_luxury && (
                                                            <span className={styles.luxuryGray}>{p.titulo_luxury}</span>
                                                        )}

                                                        <div className={styles.paraRow}>
                                                            {seNumera && (
                                                                <span
                                                                    className={styles.paraNum}
                                                                    onClick={() => handleOpenModal(p)}
                                                                >
                                                                    {String(p.num_parrafo - 1).padStart(2, '0')}
                                                                </span>
                                                            )}
                                                            <p
                                                                className={styles.paraTexto}
                                                                style={esUltimo ? {
                                                                    textAlign: 'right',
                                                                    fontFamily: 'Georgia, serif', // Cambia aquí a tu fuente preferida
                                                                    color: '#888888',             // Cambia aquí al color que desees
                                                                    width: '100%'
                                                                } : {}}
                                                                onClick={seNumera ? () => irAReflexiones(p.id) : null}
                                                            >
                                                                {p.texto}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        )}
                    </Container>
                </div>
            </div>

            {/* MODAL DE EDICIÓN CON ESTILO LUXURY */}
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