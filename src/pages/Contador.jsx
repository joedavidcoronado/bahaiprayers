import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faInfo } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import styles from './Contador.module.css';

const Contador = () => {
    const navigate = useNavigate();
    const MAX_COUNT = 95;
    const [count, setCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showRipple, setShowRipple] = useState(false);

    const handleIncrement = async () => {
        if (isModalOpen) return;
        if (count < MAX_COUNT) {
            const newCount = count + 1;
            setCount(newCount);
            try {
                await Haptics.impact({ style: ImpactStyle.Light });
                if (newCount === MAX_COUNT) {
                    setFinished(true);
                    setShowRipple(true);
                    setTimeout(() => setShowRipple(false), 2000);
                    await Haptics.vibrate({ duration: 800 });
                }
            } catch {
                if (navigator.vibrate) navigator.vibrate(15);
            }
        }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setShowRipple(false);
        setCount(0);
        setFinished(false);
    };

    const openModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const closeModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };

    return (
        <>
            <SideBar />

            <div
                className={`${styles.wrapper} ${finished ? styles.wrapperFinished : ''}`}
                onClick={handleIncrement}
            >
                <div className={`${styles.bokehContainer} ${finished ? styles.bokehContainerFinished : ''}`}>
                    <div className={`${styles.bokehSphere} ${styles.sphere1}`}></div>
                    <div className={`${styles.bokehSphere} ${styles.sphere2}`}></div>
                    <div className={`${styles.bokehSphere} ${styles.sphere3}`}></div>
                </div>

                {showRipple && <div className={styles.ripple} />}

                <button className={styles.backBtn} onClick={(e) => { e.stopPropagation(); navigate(-1); }}>
                    ← VOLVER
                </button>

                <div className={styles.infoArea} onClick={openModal}>
                    <FontAwesomeIcon icon={faInfo} style={{ opacity: 0.6 }} />
                </div>

                <div className={styles.resetArea} onClick={handleReset}>
                    <FontAwesomeIcon
                        icon={faUndo}
                        style={{ opacity: count > 0 ? 1 : 0.2, transition: 'opacity 0.3s' }}
                    />
                </div>

                <div className={styles.content}>
                    <span className={`${styles.heading} ${finished ? styles.headingFinished : ''}`}>
                        Recitación de
                    </span>
                    <h2 className={`${styles.sacredText} ${finished ? styles.sacredTextFinished : ''}`}>
                        Alláh-u-Abhá
                    </h2>
                    <div className={`${styles.counterNumber} ${finished ? styles.counterNumberFinished : ''}`}>
                        {count}
                    </div>
                    <div className={`${styles.progressInfo} ${finished ? styles.progressInfoFinished : ''}`}>
                        {finished ? "Completado" : `Faltan ${MAX_COUNT - count}`}
                    </div>
                </div>

                {!finished && count === 0 && (
                    <div className={styles.helperText}>TOCA PARA CONTAR</div>
                )}
            </div>

            <div
                className={`${styles.modalOverlay} ${isModalOpen ? styles.modalOverlayActive : ''}`}
                onClick={closeModal}
            >
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <span className={styles.modalBadge}>El Nombre Más Grande</span>
                    <h3 className={styles.modalTitle}>Alláh'u'Abhá</h3>
                    <p className={styles.modalSubtitle}>(Dios es el Todo Glorioso)</p>
                    <p className={styles.modalQuote}>
                        "Se ha ordenado a todo creyente en Dios, Señor del Juicio, que cada día, habiéndose lavado las manos y luego la cara, se siente y, volviéndose a Dios, repita noventa y cinco veces «Alláh-u-Abhá». Ése fue el decreto del Hacedor de los cielos cuando, con majestad y poder, Se estableció en los tronos de Sus Nombres".
                    </p>
                    <div className={styles.modalAuthor}>
                        Bahá'u'lláh, Kitáb-i-Aqdas, párr. 18
                    </div>
                    <div className={styles.modalCloseBtn} onClick={closeModal}>
                        Cerrar
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contador;