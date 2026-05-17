import { useEffect, useState, useContext } from "react";
import { Container } from "react-bootstrap";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion, useAnimationControls } from "framer-motion";
import OracionesList from "./OracionesList";

const calcularFechaBadi = (fechaActual) => {
    const meses = ["Bahá", "Jalál", "Jamál", "‘Aẓamat", "Núr", "Raḥmat", "Kalimát", "Kamál", "Asmá’", "‘Izzat", "Mashíyyat", "‘Ilm", "Qudrat", "Qawl", "Masá’il", "Sharaf", "Sulṭán", "Mulk", "Ayyám-i-Há", "‘Alá’"];
    const añoActual = fechaActual.getFullYear();
    let nawRuz = new Date(añoActual, 2, 20); 
    if (fechaActual < nawRuz) nawRuz = new Date(añoActual - 1, 2, 20);
    const añoBadi = nawRuz.getFullYear() - 1843; 
    const difDias = Math.floor((fechaActual.getTime() - nawRuz.getTime()) / (1000 * 60 * 60 * 24));
    let diaBadi, nombreMes;
    
    if (difDias < 342) {
        diaBadi = (difDias % 19) + 1;
        nombreMes = meses[Math.floor(difDias / 19)];
    } else {
        const proximoNawRuz = new Date(nawRuz.getFullYear() + 1, 2, 20);
        const inicioAla = new Date(proximoNawRuz);
        inicioAla.setDate(inicioAla.getDate() - 19);
        if (fechaActual >= inicioAla) {
            diaBadi = Math.floor((fechaActual - inicioAla) / (1000 * 60 * 60 * 24)) + 1;
            nombreMes = meses[19]; 
        } else {
            const inicioAyyam = new Date(nawRuz);
            inicioAyyam.setDate(inicioAyyam.getDate() + 342);
            diaBadi = Math.floor((fechaActual - inicioAyyam) / (1000 * 60 * 60 * 24)) + 1;
            nombreMes = meses[18]; 
        }
    }
    return { dia: diaBadi, mes: nombreMes, año: añoBadi };
};

