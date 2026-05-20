import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Toast, ToastContainer } from 'react-bootstrap';
import styles from './Login.module.css';

const Login = () => {
    const { user, setUserInfo } = useContext(AppContext);
    const navigate = useNavigate();

    const [nombre,    setNombre]    = useState('');
    const [apellido,  setApellido]  = useState('');
    const [showToast, setShowToast] = useState(false);
    const [errorMsg,  setErrorMsg]  = useState('');

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleLogin = async () => {
        if (!nombre.trim() || !apellido.trim()) {
            setErrorMsg('Por favor, completa todos los campos');
            setShowToast(true);
            return;
        }
        await setUserInfo({ nombre, apellido });
        navigate('/');
    };

    return (
        <div className={styles.wrapper}>

            {/* Toast de error */}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    className={styles.toast}
                >
                    <Toast.Body className={styles.toastBody}>
                        {errorMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Bokeh */}
            <div className={styles.bokeh}>
                <div className={`${styles.sphere} ${styles.s1}`} />
                <div className={`${styles.sphere} ${styles.s2}`} />
            </div>

            {/* Card */}
            <Card className={styles.card}>
                <div className="text-center mb-5">
                    <span className={styles.cardSubtitle}>Bienvenido a</span>
                    <h2 className={styles.cardTitle}>ORACIONES BAHÁ'ÍS</h2>
                </div>

                <Form>
                    <Form.Control
                        placeholder="NOMBRE"
                        value={nombre}
                        maxLength={10}
                        onChange={(e) => setNombre(e.target.value)}
                        className={styles.input}
                    />
                    <span className={styles.charCounter}>{nombre.length}/10</span>

                    <Form.Control
                        placeholder="APELLIDO"
                        value={apellido}
                        maxLength={10}
                        onChange={(e) => setApellido(e.target.value)}
                        className={styles.input}
                    />
                    <span className={styles.charCounter}>{apellido.length}/10</span>

                    <Button
                        onClick={handleLogin}
                        className={`w-100 ${styles.button}`}
                    >
                        Comenzar
                    </Button>
                </Form>
            </Card>

        </div>
    );
};

export default Login;