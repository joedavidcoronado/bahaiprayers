import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { AppContext } from "../context/AppContext";
import styles from "./Configuracion.module.css";

const Configuracion = () => {
    const navigate = useNavigate();
    const { config, setConfig } = useContext(AppContext);

    const [tempConfig, setTempConfig] = useState(config || {
        fontScale: 100,
    });

    const updateConfig = (key, value) => {
        const newCfg = { ...tempConfig, [key]: value };
        setTempConfig(newCfg);
        if (setConfig) setConfig(newCfg);
        localStorage.setItem("app_config", JSON.stringify(newCfg));
    };

    return (
        <>
            <SideBar />
            <div className={styles.page}>
                <Container className={styles.container}>

                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← Volver
                    </button>

                    <h2 className={styles.title}>Preferencias</h2>

                    <div className={styles.card}>
                        <div className={styles.sectionLabel}>
                            <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 7 4 4 20 4 20 7"/>
                                <line x1="9" y1="20" x2="15" y2="20"/>
                                <line x1="12" y1="4" x2="12" y2="20"/>
                            </svg>
                            Escala de lectura
                        </div>
                        <div className={styles.rangeWrapper}>
                            <input
                                type="range"
                                min="100" max="130" step="5"
                                value={tempConfig.fontScale}
                                onChange={(e) => updateConfig('fontScale', parseInt(e.target.value))}
                                className={styles.range}
                            />
                            <div className={styles.rangeLabels}>
                                <span>100%</span>
                                <span style={{ color: '#276e4a', opacity: 1, fontWeight: 700 }}>
                                    {tempConfig.fontScale}%
                                </span>
                                <span>130%</span>
                            </div>
                        </div>
                    </div>

                </Container>
            </div>
        </>
    );
};

export default Configuracion;