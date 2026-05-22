import React, { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import styles from './BahiCompass.module.css';

const TICKS = Array.from({ length: 72 }, (_, i) => i);
const DEGREES = [0,30,60,90,120,150,180,210,240,270,300,330];
const CX = 140, CY = 140;

const BahiCompass = () => {
    const navigate = useNavigate();
    const [heading, setHeading]               = useState(0);
    const [qiblihAngle, setQiblihAngle]       = useState(null);
    const [distance, setDistance]             = useState(null);
    const [error, setError]                   = useState(null);
    const [loading, setLoading]               = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const ACRE_COORDS = { lat: 32.9433, lng: 35.0919 };

    const calculateQiblihData = (userLat, userLng) => {
        const R = 6371;
        const dLat = (ACRE_COORDS.lat - userLat) * (Math.PI / 180);
        const dLon = (ACRE_COORDS.lng - userLng) * (Math.PI / 180);
        const lat1 = userLat * (Math.PI / 180);
        const lat2 = ACRE_COORDS.lat * (Math.PI / 180);
        const a = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setDistance(Math.round(R * c));
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        setQiblihAngle((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
    };

    const handleOrientation = useCallback((event) => {
        let h;
        if (event.webkitCompassHeading !== undefined) h = event.webkitCompassHeading;
        else if (event.alpha !== null) h = 360 - event.alpha;
        if (h !== undefined) setHeading(h);
    }, []);

    const initCompass = async () => {
        setLoading(true); setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                calculateQiblihData(pos.coords.latitude, pos.coords.longitude);
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(state => {
                            if (state === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                                setPermissionGranted(true);
                            } else setError("Permiso de sensores denegado.");
                            setLoading(false);
                        })
                        .catch(e => { setError("Error: " + e.message); setLoading(false); });
                } else {
                    const ev = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
                    window.addEventListener(ev, handleOrientation);
                    setPermissionGranted(true); setLoading(false);
                }
            },
            () => { setError("Activa la ubicación para calcular la orientación."); setLoading(false); },
            { enableHighAccuracy: true }
        );
    };

    let diff = Math.abs(heading - (qiblihAngle || 0));
    if (diff > 180) diff = 360 - diff;
    const isAligned = qiblihAngle !== null && diff < 5;

    return (
        <>
            <SideBar />
            <div className={styles.wrapper}>

                <div className={styles.bokehContainer}>
                    <div className={`${styles.bokehSphere} ${styles.sphere1}`}></div>
                    <div className={`${styles.bokehSphere} ${styles.sphere2}`}></div>
                    <div className={`${styles.bokehSphere} ${styles.sphere3}`}></div>
                </div>

                <button className={styles.backBtn} onClick={(e) => { e.stopPropagation(); navigate(-1); }}>
                    ← VOLVER
                </button>

                <span className={styles.heading}>Orientación</span>
                <h2 className={`${styles.sacredText} ${isAligned ? styles.sacredTextAligned : ''}`}>
                    QIBLIH
                </h2>

                {!permissionGranted ? (
                    <div className={styles.activateArea}>
                        <button className={styles.activateBtn} onClick={initCompass} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "ACTIVAR BRÚJULA"}
                        </button>
                        {error && <p className={styles.errorMsg}>{error}</p>}
                    </div>
                ) : (
                    <>
                        {/* ── SVG Brújula ── */}
                        <svg
                            width="280" height="280"
                            viewBox="0 0 280 280"
                            className={`${styles.compassSvg} ${isAligned ? styles.compassSvgAligned : ''}`}
                        >
                            {/* Anillo exterior glass */}
                            <circle
                                cx={CX} cy={CY} r="137"
                                fill="rgba(255,255,255,0.10)"
                                stroke={isAligned ? "rgba(40,220,143,0.7)" : "rgba(255,255,255,0.40)"}
                                strokeWidth="1.5"
                                style={{ transition: 'stroke 1s ease' }}
                            />

                            {/* Puntero fijo arriba (triángulo blanco) */}
                            <polygon points="140,2 135,13 145,13" fill="rgba(0,62,72,0.85)" style={{marginBottom:"10px"}}/>

                            {/* ── DIAL ROTANTE ── */}
                            <g transform={`rotate(${-heading}, ${CX}, ${CY})`}>

                                {/* Disco semi-transparente interior */}
                                <circle
                                    cx={CX} cy={CY} r="112"
                                    fill="rgba(0,40,25,0.18)"
                                    stroke="rgba(255,255,255,0.10)"
                                    strokeWidth="0.8"
                                />

                                {/* Ticks de grado (72 marcas, cada 5°) */}
                                {TICKS.map(i => {
                                    const angle = i * 5;
                                    const isMajor = i % 6 === 0;
                                    const isMid   = i % 3 === 0;
                                    const len     = isMajor ? 18 : isMid ? 11 : 6;
                                    const opacity = isMajor ? 0.75 : isMid ? 0.45 : 0.22;
                                    const sw      = isMajor ? 1.5  : isMid ? 1   : 0.8;
                                    return (
                                        <line key={i}
                                            x1={CX} y1="5"
                                            x2={CX} y2={5 + len}
                                            stroke={`rgba(255,255,255,${opacity})`}
                                            strokeWidth={sw}
                                            transform={`rotate(${angle}, ${CX}, ${CY})`}
                                        />
                                    );
                                })}

                                {/* Números de grado cada 30° */}
                                {DEGREES.map(deg => (
                                    <text key={deg}
                                        x={CX} y="36"
                                        textAnchor="middle"
                                        fontSize="8.5"
                                        fontWeight="600"
                                        fill="rgba(255,255,255,0.75)"
                                        fontFamily="Inter,sans-serif"
                                        transform={`rotate(${deg}, ${CX}, ${CY})`}
                                    >{deg}</text>
                                ))}

                                {/* Cardinales */}
                                <text x={CX} y="88"  textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="white"                   fontFamily="Inter,sans-serif">N</text>
                                <text x={CX} y="194" textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="rgba(255,255,255,0.6)"   fontFamily="Inter,sans-serif">S</text>
                                <text x="88"  y={CY} textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="rgba(255,255,255,0.6)"   fontFamily="Inter,sans-serif">E</text>
                                <text x="194" y={CY} textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="rgba(255,255,255,0.6)"   fontFamily="Inter,sans-serif">W</text>

                                {/* Marcador ACRE — triángulo + etiqueta, rota según qiblihAngle */}
                                {qiblihAngle !== null && (
                                    <g transform={`rotate(${qiblihAngle}, ${CX}, ${CY})`}>
                                        <polygon
                                            points={`${CX},28 ${CX-5},42 ${CX+5},42`}
                                            fill={isAligned ? "#28dc8f" : "#e03030"}
                                            className={isAligned ? styles.acrePulse : ''}
                                        />
                                        <text
                                            x={CX} y="54"
                                            textAnchor="middle"
                                            fontSize="7"
                                            fontWeight="700"
                                            letterSpacing="2"
                                            fill={isAligned ? "#28dc8f" : "rgba(255,255,255,0.65)"}
                                            fontFamily="Inter,sans-serif"
                                            style={{ transition: 'fill 0.5s ease' }}
                                        >ACRE</text>
                                        {/* Línea del brazo */}
                                        <line
                                            x1={CX} y1="44"
                                            x2={CX} y2={CY - 4}
                                            stroke={isAligned ? "rgba(40,220,143,0.35)" : "rgba(255,255,255,0.12)"}
                                            strokeWidth="1"
                                            strokeDasharray="3 3"
                                            style={{ transition: 'stroke 0.5s ease' }}
                                        />
                                    </g>
                                )}
                            </g>

                            {/* ── ELEMENTOS FIJOS (no rotan) ── */}

                            {/* Cruz central */}
                            <line x1="126" y1={CY} x2="154" y2={CY} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
                            <line x1={CX} y1="126" x2={CX} y2="154" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
                            <circle cx={CX} cy={CY} r="3.5"
                                fill={isAligned ? "rgba(40,220,143,0.6)" : "rgba(255,255,255,0.30)"}
                                stroke={isAligned ? "#28dc8f" : "rgba(255,255,255,0.45)"}
                                strokeWidth="1"
                                style={{ transition: 'all 0.8s ease' }}
                            />

                            {/* Línea de mira debajo del puntero */}
                            <line x1={CX} y1="14" x2={CX} y2="26"
                                stroke={isAligned ? "rgba(40,220,143,0.8)" : "rgba(255,255,255,0.5)"}
                                strokeWidth="1.5"
                                style={{ transition: 'stroke 0.8s ease' }}
                            />
                        </svg>

                        {/* Info inferior */}
                        <div className={styles.infoArea}>
                            <div className={`${styles.headingDisplay} ${isAligned ? styles.headingDisplayAligned : ''}`}>
                                {Math.round(heading)}°
                            </div>
                            {distance && (
                                <a
                                    href={`https://www.google.com/maps?q=${ACRE_COORDS.lat},${ACRE_COORDS.lng}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className={styles.distanceLink}
                                >
                                    <div className={`${styles.distanceBadge} ${isAligned ? styles.distanceBadgeAligned : ''}`}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        <span>{distance.toLocaleString()} KM A ACRE</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default BahiCompass;