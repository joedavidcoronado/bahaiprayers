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
        fontScale:  100,
        lineHeight: 1.6,
        theme:      'luxury',
        animations: true
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

                    {/* Volver */}
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← Volver
                    </button>

                    <h2 className={styles.title}>Preferencias</h2>

                    {/* ── Escala de lectura ── */}
                    <div className={styles.card}>
                        <div className={styles.sectionLabel}>
                            <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
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

                    {/* ── Espaciado de líneas ── */}
                    <div className={styles.card}>
                        <div className={styles.sectionLabel}>
                            <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
                            </svg>
                            Espaciado de líneas
                        </div>
                        <div className={styles.optionRow}>
                            {[
                                { val: 1.4, label: 'Mín' },
                                { val: 1.6, label: 'Med' },
                                { val: 1.9, label: 'Máx' },
                            ].map(({ val, label }) => (
                                <button
                                    key={val}
                                    className={`${styles.optionBtn} ${tempConfig.lineHeight === val ? styles.optionBtnActive : ''}`}
                                    onClick={() => updateConfig('lineHeight', val)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Efectos visuales ── */}
                    <div className={styles.card}>
                        <div className={styles.cardRow}>
                            <div className={styles.sectionLabelInline}>
                                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                                </svg>
                                Efectos visuales
                            </div>
                            <button
                                className={`${styles.toggle} ${tempConfig.animations ? styles.toggleActive : ''}`}
                                onClick={() => updateConfig('animations', !tempConfig.animations)}
                            >
                                <div className={`${styles.toggleThumb} ${tempConfig.animations ? styles.toggleThumbActive : ''}`} />
                            </button>
                        </div>
                    </div>

                </Container>
            </div>
        </>
    );
};

export default Configuracion;