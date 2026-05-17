import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Toast, ToastContainer } from 'react-bootstrap'; // Añadimos Toast

const Login = () => {
  const { user, setUserInfo } = useContext(AppContext);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  // Estado para el PopUp (Toast)
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleLogin = async () => {
    // Validación de campos vacíos
    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg('Por favor, completa todos los campos');
      setShowToast(true);
      return;
    }
    
    await setUserInfo({ nombre, apellido });
    navigate('/');
  };

  const styles = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      maxWidth: '400px',
      width: '100%',
      padding: '40px 30px',
      borderRadius: '2px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 10,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      borderRadius: '2px',
      padding: '12px 15px',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      marginBottom: '10px', // Reducido para dar espacio al contador
    },
    charCounter: {
      fontSize: '0.55rem',
      color: 'rgba(255,255,255,0.3)',
      textAlign: 'right',
      marginBottom: '15px',
      display: 'block',
      letterSpacing: '1px'
    },
    button: {
      background: 'none',
      border: '1px solid #00d4ff',
      color: '#00d4ff',
      borderRadius: '2px',
      padding: '12px',
      fontWeight: '300',
      fontSize: '0.7rem',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      transition: '0.4s',
      marginTop: '10px'
    },
    toast: {
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      color: '#ff4d4d',
      border: '1px solid rgba(255, 77, 77, 0.2)',
      borderRadius: '2px',
      backdropFilter: 'blur(10px)'
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* PopUp de Error (Toast) */}
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          style={styles.toast}
        >
          <Toast.Body style={{ fontSize: '0.7rem', letterSpacing: '2px', textAlign: 'center' }}>
            {errorMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="login-bokeh">
        <div className="sphere s1"></div>
        <div className="sphere s2"></div>
      </div>

      <Card style={styles.card}>
        <div className="text-center mb-5">
          <span style={{ fontSize: '0.6rem', letterSpacing: '5px', color: '#00d4ff', textTransform: 'uppercase' }}>Bienvenido a</span>
          <h2 style={{ fontWeight: '200', color: '#fff', letterSpacing: '3px', marginTop: '10px' }}>ORACIONES BAHÁ'ÍS</h2>
        </div>

        <Form>
          <Form.Control
            placeholder="NOMBRE"
            value={nombre}
            maxLength={10} // Restricción de 10 caracteres
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
            className="custom-input"
          />
          <span style={styles.charCounter}>{nombre.length}/10</span>

          <Form.Control
            placeholder="APELLIDO"
            value={apellido}
            maxLength={10} // Restricción de 10 caracteres
            onChange={(e) => setApellido(e.target.value)}
            style={styles.input}
            className="custom-input"
          />
          <span style={styles.charCounter}>{apellido.length}/10</span>

          <Button
            onClick={handleLogin}
            className="w-100 login-btn"
            style={styles.button}
          >
            Comenzar
          </Button>
        </Form>
      </Card>

      <style>{`
        .custom-input::placeholder {
          color: rgba(255,255,255,0.2) !important;
          font-size: 0.6rem;
          letter-spacing: 2px;
        }

        .custom-input:focus {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border-color: #00d4ff !important;
          color: #fff !important;
          box-shadow: none !important;
        }

        .login-btn:hover {
          background-color: rgba(0, 212, 255, 0.1) !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }

        .login-bokeh { position: absolute; width: 100%; height: 100%; top:0; left:0; z-index:1; }
        .sphere { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; }
        .s1 { width: 300px; height: 300px; background: #00d4ff; top: -5%; right: -5%; }
        .s2 { width: 400px; height: 400px; background: #0033ff; bottom: -10%; left: -10%; opacity: 0.1; }
      `}</style>
    </div>
  );
};

export default Login;