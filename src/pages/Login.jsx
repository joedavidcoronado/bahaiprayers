import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { motion } from 'framer-motion';
import styles from './Login.module.css';
import miLogo from '../../assets/logo2.png';

const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden:  { opacity: 0, y: 16, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 1.1, ease: 'easeOut' } }
};

const Login = () => {
    const { user, setUserInfo } = useContext(AppContext);
    const navigate = useNavigate();

    const [nombre,    setNombre]    = useState('');
    const [apellido,  setApellido]  = useState('');
    const [showToast, setShowToast] = useState(false);
    const [errorMsg,  setErrorMsg]  = useState('');
    const [ready,     setReady]     = useState(false);

    useEffect(() => {
        if (user) navigate('/Principal');
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, [user, navigate]);

    const handleLogin = async () => {
        if (!nombre.trim() || !apellido.trim()) {
            setErrorMsg('Por favor, completa todos los campos');
            setShowToast(true);
            return;
        }
        await setUserInfo({ nombre, apellido });
        navigate('/Principal');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
    <div className={styles.wrapper}>

        {/* Toast */}
        <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                className={styles.toast}
            >
                <Toast.Body className={styles.toastBody}>{errorMsg}</Toast.Body>
            </Toast>
        </ToastContainer>

        {/* Bokeh */}
        <div className={styles.bokehContainer}>
            <div className={`${styles.bokeh} ${styles.p1}`} />
            <div className={`${styles.bokeh} ${styles.p2}`} />
            <div className={`${styles.bokeh} ${styles.p3}`} />
        </div>

        {/* Contenido animado */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}
        >
            {/* Subtítulo encima del card */}
            

            {/* Card de vidrio */}
            <motion.div variants={itemVariants} className={styles.glassCard}>
                <div className={styles.logoWrapper}>
                    <span className={styles.appSubtitle}>Bienvenido a</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                    <img src={miLogo} className={styles.logoCard} alt="Logo" />
                </div>

                <Form onKeyDown={handleKeyDown}>

                    <div className={styles.inputGroup}>
                        <Form.Control
                            placeholder="Nombre"
                            value={nombre}
                            maxLength={10}
                            onChange={(e) => setNombre(e.target.value)}
                            className={styles.input}
                        />
                        <span className={styles.charCounter}>{nombre.length}/10</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <Form.Control
                            placeholder="Apellido"
                            value={apellido}
                            maxLength={10}
                            onChange={(e) => setApellido(e.target.value)}
                            className={styles.input}
                        />
                        <span className={styles.charCounter}>{apellido.length}/10</span>
                    </div>

                    <Button
                        onClick={handleLogin}
                        className={`w-100 ${styles.button}`}
                    >
                        Comenzar
                    </Button>

                </Form>
            </motion.div>

        </motion.div>

    </div>
);
};

export default Login;