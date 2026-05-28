import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import html2canvas from "html2canvas";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';
import { Share } from '@capacitor/share';
import styles from "./ImagenSend.module.css";

const getSufijo = (idioma) => idioma === "es" ? "" : `_${idioma}`;

const MIN_CHARS_PER_PAGE = 300;
const MAX_CHARS_PER_PAGE = 600;

const buildPages = (oracion) => {
  const segments = [
    ...oracion.previo.map(t   => ({ text: t, type: "italic" })),
    ...oracion.parrafos.map(t => ({ text: t, type: "normal" })),
    ...oracion.post.map(t     => ({ text: t, type: "italic" })),
  ].filter(s => s.text?.trim());

  if (!segments.length) return [[]];

  const totalChars = segments.reduce((a, s) => a + s.text.length, 0);
  if (totalChars <= MAX_CHARS_PER_PAGE) return [segments];

  // Calcular cuántas páginas necesitamos y repartir equitativamente
  const numPages = Math.ceil(totalChars / MAX_CHARS_PER_PAGE);
  const targetPerPage = Math.ceil(totalChars / numPages);

  const pages = [];
  let current = [], currentChars = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    if (currentChars + seg.text.length > targetPerPage 
        && current.length > 0 
        && pages.length < numPages - 1) {
      pages.push(current);
      current = [seg];
      currentChars = seg.text.length;
    } else {
      current.push(seg);
      currentChars += seg.text.length;
    }
  }

  if (current.length) pages.push(current);

  return pages;
};

const PosterSlide = React.forwardRef(({ oracion, pageSegments, pageIdx, totalPages, theme, fontFamily, fontSize, textColor, styles: s }, ref) => {
  const isFirst = pageIdx === 0;
  const isLast  = pageIdx === totalPages - 1;
  const isMulti = totalPages > 1;

  return (
    <div
      ref={ref}
      className={s.poster}
      style={{ background: theme.grad, border: theme.border || "none", fontFamily }}
    >
      <div className={s.posterLineTop} style={{ background: theme.accent }} />

      <div className={s.innerContent}>

        {isFirst && (
          <div className={s.posterHeader}>
            <span className={s.cat} style={{ color: theme.accent }}>
              {oracion.categoria}
            </span>
            {oracion.titulo ? (
              <h2 className={s.titulo} style={{ color: textColor || theme.color }}>
                {oracion.titulo}
              </h2>
            ) : null}
            <div className={s.titleDivider} style={{ background: theme.accent }} />
          </div>
        )}

        {!isFirst && isMulti && (
          <div className={s.continuationMark} style={{ color: theme.accent }}>
            ✦
          </div>
        )}

        <div
          className={s.bodyText}
          style={{ fontSize: `${fontSize}rem`, color: textColor || theme.color }}
        >
          {pageSegments.map((seg, i) => (
            <p key={i} className={seg.type === "italic" ? s.italic : s.normal}>
              {seg.text}
            </p>
          ))}
        </div>

        {isLast && (
          <span className={s.autor} style={{ color: textColor || theme.color }}>
            — {oracion.autor}
          </span>
        )}

        <div className={s.posterFooter}>
          <img src="/logo2.png" alt="" className={s.logoImg} />
          {isMulti && (
            <span className={s.pageNumFooter} style={{ color: theme.accent }}>
              {pageIdx + 1} / {totalPages}
            </span>
          )}
        </div>

      </div>

      <div className={s.posterLineBottom} style={{ background: theme.accent }} />
    </div>
  );
});

