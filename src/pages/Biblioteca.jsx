import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Spinner, Modal, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom"; 
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";

const Biblioteca = () => {
    const { db } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [view, setView] = useState("list"); 
    const [mensajes, setMensajes] = useState([]);
    const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
    const [parrafos, setParrafos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados para el Modal personalizado
    const [showModal, setShowModal] = useState(false);
    const [parrafoAEditar, setParrafoAEditar] = useState(null);
    const [nuevoTitulo, setNuevoTitulo] = useState("");

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
            const res = await db.query("SELECT * FROM biblioteca_parrafos WHERE mensajeID = ? ORDER BY num_parrafo", [msg.id]);
            setParrafos(res.values || []);
            setMensajeSeleccionado(msg);
            setView("reading");

            // Guardamos el mensaje actual en memoria
            sessionStorage.setItem('biblioteca_mensaje_activo', JSON.stringify(msg));

            // Manejo del Scroll
            if (parrafoIdToScroll) {
                setTimeout(() => {
                    const elemento = document.getElementById(`parrafo-${parrafoIdToScroll}`);
                    if (elemento) {
                        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 150);
            } else {
                window.scrollTo(0, 0);
            }
        } finally {
            setLoading(false);
        }
    };

    // Al cargar el componente, verificamos si venimos de regreso de una reflexión
    useEffect(() => { 
        if (db) {
            cargarMensajes();
            
            const savedMsg = sessionStorage.getItem('biblioteca_mensaje_activo');
            const savedScrollPos = sessionStorage.getItem('biblioteca_scroll_id');
            
            if (savedMsg && location.pathname === '/biblioteca') { // Asegúrate de ajustar tu ruta base si es diferente
                const msg = JSON.parse(savedMsg);
                abrirMensaje(msg, savedScrollPos);
                // Limpiamos el scroll para no saltar si recarga la página manualmente
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
        
        await db.run("UPDATE biblioteca_parrafos SET titulo_luxury = ? WHERE id = ?", 
            [nuevoTitulo.toUpperCase().trim(), parrafoAEditar.id]);
        
        const res = await db.query("SELECT * FROM biblioteca_parrafos WHERE mensajeID = ? ORDER BY num_parrafo", [mensajeSeleccionado.id]);
        setParrafos(res.values || []);
        setShowModal(false);
    };

    const irAReflexiones = (p_id) => {
        // Guardamos el ID del párrafo donde nos quedamos antes de irnos
        sessionStorage.setItem('biblioteca_scroll_id', p_id);
        navigate(`/reflexiones/${p_id}`);
    };

    const volverALista = () => {
        sessionStorage.removeItem('biblioteca_mensaje_activo');
        sessionStorage.removeItem('biblioteca_scroll_id');
        setView("list");
    };

    const styles = {
        mainContainer: {
            backgroundColor: "#000", minHeight: "100vh", width: "100%", color: "#fff",
            padding: "80px 0", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden"
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
            cursor: 'pointer',
            transition: 'all 0.3s ease', // Añadido para suavizar el hover
            padding: '0'
        },
        bokehContainer: {
            position: "absolute", width: "100%", height: "100%", top: 0, left: 0,
            zIndex: 0, filter: "blur(50px)", opacity: 0.6, pointerEvents: "none"
        },
        title: {
            fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: "200", textAlign: "center",
            letterSpacing: "8px", textTransform: "uppercase", marginBottom: "40px", color: "#ffffff", zIndex: 2, position: "relative"
        },
        card: {
            border: "1px solid rgba(255,255,255,0.1)", padding: "30px 20px", textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.02)", backdropFilter: "blur(15px)", cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)", borderRadius: "4px", zIndex: 2, marginBottom: "20px"
        },
        backBtn: {
            background: 'none', border: 'none', color: '#666', fontSize: '0.65rem',
            letterSpacing: '3px', textTransform: 'uppercase', zIndex: 3, position: 'relative',
            cursor: 'pointer', display: 'block', margin: '0 auto 40px auto', transition: '0.3s'
        },
        luxuryGray: {
            color: "#888", fontSize: "0.7rem", letterSpacing: "5px", textTransform: "uppercase",
            display: "block", marginBottom: "12px", borderLeft: "2px solid rgba(0, 212, 255, 0.5)", paddingLeft: "15px", fontWeight: "300"
        },
        paraNum: { 
            color: "#00d4ff", // Mantenemos el cian pero lo hacemos resaltar más
            fontSize: "1.1rem", // Más grande
            marginRight: "10px", 
            cursor: "pointer", 
            opacity: 0.8, // Mayor opacidad
            fontWeight: "400", // Peso más balanceado
            transition: "0.3s",
            minWidth: "30px"
        },
        modalContent: {
            backgroundColor: "#111", color: "#fff", border: "1px solid rgba(0, 212, 255, 0.3)", borderRadius: "4px"
        },
        modalInput: {
            backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff"
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

                <Container>
                    {view === "list" ? (
                        <div style={{ position: "relative", zIndex: 2 }}>
                            <h2 style={styles.title}>BIBLIOTECA</h2>
                            {loading ? (
                                <div className="text-center mt-5"><Spinner animation="grow" variant="info" size="sm" /></div>
                            ) : (
                                <Row className="justify-content-center">
                                    {mensajes.map(m => (
                                        <Col md={6} key={m.id}>
                                            <div style={styles.card} className="luxury-card-v2" onClick={() => abrirMensaje(m)}>
                                                <small style={{ color: "#00d4ff", letterSpacing: "3px", fontSize: "0.55rem", textTransform: "uppercase" }}>{m.fecha}</small>
                                                <h5 className="fw-light mt-2" style={{ letterSpacing: "2px", fontSize: "1rem" }}>{m.titulo}</h5>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    ) : (
                        <div style={{ position: "relative", zIndex: 2 }}>
                            <button style={styles.backBtn} className="hover-cyan" onClick={volverALista}>
                                ← VOLVER AL ARCHIVO
                            </button>
                            
                            <div style={{ maxWidth: "780px", margin: "0 auto" }}>
                                <h3 className="text-center mb-5 fw-light" style={{ letterSpacing: "4px", lineHeight: "1.6", fontSize: "1.4rem" }}>
                                    {mensajeSeleccionado?.titulo}
                                </h3>
                                
                                {parrafos.map((p) => (
                                    <div key={p.id} id={`parrafo-${p.id}`} className="mb-5 animate__animated animate__fadeIn">
                                        {p.titulo_luxury && <span style={styles.luxuryGray}>{p.titulo_luxury}</span>}
                                        <div className="d-flex align-items-start">
                                            <span 
                                                style={styles.paraNum} 
                                                className="para-num-hover"
                                                onClick={() => handleOpenModal(p)}
                                            >
                                                {p.num_parrafo.toString().padStart(2, '0')}
                                            </span>
                                            <p 
                                                style={{ 
                                                    fontSize: "1.05rem", 
                                                    lineHeight: "1.9", 
                                                    color: "rgba(255,255,255,0.85)", // Letra un poco más clara
                                                    fontWeight: "300", 
                                                    cursor: "pointer",
                                                    textAlign: "justify" // Justificado
                                                }} 
                                                onClick={() => irAReflexiones(p.id)}
                                                className="text-hover-white"
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

            {/* MODAL PERSONALIZADO */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <div style={styles.modalContent}>
                    <Modal.Header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <Modal.Title style={{ fontSize: "1rem", letterSpacing: "2px", fontWeight: "300" }}>EDITAR SUBTÍTULO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control 
                            type="text" 
                            value={nuevoTitulo} 
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            style={styles.modalInput}
                            className="custom-input-focus"
                            placeholder="Escribe un título para este párrafo..."
                            autoFocus
                        />
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: "none" }}>
                        <Button variant="link" style={{ color: "#888", textDecoration: "none" }} onClick={() => setShowModal(false)}>
                            CANCELAR
                        </Button>
                        <Button variant="outline-info" style={{ borderRadius: "2px", letterSpacing: "1px", fontSize: "0.8rem" }} onClick={handleSaveTitle}>
                            GUARDAR
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            <style>{`
                .bokeh { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: float 25s infinite ease-in-out; opacity: 0; }
                .p1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(0,212,255,0.3) 40%, transparent 70%); top: -10%; left: -10%; }
                .p2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,60,255,0.4) 0%, transparent 70%); bottom: -10%; right: -10%; animation-delay: -5s; }
                .p3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%); top: 40%; right: 10%; animation-delay: -2s; }
                .p4 { width: 250px; height: 250px; background: radial-gradient(circle, rgba(0,255,242,0.4) 0%, transparent 70%); bottom: 20%; left: 10%; animation-delay: -10s; }

                @keyframes float { 0% { transform: translate(0, 0) scale(1); opacity: 0; } 20% { opacity: 0.5; } 50% { transform: translate(10vw, -5vh) scale(1.1); opacity: 0.7; } 100% { transform: translate(-2vw, 2vh) scale(1); opacity: 0; } }

                .luxury-card-v2:hover { background-color: rgba(255,255,255,0.08) !important; border-color: rgba(0, 212, 255, 0.5) !important; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .hover-cyan:hover { color: #fff !important; text-shadow: 0 0 10px #00d4ff; }
                .para-num-hover:hover { opacity: 1 !important; transform: scale(1.1); color: #fff !important; }
                .text-hover-white:hover { color: #fff !important; }

                .custom-input-focus:focus { box-shadow: none; border-color: #00d4ff; background-color: rgba(255,255,255,0.1); color: #fff; }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 10px; }
                .hover-cyan {
                    transition: color 0.3s ease, text-shadow 0.3s ease;
                    }

                    .hover-cyan:hover {
                    color: #00d4ff !important;
                    text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
                    }
            `}</style>
        </>
    );
};

export default Biblioteca;