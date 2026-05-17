import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

// Importamos el plugin nativo de Capacitor
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Contador = () => {
    const navigate = useNavigate();
    const MAX_COUNT = 95;
    const [count, setCount] = useState(0);
    const [finished, setFinished] = useState(false);

    // Función asíncrona para manejar el incremento y la vibración nativa
    const handleIncrement = async () => {
        if (count < MAX_COUNT) {
            const newCount = count + 1;
            setCount(newCount);
            
            try {
                // Vibración táctil ligera para cada toque (sensación premium)
                await Haptics.impact({ style: ImpactStyle.Light });

                if (newCount === MAX_COUNT) {
                    setFinished(true);
                    // Vibración más larga al finalizar las 95 repeticiones
                    await Haptics.vibrate({ duration: 800 }); 
                }
            } catch (error) {
                console.log("Haptics no disponible en web, usando fallback");
                if (navigator.vibrate) navigator.vibrate(15);
            }
        }
    };

    const handleReset = (e) => {
        e.stopPropagation(); 
        setCount(0);
        setFinished(false);
    };

    const styles = {
        wrapper: {
            backgroundColor: "#000",
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            userSelect: "none"
        },
        bokehContainer: {
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: 1,
            filter: "blur(40px)",
            opacity: finished ? 0.8 : 0.4,
            transition: "opacity 1.5s ease",
            pointerEvents: "none"
        },
        content: {
            position: "relative",
            zIndex: 5,
            textAlign: "center",
            pointerEvents: "none"
        },
        heading: {
            fontSize: "0.65rem",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "15px",
            fontWeight: "400",
            display: "block"
        },
        sacredText: {
            fontSize: "clamp(1.5rem, 8vw, 2rem)",
            fontWeight: "200",
            letterSpacing: "8px",
            marginBottom: "30px",
            color: finished ? "#00d4ff" : "#fff",
            textShadow: finished ? "0 0 20px rgba(0,212,255,0.6)" : "none",
            transition: "all 1s ease",
            textTransform: "uppercase"
        },
        counterNumber: {
            fontSize: "clamp(8rem, 25vw, 11rem)",
            fontWeight: "100",
            lineHeight: "1",
            color: finished ? "#00d4ff" : "#fff",
            transition: "all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)",
            textShadow: finished ? "0 0 40px rgba(0,212,255,0.4)" : "none",
        },
        progressInfo: {
            marginTop: "40px",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            color: finished ? "#00d4ff" : "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
            fontWeight: "500"
        },
        resetArea: {
            position: "absolute",
            bottom: "40px",
            right: "30px",
            color: "rgba(255,255,255,0.2)",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "0.3s",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)"
        },
        finishRing: {
            position: "absolute",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            border: "1px solid #00d4ff",
            opacity: finished ? "0.3" : "0",
            transform: finished ? "scale(1.3)" : "scale(0.8)",
            transition: "1.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
            zIndex: 2
        }
    };

    return (
        <>
            <SideBar />
            <div style={styles.wrapper} onClick={handleIncrement}>
                <div style={styles.bokehContainer}>
                    <div className="bokeh-sphere s1"></div>
                    <div className="bokeh-sphere s2"></div>
                    <div className="bokeh-sphere s3"></div>
                </div>

                <div style={styles.resetArea} className="hover-reset" onClick={handleReset}>
                    <FontAwesomeIcon icon={faUndo} style={{ opacity: count > 0 ? 1 : 0.2 }} />
                </div>

                <div style={styles.finishRing} />

                <div style={styles.content}>
                    <span style={styles.heading}>Recitación Sagrada</span>
                    <h2 style={styles.sacredText}>Alláh-u-Abhá</h2>

                    <div style={styles.counterNumber} className={finished ? "counter-finished" : ""}>
                        {count}
                    </div>

                    <div style={styles.progressInfo}>
                        {finished ? "Completado" : `Faltan ${MAX_COUNT - count}`}
                    </div>
                </div>

                {!finished && count === 0 && (
                    <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: '#444', letterSpacing: '2px', zIndex: 5 }}>
                        TOCA PARA CONTAR
                    </div>
                )}
            </div>

            <style>{`
                .bokeh-sphere { position: absolute; border-radius: 50%; mix-blend-mode: screen; animation: floatC 20s infinite ease-in-out; }
                .s1 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%); top: -5%; left: -5%; }
                .s2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,80,255,0.2) 0%, transparent 70%); bottom: 5%; right: -5%; animation-delay: -5s; }
                .s3 { width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); top: 40%; left: 20%; animation-delay: -10s; }

                @keyframes floatC {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    50% { transform: translate(10%, 10%) scale(1.1); opacity: 0.6; }
                }

                .hover-reset:active {
                    color: #fff !important;
                    background-color: rgba(255,255,255,0.1) !important;
                    transform: rotate(-45deg);
                }

                .counter-finished {
                    animation: pulseFinished 3s infinite ease-in-out;
                }

                @keyframes pulseFinished {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </>
    );
};

export default Contador;

/* 
RECITACIÓN DEL NOMBRE MÁS GRANDE

"Alláh’u’Abhá"
(Dios es el Todo Glorioso)

"Se ha ordenado a todo creyente en Dios, Señor del Juicio, que cada día, habiéndose lavado las manos y luego la cara, se siente y, volviéndose a Dios, repita noventa y cinco veces
«Alláh-u-Abhá». Ése fue el decreto del Hacedor de los cielos cuando, con majestad y poder, Se estableció en los tronos de Sus Nombres".

Bahá’u’lláh, Kitáb-i-Aqdas, párrafo 18
*/