    import { useEffect, useState, useContext } from "react";
    import { Container } from "react-bootstrap";
    import SideBar from "../components/SideBar";
    import { useNavigate } from "react-router-dom";
    import { AppContext } from "../context/AppContext";
    import { motion, useAnimationControls } from "framer-motion";
    import OracionesList from "./OracionesList";
    import styles from "./Principal.module.css";
    import miLogo from "../../assets/logo.svg";

    /* ── Cálculo de fecha Badí ─────────────────────────────────── */
    const MESES_BADI = [
        "Bahá", "Jalál", "Jamál", "'Aẓamat", "Núr", "Raḥmat",
        "Kalimát", "Kamál", "Asmá'", "'Izzat", "Mashíyyat", "'Ilm",
        "Qudrat", "Qawl", "Masá'il", "Sharaf", "Sulṭán", "Mulk",
        "Ayyám-i-Há", "'Alá'"
    ];

    const calcularFechaBadi = (fechaActual) => {
        const añoActual = fechaActual.getFullYear();
        let nawRuz = new Date(añoActual, 2, 20);
        if (fechaActual < nawRuz) nawRuz = new Date(añoActual - 1, 2, 20);

        const añoBadi = nawRuz.getFullYear() - 1843;
        const difDias = Math.floor((fechaActual - nawRuz) / 864e5);

        let diaBadi, nombreMes;

        if (difDias < 342) {
            diaBadi   = (difDias % 19) + 1;
            nombreMes = MESES_BADI[Math.floor(difDias / 19)];
        } else {
            const proximoNawRuz = new Date(nawRuz.getFullYear() + 1, 2, 20);
            const inicioAla     = new Date(proximoNawRuz);
            inicioAla.setDate(inicioAla.getDate() - 19);

            if (fechaActual >= inicioAla) {
                diaBadi   = Math.floor((fechaActual - inicioAla) / 864e5) + 1;
                nombreMes = MESES_BADI[19];
            } else {
                const inicioAyyam = new Date(nawRuz);
                inicioAyyam.setDate(inicioAyyam.getDate() + 342);
                diaBadi   = Math.floor((fechaActual - inicioAyyam) / 864e5) + 1;
                nombreMes = MESES_BADI[18];
            }
        }

        return { dia: diaBadi, mes: nombreMes, año: añoBadi };
    };

    /* ── Variantes de animación ────────────────────────────────── */
    const containerVariants = {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.4, delayChildren: 0.3 } }
    };

    const itemVariants = {
        hidden:  { opacity: 0, y: 15, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 1.2, ease: "easeOut" } }
    };

    const elegantTransition = { type: "spring", stiffness: 300, damping: 30 };

    /* ── Componente ────────────────────────────────────────────── */
    const Principal = () => {
        const [currentTime,  setCurrentTime]  = useState(new Date());
        const [date,         setDate]         = useState(null);
        const [astro,        setAstro]        = useState({ sunrise: '--:--', sunset: '--:--', noon: '--:--' });
        const [isAppReady,   setIsAppReady]   = useState(false);
        const [activeScreen, setActiveScreen] = useState(0);

        const navigate = useNavigate();
        const { user } = useContext(AppContext);
        const controls = useAnimationControls();

        /* 1. Reloj y fecha Badí */
        useEffect(() => {
            const timer = setInterval(() => {
                const ahora = new Date();
                setCurrentTime(ahora);
                setDate({
                    badi:      calcularFechaBadi(ahora),
                    gregorian: {
                        year:  ahora.getFullYear(),
                        month: String(ahora.getMonth() + 1).padStart(2, '0'),
                        day:   String(ahora.getDate()).padStart(2, '0')
                    }
                });
            }, 1000);

            const readyTimer = setTimeout(() => setIsAppReady(true), 150);
            return () => { clearInterval(timer); clearTimeout(readyTimer); };
        }, []);


        /* 3. Protección de ruta */
        useEffect(() => {
            if (!user) navigate("/login");
        }, [user, navigate]);

        /* 4. Datos astronómicos (con caché) */
        useEffect(() => {
            const fetchAstroData = async () => {
                const hoy       = new Date().toDateString();
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
                    const resSun  = await fetch(PROXY_URL + encodeURIComponent(
                        `https://api.sunrise-sunset.org/json?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&formatted=0`
                    ));
                    const sunData = await resSun.json();
                    const fmt     = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const nuevosDatos = {
                        sunrise: fmt(sunData.results.sunrise),
                        sunset:  fmt(sunData.results.sunset),
                        noon:    fmt(sunData.results.solar_noon),
                    };

                    setAstro(nuevosDatos);
                    localStorage.setItem("astroData", JSON.stringify(nuevosDatos));
                    localStorage.setItem("astroDate", hoy);
                } catch (e) { console.error("Error astro:", e); }
            };

            fetchAstroData();
        }, []);

        const handleDragEnd = (_, info) => {
            const { x: vx } = info.velocity;
            const { x: ox } = info.offset;
            const threshold = window.innerWidth / 3;

            if (activeScreen === 0 && (vx < -400 || ox < -threshold)) {
                controls.start({ x: -window.innerWidth, transition: elegantTransition });
                setActiveScreen(1);
            } else if (activeScreen === 1 && vx > 150) {
                controls.start({ x: 0, transition: elegantTransition });
                setActiveScreen(0);
            } else {
                controls.start({ x: activeScreen === 0 ? 0 : -window.innerWidth, transition: elegantTransition });
            }
        };

        const astroItems = [
            { label: "Amanecer", value: astro.sunrise },
            { label: "Mediodía", value: astro.noon },
            { label: "Ocaso",    value: astro.sunset },
        ];

        return (
            <>
                <SideBar />

                <div className={styles.viewport}>
                    <div className={styles.contentVisible}>
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: -window.innerWidth, right: 0 }}
                            dragElastic={0.05}
                            dragDirectionLock={false}
                            dragMomentum={false}
                            animate={controls}
                            onDragEnd={handleDragEnd}
                            className={styles.slider}
                        >
                            {/* ── Pantalla 1: reloj + fecha*/}
                            <div className={styles.screen}>

                                <div className={styles.wrapper}>
                                    <div
                                        className={styles.bokehContainer}
                                        style={{ opacity: isAppReady ? 1 : 0 }}
                                    >
                                        <div className={`${styles.bokeh} ${styles.p1}`} />
                                        <div className={`${styles.bokeh} ${styles.p2}`} />
                                        <div className={`${styles.bokeh} ${styles.p3}`} />
                                    </div>
                                    <div className={styles.brickAnim} style={{ opacity: isAppReady ? 1 : 0, transition: 'opacity 0.3s ease-out 2.2s', transform: 'translateY(-40px)'  }}>
                                        <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                                            <defs>
                                                <style>{`
                                                    .brick1 {
                                                        transform-origin: 165px 180px;
                                                        animation: fall1 0.45s cubic-bezier(0.6, 0, 1, 1) 2.5s both;
                                                    }
                                                    .brick2 {
                                                        transform-origin: 110px 180px;
                                                        animation: fall2 0.45s cubic-bezier(0.6, 0, 1, 1) 3.2s both;
                                                    }
                                                    @keyframes fall1 {
                                                        0%   { transform: rotate(0deg);  }
                                                        75%  { transform: rotate(95deg); }
                                                        85%  { transform: rotate(87deg); }
                                                        92%  { transform: rotate(91deg); }
                                                        100% { transform: rotate(90deg); }
                                                    }
                                                    @keyframes fall2 {
                                                        0%   { transform: rotate(0deg);  }
                                                        75%  { transform: rotate(55deg); }
                                                        85%  { transform: rotate(47deg); }
                                                        92%  { transform: rotate(51deg); }
                                                        100% { transform: rotate(50deg); }
                                                    }
                                                `}</style>
                                            </defs>
                                            <g className="brick1">
                                                <rect x="140" y="90" width="50" height="90" rx="4" fill="white" opacity="0.95"/>
                                            </g>
                                            <g className="brick2">
                                                <rect x="85" y="90" width="50" height="90" rx="4" fill="white" opacity="0.95"/>
                                            </g>
                                        </svg>
                                    </div>
                                    <Container
                                        as={motion.div}
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate={isAppReady ? "visible" : "hidden"}
                                        className="text-center"
                                        style={{ zIndex: 2, position: 'relative', transform: 'translateY(-40px)' }}
                                    >
                                        <motion.div variants={itemVariants} className={styles.digitalClock}>
                                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            <span className={styles.clockSeconds}>
                                                {currentTime.getSeconds().toString().padStart(2, '0')}
                                            </span>
                                        </motion.div>

                                        {date && (
                                            <motion.div variants={itemVariants} className={styles.badiDate}>
                                                <div className={styles.badiDateMain}>
                                                    {date.badi.dia} {date.badi.mes} {date.badi.año}
                                                </div>
                                                <div className={styles.gregorianDate}>
                                                    {date.gregorian.year} • {date.gregorian.month} • {date.gregorian.day}
                                                </div>
                                            </motion.div>
                                        )}

                                        <motion.div variants={itemVariants} className={styles.astroRow}>
                                            {astroItems.map((item) => (
                                                <div key={item.label} className={styles.astroItem}>
                                                    <span className={styles.astroLabel}>{item.label}</span>
                                                    <span className={styles.astroValue}>{item.value}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </Container>

                                    <div className={styles.swipeHint} style={{ opacity: isAppReady ? 0.8 : 0, transition: 'opacity 1.2s ease-out 1.5s' }}>
                                        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M 32 4 Q 4 22 32 40"
                                                stroke="rgba(40, 220, 143, 0.12)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                fill="rgba(40, 220, 143, 0.12)"
                                            />
                                            <polyline
                                                points="31,17 27,22 31,27"
                                                stroke="gray"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                            />
                                        </svg>
                                    </div>
                                    <img 
                                        src={miLogo}
                                        className={styles.bottomLogo} 
                                        alt="Logo Inferior" 
                                        style={{ opacity: isAppReady ? 0.8 : 0, transition: 'opacity 1.2s ease-out 1.5s' }}
                                    />
                                </div>
                            </div>

                            {/* ── Pantalla 2: oraciones ── */}
                            <div className={styles.screenOraciones}>
                                <OracionesList />
                            </div>
                            
                        </motion.div>
                    </div>
                    
                </div>
            </>
        );
    };

    export default Principal;