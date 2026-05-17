import React, { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faLocationArrow, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import SideBar from "../components/SideBar";

const BahiCompass = () => {
    const [heading, setHeading] = useState(0);
    const [qiblihAngle, setQiblihAngle] = useState(null);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const ACRE_COORDS = { lat: 32.9433, lng: 35.0919 };

    const calculateQiblihData = (userLat, userLng) => {
        const R = 6371;
        const dLat = (ACRE_COORDS.lat - userLat) * (Math.PI / 180);
        const dLon = (ACRE_COORDS.lng - userLng) * (Math.PI / 180);
        const lat1 = userLat * (Math.PI / 180);
        const lat2 = ACRE_COORDS.lat * (Math.PI / 180);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        setDistance(Math.round(d));

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let bearing = Math.atan2(y, x) * (180 / Math.PI);
        setQiblihAngle((bearing + 360) % 360);
    };

    const handleOrientation = useCallback((event) => {
        let compassHeading;
        if (event.webkitCompassHeading !== undefined) {
            compassHeading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            compassHeading = 360 - event.alpha;
        }
        if (compassHeading !== undefined) {
            setHeading(compassHeading);
        }
    }, []);

    const initCompass = async () => {
        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                calculateQiblihData(pos.coords.latitude, pos.coords.longitude);
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(state => {
                            if (state === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                                setPermissionGranted(true);
                            } else {
                                setError("Permiso de sensores denegado.");
                            }
                            setLoading(false);
                        })
                        .catch(e => {
                            setError("Error de sensores: " + e.message);
                            setLoading(false);
                        });
                } else {
                    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
                    window.addEventListener(eventName, handleOrientation);
                    setPermissionGranted(true);
                    setLoading(false);
                }
            },
            () => {
                setError("Activa la ubicación para calcular la orientación.");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    let diff = Math.abs(heading - (qiblihAngle || 0));
    if (diff > 180) diff = 360 - diff;
    const isAligned = qiblihAngle !== null && diff < 5;

    const styles = {
        wrapper: {
            backgroundColor: "#000",
            minHeight: "100vh",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "60px",
            overflow: "hidden",
            position: "relative"
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
        compassOuter: {
            position: "relative",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            border: `2px solid ${isAligned ? '#00d4ff' : 'rgba(255,255,255,0.05)'}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "30px",
            background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 80%)",
            boxShadow: isAligned ? '0 0 50px rgba(0, 212, 255, 0.2)' : 'inset 0 0 20px rgba(255,255,255,0.02)',
            transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
        },
        rotatingDial: {
            position: "absolute",
            width: "100%",
            height: "100%",
            // El truco de la elegancia: una transición suave pero responsiva
            transform: `rotate(${-heading}deg)`,
            transition: "transform 0.5s cubic-bezier(0.1, 0.3, 0.2, 1)"
        },
        qiblihMarkerArm: {
            position: "absolute",
            top: 0,
            left: "50%",
            width: "2px",
            height: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${qiblihAngle}deg)`,
            zIndex: 10
        }
    };

    return (
        <>
            <SideBar />

            <div style={styles.wrapper}>
                <button 
                    style={styles.backBtn} 
                    className="hover-white" 
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que el clic cuente como incremento
                        navigate(-1);
                    }}
                >
                    ← VOLVER
                </button>
                <div className="bokeh-bg">
                    <div className="sphere s1"></div>
                    <div className="sphere s2"></div>
                </div>

                <span className="label-ui">Orientación</span>
                <h2 className={`title-ui ${isAligned ? 'aligned' : ''}`}>QIBLIH</h2>

                {!permissionGranted ? (
                    <div className="text-center mt-5" style={{ zIndex: 2 }}>
                        <button className="btn-activate" onClick={initCompass} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "ACTIVAR BRÚJULA"}
                        </button>
                        {error && <p className="error-msg">{error}</p>}
                    </div>
                ) : (
                    <>
                        <div style={styles.compassOuter}>
                            {/* Guía central fija */}
                            <div className={`center-indicator ${isAligned ? 'active' : ''}`}></div>
                            <div className={`compass-center-dot ${isAligned ? 'active' : ''}`}></div>

                            <div style={styles.rotatingDial}>
                                {/* Puntos Cardinales con mejor estilo */}
                                <span className="cardinal-point n">N</span>
                                <span className="cardinal-point s">S</span>
                                <span className="cardinal-point e">E</span>
                                <span className="cardinal-point w">W</span>
                                
                                <FontAwesomeIcon icon={faCompass} className="compass-bg-icon" />

                                {qiblihAngle !== null && (
                                    <div style={styles.qiblihMarkerArm}>
                                        <div className="acre-marker-container">
                                            <FontAwesomeIcon 
                                                icon={faLocationArrow} 
                                                className={`acre-arrow ${isAligned ? 'active' : ''}`} 
                                            />
                                            <div className={`acre-label ${isAligned ? 'active' : ''}`}>ACRE</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-4" style={{ zIndex: 2 }}>
                            <div className="heading-display">
                                {Math.round(heading)}°
                            </div>
                            
                            {distance && (
                                <a 
                                    href={`https://www.google.com/maps?q=${ACRE_COORDS.lat},${ACRE_COORDS.lng}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="distance-link"
                                >
                                    <div className="distance-badge">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        <span>{distance.toLocaleString()} KM A ACRE</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .label-ui { letter-spacing: 5px; font-size: 0.6rem; opacity: 0.4; text-transform: uppercase; }
                .title-ui { font-weight: 200; letter-spacing: 8px; transition: 0.5s; margin-top: 5px; }
                .title-ui.aligned { color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.5); }

                .btn-activate {
                    background: none; border: 1px solid rgba(255,255,255,0.2); color: #fff;
                    padding: 15px 40px; font-size: 0.7rem; letter-spacing: 4px; border-radius: 40px;
                    transition: 0.4s; backdrop-filter: blur(10px);
                }
                .btn-activate:hover { border-color: #00d4ff; background: rgba(0,212,255,0.1); }

                .center-indicator {
                    position: absolute; top: -15px; width: 2px; height: 30px; 
                    background: rgba(255,255,255,0.2); z-index: 5; transition: 0.5s;
                }
                .center-indicator.active { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; height: 40px; }

                .compass-center-dot {
                    position: absolute; width: 8px; height: 8px; border-radius: 50%;
                    background: rgba(255,255,255,0.2); z-index: 10; transition: 0.5s;
                }
                .compass-center-dot.active { background: #00d4ff; box-shadow: 0 0 15px #00d4ff; }

                .cardinal-point { position: absolute; font-weight: 600; font-size: 0.8rem; opacity: 0.3; }
                .n { top: 20px; left: 50%; transform: translateX(-50%); color: #ff4d4d; opacity: 0.8; }
                .s { bottom: 20px; left: 50%; transform: translateX(-50%); }
                .e { right: 20px; top: 50%; transform: translateY(-50%); }
                .w { left: 20px; top: 50%; transform: translateY(-50%); }

                .compass-bg-icon {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 10rem; opacity: 0.03; color: #fff;
                }

                .acre-marker-container {
                    position: absolute; top: -35px; left: 50%; transform: translateX(-50%);
                    text-align: center; display: flex; flex-direction: column; align-items: center;
                }
                .acre-arrow { 
                    color: rgba(255,255,255,0.6); font-size: 2rem; transition: 0.5s; 
                }
                .acre-arrow.active { color: #00d4ff; filter: drop-shadow(0 0 10px #00d4ff); }
                .acre-label { font-size: 0.6rem; letter-spacing: 2px; opacity: 0.5; margin-top: 5px; font-weight: bold; transition: 0.5s; }
                .acre-label.active { opacity: 1; color: #00d4ff; }

                .heading-display { font-size: 3.5rem; font-weight: 100; letter-spacing: -2px; opacity: 0.9; }

                .distance-link { text-decoration: none !important; }
                .distance-badge {
                    margin-top: 20px; padding: 12px 28px; border-radius: 40px;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    display: inline-flex; align-items: center; gap: 12px; color: #fff;
                    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .distance-badge:hover { background: rgba(0, 212, 255, 0.1); border-color: #00d4ff; transform: translateY(-2px); }

                .bokeh-bg { position: absolute; width: 100%; height: 100%; z-index:0; pointer-events:none; }
                .sphere { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; animation: float 25s infinite ease-in-out; }
                .s1 { width: 500px; height: 500px; background: #00d4ff; top: -10%; left: -10%; }
                .s2 { width: 400px; height: 400px; background: #0033ff; bottom: -5%; right: -5%; animation-delay: -7s; }

                @keyframes float { 
                    0%, 100% { transform: translate(0,0) scale(1); } 
                    50% { transform: translate(10%, 15%) scale(1.1); } 
                }

                .error-msg { color: #ff4d4d; font-size: 0.75rem; margin-top: 25px; letter-spacing: 1px; }
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

export default BahiCompass;