const Principal = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [date, setDate] = useState(null);
    const [astro, setAstro] = useState({ sunrise: '--:--', sunset: '--:--', noon: '--:--' });
    const [isAppReady, setIsAppReady] = useState(false); // Para la aparición gradual
    const [activeScreen, setActiveScreen] = useState(0); 

    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const controls = useAnimationControls();

    // 1. RELOJ Y FECHA BADI
    useEffect(() => {
        const timer = setInterval(() => {
            const ahora = new Date();
            setCurrentTime(ahora);
            setDate({
                badi: calcularFechaBadi(ahora),
                gregorian: { year: ahora.getFullYear(), month: String(ahora.getMonth() + 1).padStart(2, '0'), day: String(ahora.getDate()).padStart(2, '0') }
            });
        }, 1000);
        
        // Iniciamos la transición de aparición casi de inmediato
        const readyTimer = setTimeout(() => setIsAppReady(true), 150);
        
        return () => {
            clearInterval(timer);
            clearTimeout(readyTimer);
        };
    }, []);

    // 2. PROTECCIÓN DE RUTA
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    // 3. DATOS ASTRONÓMICOS (Con Caché)
    useEffect(() => {
        const fetchAstroData = async () => {
            const hoy = new Date().toDateString();
            const cacheData = localStorage.getItem("astroData");
            const cacheDate = localStorage.getItem("astroDate");

            if (cacheData && cacheDate === hoy) {
                setAstro(JSON.parse(cacheData));
                return;
            }

            try {
                const PROXY_URL = 'https://corsproxy.io/?';
                const pos = await new Promise((res, rej) => 
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
                );
                
                const resSun = await fetch(PROXY_URL + encodeURIComponent(`https://api.sunrise-sunset.org/json?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&formatted=0`));
                const sunData = await resSun.json();
                
                const nuevosDatos = {
                    sunrise: new Date(sunData.results.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sunset: new Date(sunData.results.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    noon: new Date(sunData.results.solar_noon).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                setAstro(nuevosDatos);
                localStorage.setItem("astroData", JSON.stringify(nuevosDatos));
                localStorage.setItem("astroDate", hoy);
            } catch (e) { console.error("Error astro:", e); }
        };
        fetchAstroData();
    }, []);

    const handleDragEnd = (event, info) => {
        const threshold = window.innerWidth / 3;
        const velocityX = info.velocity.x; 
        const offsetX = info.offset.x;
        const elegantTransition = { type: "spring", stiffness: 300, damping: 30 };

        if (velocityX < -600 || offsetX < -threshold) {
            if (activeScreen === 0) {
                controls.start({ x: -window.innerWidth, transition: elegantTransition });
                setActiveScreen(1);
            }
        } else if (velocityX > 600 || offsetX > threshold) {
            if (activeScreen === 1) {
                controls.start({ x: 0, transition: elegantTransition });
                setActiveScreen(0);
            }
        } else {
            controls.start({ 
                x: activeScreen === 0 ? 0 : -window.innerWidth, 
                transition: elegantTransition 
            });
        }
    };

    // Variantes para orquestar la aparición armoniosa
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.4, delayChildren: 0.3 } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15, filter: "blur(10px)" },
        visible: { 
            opacity: 1, 
            y: 0, 
            filter: "blur(0px)",
            transition: { duration: 1.2, ease: "easeOut" } 
        }
    };

    const styles = {
        viewport: { width: "100vw", height: "100vh", overflow: "hidden", background: "#000", position: "relative" },
        slider: { display: "flex", width: "200vw", height: "100vh" },
        screen: { width: "100vw", height: "100vh" },
        wrapper: {
            background: "#000", height: "100%", color: "#fff",
            fontFamily: "'Inter', sans-serif", display: "flex",
            alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"
        },
        bokehContainer: {
            position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: 0,
            filter: "blur(50px)", opacity: isAppReady ? 1 : 0, transition: "opacity 3s ease-in-out"
        },
        digitalClock: {
            fontFamily: "'DS-Digital', sans-serif",
            fontSize: "clamp(4.5rem, 18vw, 7rem)", color: "#00d4ff",
            textShadow: "0 0 30px rgba(0, 212, 255, 0.6)",
            lineHeight: "1", marginBottom: "10px"
        }
    };

    return (
        <>
            <SideBar />
            <div style={styles.viewport}>
                <motion.div 
                    drag="x"
                    dragConstraints={{ left: -window.innerWidth, right: 0 }}
                    dragElastic={0.05}
                    animate={controls}
                    onDragEnd={handleDragEnd}
                    style={styles.slider}
                >
                    <div style={styles.screen}>
                        <div style={styles.wrapper}>
                            {/* RESTAURACIÓN DE LAS BOLAS DE LUZ ORIGINALES */}
                            <div style={styles.bokehContainer}>
                                <div className="bokeh p1"></div>
                                <div className="bokeh p2"></div>
                                <div className="bokeh p3"></div>
                            </div>

                            <Container 
                                as={motion.div}
                                variants={containerVariants}
                                initial="hidden"
                                animate={isAppReady ? "visible" : "hidden"}
                                className="text-center" 
                                style={{ zIndex: 1 }}
                            >
                                {/* Reloj con aparición suave */}
                                <motion.div variants={itemVariants} style={styles.digitalClock}>
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    <span style={{ fontSize: "0.35em", opacity: "0.3", marginLeft: "10px" }}>
                                        {currentTime.getSeconds().toString().padStart(2, '0')}
                                    </span>
                                </motion.div>

                                {/* Fecha Badí */}
                                {date && (
                                    <motion.div variants={itemVariants} style={{ marginTop: "20px" }}>
                                        <div style={{ fontSize: "1.3rem", fontWeight: "200", letterSpacing: "5px", textTransform: "uppercase" }}>
                                            {date.badi.dia} {date.badi.mes} {date.badi.año}
                                        </div>
                                        <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "4px", marginTop: "10px" }}>
                                            {date.gregorian.year} • {date.gregorian.month} • {date.gregorian.day}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Datos Astronómicos */}
                                <motion.div 
                                    variants={itemVariants}
                                    style={{ 
                                        display: "flex", justifyContent: "center", gap: "35px", 
                                        marginTop: "50px", paddingTop: "30px",
                                        borderTop: "1px solid rgba(255,255,255,0.1)" 
                                    }}
                                >
                                    {[
                                        { label: "Amanecer", value: astro.sunrise },
                                        { label: "Mediodía", value: astro.noon },
                                        { label: "Ocaso", value: astro.sunset }
                                    ].map((item, i) => (
                                        <div key={i} style={{ textAlign: "center" }}>
                                            <span style={{ display: "block", fontSize: "0.45rem", color: "#444", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>{item.label}</span>
                                            <span style={{ fontSize: "0.85rem", color: "#bbb", fontWeight: "300" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            </Container>
                        </div>
                    </div>

                    <div style={{ ...styles.screen, background: '#000', overflowY: 'auto' }}>
                        <OracionesList />
                    </div>
                </motion.div>

                <style>{`
                    /* BOLAS DE LUZ - CSS ORIGINAL RESTAURADO */
                    .bokeh { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: float 20s infinite ease-in-out; opacity: 0; }
                    .p1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,212,255,0.4) 40%, transparent 70%); top: 10%; left: 10%; }
                    .p2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,100,255,0.6) 0%, transparent 70%); bottom: 10%; right: 5%; animation-delay: -5s; }
                    .p3 { width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,255,242,0.5) 30%, transparent 70%); top: 40%; left: 50%; animation-delay: -2s; }
                    
                    @keyframes float { 
                        0%, 100% { transform: translate(0, 0); opacity: 0; } 
                        20%, 80% { opacity: 0.6; } 
                        50% { transform: translate(10vw, -5vh); opacity: 0.8; } 
                    }

                    ::-webkit-scrollbar { width: 3px; }
                    ::-webkit-scrollbar-track { background: #000; }
                    ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                `}</style>
            </div>
        </>
    );
};

export default Principal;