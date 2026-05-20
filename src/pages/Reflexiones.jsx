import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Spinner, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import styles from "./Reflexiones.module.css";

const Reflexiones = () => {
    const { id }       = useParams();
    const { db }       = useContext(AppContext);
    const navigate     = useNavigate();

    const [parrafo,           setParrafo]           = useState(null);
    const [notas,             setNotas]             = useState([]);
    const [newNote,           setNewNote]           = useState("");
    const [loading,           setLoading]           = useState(true);
    const [showEditModal,     setShowEditModal]     = useState(false);
    const [notaAEditar,       setNotaAEditar]       = useState(null);
    const [contenidoEditado,  setContenidoEditado]  = useState("");

    /* Carga de datos */
    const cargarDatos = async () => {
        if (!db) return;
        setLoading(true);
        try {
            const resP = await db.query("SELECT * FROM biblioteca_parrafos WHERE id = ?", [id]);
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

    /* CRUD notas */
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

    const eliminarNota = async (notaId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este pensamiento?")) return;
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

    /* Loading state */
    if (loading) return (
        <div className={`${styles.spinnerPage} d-flex justify-content-center align-items-center`}>
            <Spinner variant="info" />
        </div>
    );

    return (
        <>
            <SideBar />

            <div className={styles.page}>
                <Container className={styles.container}>

                    {/* Volver */}
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← VOLVER A LA LECTURA
                    </button>

                    {/* Contexto del párrafo */}
                    <div className="mb-5">
                        <small className={styles.parrafoLabel}>
                            Párrafo en reflexión {parrafo?.num_parrafo?.toString().padStart(2, '0')}
                        </small>
                        <p className={styles.parrafoTexto}>"{parrafo?.texto}"</p>
                    </div>

                    <hr className={styles.hr} />

                    {/* Input de nueva nota */}
                    <div className="mb-5">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Anota tu reflexión aquí..."
                            className={styles.textarea}
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <Button
                            variant="outline-info"
                            className={`w-100 mt-3 ${styles.saveBtn}`}
                            onClick={guardarNota}
                        >
                            GUARDAR PENSAMIENTO
                        </Button>
                    </div>

                    {/* Listado de notas */}
                    <div>
                        {notas.map((n) => (
                            <div key={n.id} className={`mb-4 p-4 ${styles.noteCard}`}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className={styles.noteFecha}>{n.fecha_creacion}</div>
                                    <div>
                                        <button
                                            className={styles.noteActionBtn}
                                            style={{ marginRight: "15px" }}
                                            onClick={() => abrirEdicion(n)}
                                        >
                                            EDITAR
                                        </button>
                                        <button
                                            className={`${styles.noteActionBtn} ${styles.noteActionBtnDanger}`}
                                            onClick={() => eliminarNota(n.id)}
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                </div>
                                <p className={styles.noteTexto}>{n.comentario}</p>
                            </div>
                        ))}
                    </div>

                </Container>
            </div>

            {/* Modal editar nota */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <div className={styles.modalWrapper}>
                    <Modal.Header className={styles.modalHeader}>
                        <Modal.Title className={styles.modalTitle}>EDITAR PENSAMIENTO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={contenidoEditado}
                            onChange={(e) => setContenidoEditado(e.target.value)}
                            className={styles.textarea}
                        />
                    </Modal.Body>
                    <Modal.Footer className={styles.modalFooter}>
                        <Button
                            variant="link"
                            className={styles.modalCancelBtn}
                            onClick={() => setShowEditModal(false)}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            variant="outline-info"
                            className={styles.modalSaveBtn}
                            onClick={guardarEdicion}
                        >
                            ACTUALIZAR
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
};

export default Reflexiones;