const ImagenSend = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();
  const idioma        = location.state?.idioma || "es";
  const s             = getSufijo(idioma);

  const { db }        = useContext(AppContext);
  const [oracion,     setOracion]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [fontFamily,  setFontFamily]  = useState("'Lora', serif");
  const [fontSize,    setFontSize]    = useState(1.0);
  const [activeTheme, setActiveTheme] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [textColor,   setTextColor]   = useState(null);
  const [showModal,   setShowModal]   = useState(false);

  const captureRefs = useRef([]);
  const visibleRef  = useRef(null);

  const themes = [
    { name: "Noche",     grad: "linear-gradient(160deg, #060818 0%, #0d1033 100%)",  color: "#e8eaf6", accent: "#7986cb" },
    { name: "Amanecer",  grad: "linear-gradient(160deg, #1a0a0f 0%, #3d1a22 100%)",  color: "#fce4ec", accent: "#f48fb1" },
    { name: "Místico",   grad: "linear-gradient(160deg, #071410 0%, #0e2820 100%)",  color: "#e0f2f1", accent: "#80cbc4" },
    { name: "Elegante",  grad: "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 100%)",  color: "#f5f5f0", accent: "#d4b483", border: "1px solid rgba(212,180,131,0.2)" },
    { name: "Cielo",     grad: "linear-gradient(160deg, #0d1b2a 0%, #1b2d42 100%)",  color: "#e3f2fd", accent: "#90caf9" },
    { name: "Jardín",    grad: "linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 100%)",  color: "#1b5e20", accent: "#276e4a" },
    { name: "Niebla",    grad: "linear-gradient(160deg, #f1f8f4 0%, #dceee4 100%)",  color: "#2e4a38", accent: "#4caf7d" },
    { name: "Esmeralda", grad: "linear-gradient(160deg, #e0f2ec 0%, #b2dfdb 100%)",  color: "#004d40", accent: "#00897b" },
    { name: "Alba",      grad: "linear-gradient(160deg, #fffde7 0%, #e8f5e9 100%)",  color: "#33691e", accent: "#7cb342" },
  ];

  const fonts = [
    { name: "Serena",  family: "'Lora', serif"             },
    { name: "Clásica", family: "'Playfair Display', serif" },
    { name: "Moderna", family: "'Inter', sans-serif"       },
  ];

  useEffect(() => {
    const load = async () => {
      if (!db) return;
      const res = await db.query(`SELECT * FROM oraciones${s} WHERE id = ?`, [id]);
      if (res.values.length > 0) {
        const data = res.values[0];
        setOracion({
          ...data,
          previo:   JSON.parse(data.previo   || "[]"),
          parrafos: JSON.parse(data.parrafos || "[]"),
          post:     JSON.parse(data.post     || "[]"),
        });
      }
    };
    load();
  }, [db, id, s]);

  const pages = useMemo(() => oracion ? buildPages(oracion) : [], [oracion]);

  useEffect(() => { setCurrentPage(0); }, [pages.length]);

  const handleShare = async () => {
    setLoading(true);
    const savedPage = currentPage;
    try {
      const canvases = [];
      for (let i = 0; i < pages.length; i++) {
        setCurrentPage(i);
        await new Promise(r => setTimeout(r, 250));
        const el = visibleRef.current;
        if (!el) continue;
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });
        canvases.push(canvas);
      }

      if (canvases.length === 0) throw new Error("Sin imágenes");

      if (pages.length === 1) {
        const saved = await Filesystem.writeFile({
          path:      `oracion_${Date.now()}.png`,
          data:      canvases[0].toDataURL("image/png").split(",")[1],
          directory: Directory.Cache,
        });
        await Share.share({
          title:       oracion.titulo || "Oración",
          text:        "Compartido desde Oraciones Bahá'ís",
          files:       [saved.uri],
          dialogTitle: "Compartir Oración",
        });
      } else {
        await Media.requestPermissions();

        const { albums } = await Media.getAlbums();

        const writableAlbums = albums.filter(a => {
          const id = (a.identifier || "").toLowerCase();
          return !id.includes("/system/")
              && !id.includes("wallpaper")
              && !id.includes("ringtone")
              && !id.includes("notification")
              && !id.includes("alarm");
        });

        const target = writableAlbums.find(a => a.name === "Oraciones Bahai")
                    || writableAlbums.find(a => a.name === "Camera")
                    || writableAlbums.find(a => a.name === "DCIM")
                    || writableAlbums.find(a => a.name === "Pictures")
                    || writableAlbums[0];

        console.log("Álbumes disponibles:", JSON.stringify(writableAlbums.map(a => a.name)));
        console.log("Usando:", target?.name, target?.identifier);

        const albumIdentifier = target?.identifier;

        for (let i = 0; i < canvases.length; i++) {
          const saved = await Filesystem.writeFile({
            path:      `oracion_${Date.now()}_${i}.png`,
            data:      canvases[i].toDataURL("image/png").split(",")[1],
            directory: Directory.Cache,
          });
          await Media.savePhoto({ path: saved.uri, albumIdentifier });
        }
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message + " | " + JSON.stringify(err));
    } finally {
      setCurrentPage(savedPage);
      setLoading(false);
    }
  };

  if (!oracion) return (
    <div className={styles.loader}>
      <Spinner animation="grow" style={{ color: "#7986cb" }} />
    </div>
  );

  const theme = themes[activeTheme];

  return (
    <>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>← Volver</button>
          <div className={styles.headerCenter}>
            <h1 className={styles.mainTitle}>COMPARTIR</h1>
            {pages.length > 1 && (
              <span className={styles.pageIndicator}>
                imagen {currentPage + 1} de {pages.length}
              </span>
            )}
          </div>
          <button onClick={handleShare} className={styles.shareBtn} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} /> : "ENVIAR"}
          </button>
        </div>

        {/* ── Área de preview ── */}
        <div className={styles.previewArea}>

          <div className={styles.posterVisible}>
            <PosterSlide
              ref={visibleRef}
              oracion={oracion}
              pageSegments={pages[currentPage] || []}
              pageIdx={currentPage}
              totalPages={pages.length}
              theme={theme}
              fontFamily={fontFamily}
              fontSize={fontSize}
              textColor={textColor}
              styles={styles}
            />
          </div>

          <div className={styles.captureZone}>
            {pages.map((pageSegs, i) => (
              <PosterSlide
                key={i}
                ref={el => captureRefs.current[i] = el}
                oracion={oracion}
                pageSegments={pageSegs}
                pageIdx={i}
                totalPages={pages.length}
                theme={theme}
                fontFamily={fontFamily}
                fontSize={fontSize}
                textColor={textColor}
                styles={styles}
              />
            ))}
          </div>

          {pages.length > 1 && (
            <div className={styles.navRow}>
              <button
                className={styles.navBtn}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >←</button>

              <div className={styles.dots}>
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`${styles.dot} ${i === currentPage ? styles.dotActive : ""}`}
                  />
                ))}
              </div>

              <button
                className={styles.navBtn}
                onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                disabled={currentPage === pages.length - 1}
              >→</button>
            </div>
          )}
        </div>

        {/* ── Controles flotantes ── */}
        <div className={styles.floatingControls}>
          <div className={styles.floatingInner}>

            {/* LETRA + color de texto */}
            <div className={styles.controlRow}>
              <span className={styles.label}>LETRA</span>
              <input
                type="range" min="0.75" max="1.3" step="0.05"
                value={fontSize}
                onChange={e => setFontSize(parseFloat(e.target.value))}
                className={styles.range}
              />
              <div className={styles.colorDots}>
                <button
                  className={`${styles.colorDot} ${textColor === '#0f0f0f' ? styles.colorDotActive : ''}`}
                  style={{ background: '#0f0f0f' }}
                  onClick={() => setTextColor(textColor === '#0f0f0f' ? null : '#0f0f0f')}
                />
                <button
                  className={`${styles.colorDot} ${textColor === '#ffffff' ? styles.colorDotActive : ''}`}
                  style={{ background: '#ffffff' }}
                  onClick={() => setTextColor(textColor === '#ffffff' ? null : '#ffffff')}
                />
              </div>
            </div>

            {/* TEMA */}
            <div className={styles.controlRow}>
              <span className={styles.label}>TEMA</span>
              <div className={styles.chipRow}>
                {themes.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTheme(i)}
                    className={`${styles.themeChip} ${activeTheme === i ? styles.themeChipActive : ""}`}
                    style={{ background: t.grad }}
                  />
                ))}
              </div>
            </div>

            {/* FUENTE */}
            <div className={styles.controlRow}>
              <span className={styles.label}>FUENTE</span>
              <div className={styles.chipRow}>
                {fonts.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setFontFamily(f.family)}
                    className={`${styles.fontBtn} ${fontFamily === f.family ? styles.fontBtnActive : ""}`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Modal ── */}
      <div
        className={`${styles.modalOverlay} ${showModal ? styles.modalOverlayActive : ''}`}
        onClick={() => setShowModal(false)}
      >
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <span className={styles.modalBadge}>Imágenes guardadas</span>
          <h3 className={styles.modalTitle}>En tu galería</h3>
          <p className={styles.modalQuote}>
            Esta oración tiene {pages.length} páginas, así que las guardamos
            directamente en tu galería de fotos para que puedas compartirlas
            fácilmente desde ahí.
          </p>
          <div className={styles.modalCloseBtn} onClick={() => setShowModal(false)}>
            Entendido
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Lora:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default ImagenSend;