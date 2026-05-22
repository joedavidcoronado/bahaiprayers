import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import styles from "./Condiciones.module.css";

const clausulas = [
    {
        numero: "01",
        titulo: "Naturaleza de la aplicación",
        texto: "Esta aplicación es un proyecto sin fines de lucro, desarrollado de forma voluntaria con el propósito de facilitar el acceso a oraciones y escritos de la Fe Bahá'í. No tiene carácter comercial, no genera ingresos y no está afiliada a ninguna institución oficial."
    },
    {
        numero: "02",
        titulo: "Uso de la información personal",
        texto: "La aplicación únicamente solicita tu nombre y apellido con el propósito de personalizar tu experiencia. Esta información se almacena localmente en tu dispositivo y nunca es transmitida, compartida ni almacenada en servidores externos."
    },
    {
        numero: "03",
        titulo: "Datos y almacenamiento local",
        texto: "Toda la información generada dentro de la app — incluyendo reflexiones, notas y configuraciones — se guarda exclusivamente en el almacenamiento local de tu dispositivo. Al desinstalar la aplicación, estos datos se eliminan de forma permanente."
    },
    {
        numero: "04",
        titulo: "Contenido y propiedad intelectual",
        texto: "Los textos, oraciones y escritos presentados en esta aplicación pertenecen al patrimonio espiritual de la Fe Bahá'í y son reproducidos con fines educativos y devocionales, sin ningún tipo de beneficio económico. Se reconoce y respeta la autoría de todas las fuentes originales."
    },
    {
        numero: "05",
        titulo: "Conexión a internet",
        texto: "La app puede realizar conexiones puntuales a internet para obtener datos astronómicos locales (amanecer y ocaso) en función de tu ubicación geográfica. Esta información se almacena en caché para minimizar el uso de datos. La geolocalización es opcional y puede denegarse sin afectar las funciones principales."
    },
    {
        numero: "06",
        titulo: "Ausencia de publicidad",
        texto: "Esta aplicación no contiene publicidad de ningún tipo, no utiliza redes de anuncios y no recopila datos de comportamiento con fines de marketing. La experiencia del usuario es el único fin de su desarrollo."
    },
    {
        numero: "07",
        titulo: "Responsabilidad y garantías",
        texto: "La aplicación se ofrece tal como está, sin garantías de disponibilidad continua o ausencia de errores. Los desarrolladores no asumen responsabilidad por pérdida de datos derivada del uso del dispositivo, actualizaciones del sistema operativo o desinstalación de la app."
    },
    {
        numero: "08",
        titulo: "Modificaciones",
        texto: "Estas condiciones pueden actualizarse en futuras versiones de la aplicación. Se notificará al usuario de cualquier cambio relevante mediante una actualización en la tienda de aplicaciones. El uso continuado de la app implica la aceptación de los términos vigentes."
    },
    {
        numero: "09",
        titulo: "Contacto",
        texto: "Si tienes preguntas, sugerencias o deseas reportar un problema, puedes comunicarte a través de los canales indicados en la página de la aplicación en la tienda correspondiente. Tu retroalimentación es bienvenida y contribuye a mejorar la experiencia para toda la comunidad."
    },
];

const Condiciones = () => {
    const navigate = useNavigate();

    return (
        <>
            <SideBar />

            <div className={styles.page}>
                <Container className={styles.container}>

                    {/* Volver */}
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← Volver
                    </button>

                    {/* Encabezado */}
                    <div className={styles.headerBlock}>
                        <h2 className={styles.title}>Términos de uso</h2>
                        <p className={styles.subtitle}>Condiciones de la aplicación</p>
                        <div className={styles.separator} />
                    </div>

                    {/* Badge */}
                    <div className={styles.badge}>
                        <div className={styles.badgeDot} />
                        <span className={styles.badgeText}>App sin fines de lucro · Uso personal</span>
                        <div className={styles.badgeDot} />
                    </div>

                    {/* Cláusulas */}
                    {clausulas.map((c) => (
                        <div key={c.numero} className={styles.section}>
                            <span className={styles.sectionLabel}>{c.numero}</span>
                            <h3 className={styles.sectionTitle}>{c.titulo}</h3>
                            <p className={styles.sectionText}>{c.texto}</p>
                        </div>
                    ))}

                    {/* Meta */}
                    <div className={styles.metaRow}>
                        <span className={styles.metaText}>Versión 1.0</span>
                        <span className={styles.metaText}>Mayo 2025</span>
                    </div>

                </Container>
            </div>
        </>
    );
};

export default Condiciones;