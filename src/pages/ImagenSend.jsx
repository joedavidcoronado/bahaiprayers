// ImagenSend.jsx
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../context/AppContext";
import html2canvas from "html2canvas";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import styles from "./ImagenSend.module.css";

const getSufijo = (idioma) => idioma === "es" ? "" : `_${idioma}`;

const MIN_CHARS_PER_PAGE = 300; // mínimo de chars para que una página "valga"
const MAX_CHARS_PER_PAGE = 600; // máximo antes de cortar

/* ── Split inteligente por párrafos ── */
const buildPages = (oracion) => {
  const segments = [
    ...oracion.previo.map(t   => ({ text: t, type: "italic" })),
    ...oracion.parrafos.map(t => ({ text: t, type: "normal" })),
    ...oracion.post.map(t     => ({ text: t, type: "italic" })),
  ].filter(s => s.text?.trim());

  if (!segments.length) return [[]];

  const totalChars = segments.reduce((a, s) => a + s.text.length, 0);
  if (totalChars <= MAX_CHARS_PER_PAGE) return [segments]; // una sola página

  const pages = [];
  let current = [], currentChars = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const wouldExceed = currentChars + seg.text.length > MAX_CHARS_PER_PAGE;
    const hasMinimum  = currentChars >= MIN_CHARS_PER_PAGE;
    const isLast      = i === segments.length - 1;

    if (wouldExceed && hasMinimum && !isLast) {
      pages.push(current);
      current      = [seg];
      currentChars = seg.text.length;
    } else {
      current.push(seg);
      currentChars += seg.text.length;
    }
  }

  // La última página: si quedó muy corta, la fusionamos con la anterior
  if (current.length > 0) {
    if (pages.length > 0 && currentChars < MIN_CHARS_PER_PAGE) {
      pages[pages.length - 1] = [...pages[pages.length - 1], ...current];
    } else {
      pages.push(current);
    }
  }

  return pages;
};

/* ── Poster individual (usado en preview y en captura) ── */
const PosterSlide = React.forwardRef(({ oracion, pageSegments, pageIdx, totalPages, theme, fontFamily, fontSize, styles: s }, ref) => {
  const isFirst = pageIdx === 0;
  const isLast  = pageIdx === totalPages - 1;
  const isMulti = totalPages > 1;

  return (
    <div
      ref={ref}
      className={s.poster}
      style={{ background: theme.grad, border: theme.border || "none", fontFamily }}
    >
      {/* Línea decorativa superior */}
      <div className={s.posterLineTop} style={{ background: theme.accent }} />

      <div className={s.innerContent}>

        {isFirst && (
          <div className={s.posterHeader}>
            <span className={s.cat} style={{ color: theme.accent }}>
              {oracion.categoria}
            </span>
            {oracion.titulo ? (
              <h2 className={s.titulo} style={{ color: theme.color }}>
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
          style={{ fontSize: `${fontSize}rem`, color: theme.color }}
        >
          {pageSegments.map((seg, i) => (
            <p key={i} className={seg.type === "italic" ? s.italic : s.normal}>
              {seg.text}
            </p>
          ))}
        </div>

        {isLast && (
          <span className={s.autor} style={{ color: theme.color }}>
            — {oracion.autor}
          </span>
        )}

        {/* Footer */}
        <div className={s.posterFooter}>
          <img src="/logo2.png" alt="" className={s.logoImg} />
          {isMulti && (
            <span className={s.pageNumFooter} style={{ color: theme.accent }}>
              {pageIdx + 1} / {totalPages}
            </span>
          )}
        </div>

      </div>

      {/* Línea decorativa inferior */}
      <div className={s.posterLineBottom} style={{ background: theme.accent }} />
    </div>
  );
});

/* ── Componente principal ── */
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

  const captureRefs = useRef([]);

  const themes = [
    { name: "Noche",    grad: "linear-gradient(160deg, #060818 0%, #0d1033 100%)",  color: "#e8eaf6", accent: "#7986cb" },
    { name: "Amanecer", grad: "linear-gradient(160deg, #1a0a0f 0%, #3d1a22 100%)",  color: "#fce4ec", accent: "#f48fb1" },
    { name: "Místico",  grad: "linear-gradient(160deg, #071410 0%, #0e2820 100%)",  color: "#e0f2f1", accent: "#80cbc4" },
    { name: "Elegante", grad: "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 100%)",  color: "#f5f5f0", accent: "#d4b483", border: "1px solid rgba(212,180,131,0.2)" },
    { name: "Cielo",    grad: "linear-gradient(160deg, #0d1b2a 0%, #1b2d42 100%)",  color: "#e3f2fd", accent: "#90caf9" },
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

  /* ── Compartir ── */
  const handleShare = async () => {
    setLoading(true);
    try {
      const uris = [];
      for (let i = 0; i < pages.length; i++) {
        const el = captureRefs.current[i];
        if (!el) continue;
        const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#000" });
        const saved  = await Filesystem.writeFile({
          path: `oracion_${Date.now()}_${i}.png`,
          data: canvas.toDataURL("image/png").split(",")[1],
          directory: Directory.Cache,
        });
        uris.push(saved.uri);
      }
      await Share.share({
        title:       oracion.titulo || "Oración",
        text:        "Compartido desde Oraciones Bahá'ís",
        files:       uris,
        dialogTitle: "Compartir Oración",
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo compartir.");
    } finally {
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

          {/* Poster visible */}
          <div className={styles.posterVisible}>
            <PosterSlide
              oracion={oracion}
              pageSegments={pages[currentPage] || []}
              pageIdx={currentPage}
              totalPages={pages.length}
              theme={theme}
              fontFamily={fontFamily}
              fontSize={fontSize}
              styles={styles}
            />
          </div>

          {/* Posters ocultos para captura (todos menos el actual) */}
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
                styles={styles}
              />
            ))}
          </div>

          {/* Navegación */}
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

            <div className={styles.controlRow}>
              <span className={styles.label}>LETRA</span>
              <input
                type="range" min="0.75" max="1.3" step="0.05"
                value={fontSize}
                onChange={e => setFontSize(parseFloat(e.target.value))}
                className={styles.range}
              />
            </div>

            <div className={styles.controlRow}>
              <span className={styles.label}>TEMA</span>
              <div className={styles.chipRow}>
                {themes.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTheme(i)}
                    className={`${styles.themeChip} ${activeTheme === i ? styles.themeChipActive : ""}`}
                    style={{ background: t.grad }}
                  >
                    {activeTheme === i && <span className={styles.themeCheck}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Lora:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default ImagenSend;