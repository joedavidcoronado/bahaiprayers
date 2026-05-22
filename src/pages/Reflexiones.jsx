import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Spinner, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import styles from "./Reflexiones.module.css";

const Reflexiones = () => {
    const { id }      = useParams();
    const { db }      = useContext(AppContext);
    const navigate    = useNavigate();

    const [parrafo,          setParrafo]          = useState(null);
    const [notas,            setNotas]            = useState([]);
    const [newNote,          setNewNote]          = useState("");
    const [loading,          setLoading]          = useState(true);
    const [showEditModal,    setShowEditModal]    = useState(false);
    const [notaAEditar,      setNotaAEditar]      = useState(null);
    const [contenidoEditado, setContenidoEditado] = useState("");
    const [expandido,        setExpandido]        = useState(false);

    const cargarDatos = async () => {
        if (!db) return;
        setLoading(true);
        try {
            const resP = await db.query(
                "SELECT * FROM biblioteca_parrafos WHERE id = ?", [id]
            );
            setParrafo(resP.values[0]);

            const resN = await db.query(
                "SELECT * FROM biblioteca_notas WHERE parrafoID = ? ORDER BY id DESC", [id]
            );
            setNotas(resN.values || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (db) cargarDatos(); }, [db, id]);

    const guardarNota = async () => {
        if (!newNote.trim()) return;
        const fecha = new Date().toLocaleString();
        await db.run(
            "INSERT INTO biblioteca_notas (parrafoID, comentario, fecha_creacion) VALUES (?, ?, ?)",
            [id, newNote, fecha]
        );
        setNewNote("");
        cargarDatos();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            guardarNota();
        }
    };

    const eliminarNota = async (notaId) => {
        if (!window.confirm("¿Eliminar este pensamiento?")) return;
        await db.run("DELETE FROM biblioteca_notas WHERE id = ?", [notaId]);
        cargarDatos();
    };

    const abrirEdicion = (nota) => {
        setNotaAEditar(nota);
        setContenidoEditado(nota.comentario);
        setShowEditModal(true);
    };

    const guardarEdicion = async () => {
        if (!contenidoEditado.trim() || !notaAEditar) return;
        await db.run(
            "UPDATE biblioteca_notas SET comentario = ? WHERE id = ?",
            [contenidoEditado, notaAEditar.id]
        );
        setShowEditModal(false);
        setNotaAEditar(null);
        cargarDatos();
    };

    if (loading) return (
        <div className={`${styles.spinnerPage} d-flex justify-content-center align-items-center`}>
            <Spinner animation="grow" style={{ color: "#276e4a" }} />
        </div>
    );

    return (
        <>
            <SideBar />

            <div className={styles.page}>
                <Container className={styles.container}>

                    {/* Volver */}
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← Volver a la lectura
                    </button>

                    {/* ── Párrafo de referencia ── */}
                    <div className={styles.parrafoCard}>
                        <small className={styles.parrafoLabel}>
                            Párrafo {(parrafo?.num_parrafo - 1)?.toString().padStart(2, '0')}
                        </small>
                        <p className={`${styles.parrafoTexto} ${expandido ? '' : styles.collapsed}`}>
                            "{parrafo?.texto}"
                        </p>
                        <button
                            className={styles.leerMasBtn}
                            onClick={() => setExpandido(!expandido)}
                        >
                            {expandido ? '↑ Contraer' : 'Leer más →'}
                        </button>
                    </div>

                    {/* ── Contador ── */}
                    <div className={styles.notasCounter}>
                        <span className={styles.notasCounterLabel}>Tus pensamientos</span>
                        <span className={styles.notasCounterBadge}>{notas.length}</span>
                    </div>

                    {/* ── Timeline de notas ── */}
                    {notas.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>✦</div>
                            <p className={styles.emptyMsg}>Aún no hay reflexiones guardadas</p>
                        </div>
                    ) : (
                        <div className={styles.timeline}>
                            {notas.map((n, index) => (
                                <div
                                    key={n.id}
                                    className={styles.timelineItem}
                                    style={{ animationDelay: `${index * 0.06}s` }}
                                >
                                    <div className={styles.timelineDot} />
                                    <div className={styles.noteCard}>
                                        <div className={styles.noteCardTop}>
                                            <span className={styles.noteFecha}>{n.fecha_creacion}</span>
                                            <div className={styles.noteActions}>
                                                <button
                                                    className={styles.noteActionBtn}
                                                    onClick={() => abrirEdicion(n)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className={`${styles.noteActionBtn} ${styles.noteActionBtnDanger}`}
                                                    onClick={() => eliminarNota(n.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                        <p className={styles.noteTexto}>{n.comentario}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </Container>
            </div>

            {/* ── Input flotante ── */}
            <div className={styles.floatingInputBar}>
                <div className={styles.floatingInputInner}>
                    <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Anota tu reflexión..."
                        className={styles.floatingTextarea}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.floatingSendBtn} onClick={guardarNota}>
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Modal editar ── */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <div className={styles.modalWrapper}>
                    <Modal.Header className={styles.modalHeader}>
                        <Modal.Title className={styles.modalTitle}>Editar pensamiento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalBody}>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={contenidoEditado}
                            onChange={(e) => setContenidoEditado(e.target.value)}
                            className={styles.modalTextarea}
                        />
                    </Modal.Body>
                    <Modal.Footer className={styles.modalFooter}>
                        <Button
                            variant="link"
                            className={styles.modalCancelBtn}
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className={styles.modalSaveBtn}
                            onClick={guardarEdicion}
                        >
                            Actualizar
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
};

export default Reflexiones;