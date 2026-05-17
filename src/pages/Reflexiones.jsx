import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Spinner, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom"; 
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";

const Reflexiones = () => {
    const { id } = useParams(); 
    const { db } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [parrafo, setParrafo] = useState(null);
    const [notas, setNotas] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(true);

    // Estados para editar notas
    const [showEditModal, setShowEditModal] = useState(false);
    const [notaAEditar, setNotaAEditar] = useState(null);
    const [contenidoEditado, setContenidoEditado] = useState("");

    const cargarDatos = async () => {
        if (!db) return;
        setLoading(true);
        try {
            const resP = await db.query("SELECT * FROM biblioteca_parrafos WHERE id = ?", [id]);
            setParrafo(resP.values[0]);

            const resN = await db.query("SELECT * FROM biblioteca_notas WHERE parrafoID = ? ORDER BY id DESC", [id]);
            setNotas(resN.values || []);
        } finally { setLoading(false); }
    };

    const guardarNota = async () => {
        if (!newNote.trim()) return;
        const fecha = new Date().toLocaleString();
        await db.run("INSERT INTO biblioteca_notas (parrafoID, comentario, fecha_creacion) VALUES (?, ?, ?)", [id, newNote, fecha]);
        setNewNote("");
        cargarDatos();
    };

    // Funciones para Eliminar y Editar
    const eliminarNota = async (notaId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este pensamiento?")) {
            await db.run("DELETE FROM biblioteca_notas WHERE id = ?", [notaId]);
            cargarDatos();
        }
    };

    const abrirEdicion = (nota) => {
        setNotaAEditar(nota);
        setContenidoEditado(nota.comentario);
        setShowEditModal(true);
    };

    const guardarEdicion = async () => {
        if (!contenidoEditado.trim() || !notaAEditar) return;
        await db.run("UPDATE biblioteca_notas SET comentario = ? WHERE id = ?", [contenidoEditado, notaAEditar.id]);
        setShowEditModal(false);
        setNotaAEditar(null);
        cargarDatos();
    };

    useEffect(() => { if (db) cargarDatos(); }, [db, id]);

    if (loading) return <div style={{background:"#000", height:"100vh"}} className="d-flex justify-content-center align-items-center"><Spinner variant="info" /></div>;

    const truncarEstilo = {
        display: "-webkit-box",
        WebkitLineClamp: "3", // Limita exactamente a 3 líneas
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "1rem", 
        fontWeight: "200", 
        fontStyle: "italic", 
        opacity: 0.6, 
        marginTop: "15px", 
        lineHeight: "1.8",
        textAlign: "justify"
    };

    return (
        <>
            <SideBar />
            <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#fff", padding: "100px 0", fontFamily: "'Inter', sans-serif" }}>
                <Container style={{ maxWidth: "700px" }}>
                    <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#666", letterSpacing: "3px", fontSize: "0.7rem", marginBottom: "50px", cursor: "pointer" }} className="hover-cyan-btn">
                        ← VOLVER A LA LECTURA
                    </button>

                    {/* CONTEXTO DEL PÁRRAFO TRUNCADO */}
                    <div className="mb-5">
                        <small style={{ color: "#00d4ff", letterSpacing: "5px", textTransform: "uppercase", fontSize: "0.6rem" }}>
                            Párrafo en reflexión {parrafo?.num_parrafo?.toString().padStart(2, '0')}
                        </small>
                        <p style={truncarEstilo}>
                            "{parrafo?.texto}"
                        </p>
                    </div>

                    <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "40px 0" }} />

                    {/* INPUT DE NOTAS */}
                    <div className="mb-5">
                        <Form.Control 
                            as="textarea" rows={3} 
                            placeholder="Anota tu reflexión aquí..."
                            style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid #333", borderRadius: "4px", padding: "20px" }}
                            className="custom-textarea"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <Button variant="outline-info" className="w-100 mt-3" style={{ letterSpacing: "3px", fontSize: "0.8rem", borderRadius: "2px" }} onClick={guardarNota}>
                            GUARDAR PENSAMIENTO
                        </Button>
                    </div>

                    {/* LISTADO DE NOTAS */}
                    <div>
                        {notas.map(n => (
                            <div key={n.id} className="mb-4 p-4" style={{ background: "rgba(255,255,255,0.02)", borderLeft: "1px solid #00d4ff", position: "relative" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div style={{ fontSize: "0.65rem", color: "#00d4ff", letterSpacing: "2px" }}>{n.fecha_creacion}</div>
                                    <div>
                                        <button onClick={() => abrirEdicion(n)} style={{ background: "none", border: "none", color: "#888", fontSize: "0.65rem", letterSpacing: "1px", marginRight: "15px", cursor: "pointer" }} className="hover-cyan-text">EDITAR</button>
                                        <button onClick={() => eliminarNota(n.id)} style={{ background: "none", border: "none", color: "#888", fontSize: "0.65rem", letterSpacing: "1px", cursor: "pointer" }} className="hover-red-text">ELIMINAR</button>
                                    </div>
                                </div>
                                <p style={{ fontWeight: "300", lineHeight: "1.7", color: "#bbb", whiteSpace: "pre-wrap" }}>{n.comentario}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            {/* MODAL PARA EDITAR NOTA */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <div style={{ backgroundColor: "#111", color: "#fff", border: "1px solid rgba(0, 212, 255, 0.3)", borderRadius: "4px" }}>
                    <Modal.Header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <Modal.Title style={{ fontSize: "1rem", letterSpacing: "2px", fontWeight: "300" }}>EDITAR PENSAMIENTO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control 
                            as="textarea" rows={5} 
                            value={contenidoEditado} 
                            onChange={(e) => setContenidoEditado(e.target.value)}
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                            className="custom-textarea"
                        />
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: "none" }}>
                        <Button variant="link" style={{ color: "#888", textDecoration: "none" }} onClick={() => setShowEditModal(false)}>CANCELAR</Button>
                        <Button variant="outline-info" style={{ borderRadius: "2px", letterSpacing: "1px", fontSize: "0.8rem" }} onClick={guardarEdicion}>ACTUALIZAR</Button>
                    </Modal.Footer>
                </div>
            </Modal>

            <style>{`
                .hover-cyan-btn:hover { color: #00d4ff !important; text-shadow: 0 0 5px rgba(0,212,255,0.5); }
                .hover-cyan-text:hover { color: #00d4ff !important; }
                .hover-red-text:hover { color: #ff4d4d !important; }
                .custom-textarea:focus { box-shadow: none; border-color: #00d4ff !important; background-color: rgba(255,255,255,0.05) !important; color: #fff !important; }
            `}</style>
        </>
    );
};

export default Reflexiones;