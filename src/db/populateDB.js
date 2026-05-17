import oracionesJSON from '../utils/oraciones.json'; 
import categoriasJSON from '../utils/categorias.json';
import mensajesJSON from '../utils/mensajes.json'; 
import { initDB } from './initDB';

export const populateDB = async () => {
    const db = await initDB();

    try {
        // --- POBLAR CATEGORÍAS ---
        const resCat = await db.query('SELECT COUNT(*) as count FROM categorias;');
        if (resCat.values[0].count === 0) {
            for (let c of categoriasJSON) {
                await db.run('INSERT INTO categorias (nombre) VALUES (?);', [c.nombre]);
            }
        }

        // --- POBLAR ORACIONES (Lógica Nueva) ---
        const resOra = await db.query('SELECT COUNT(*) as count FROM oraciones;');
        if (resOra.values[0].count === 0) {
            console.log("Poblando oraciones detalladas...");
            for (let o of oracionesJSON) {
                // Buscamos el ID de la categoría basado en el nombre del JSON
                const res = await db.query('SELECT id FROM categorias WHERE nombre = ?;', [o.categoria]);
                const categoriaID = res.values.length > 0 ? res.values[0].id : null;

                await db.run(
                    `INSERT INTO oraciones (titulo, previo, parrafos, post, autor, categoriaID) 
                     VALUES (?, ?, ?, ?, ?, ?);`, 
                    [
                        o.titulo || "",
                        JSON.stringify(o.previo || []),
                        JSON.stringify(o.parrafos || []),
                        JSON.stringify(o.post || []),
                        o.autor,
                        categoriaID
                    ]
                );
            }
        }

        // --- POBLAR BIBLIOTECA ---
        const resMsg = await db.query('SELECT COUNT(*) as count FROM biblioteca_mensajes;');
        if (resMsg.values[0].count === 0) {
            console.log("Poblando biblioteca...");
            for (let m of mensajesJSON) {
                await db.run(
                    'INSERT INTO biblioteca_mensajes (titulo, fecha) VALUES (?, ?);', 
                    [m.titulo, m.fecha]
                );

                const lastIdRes = await db.query('SELECT last_insert_rowid() as id;');
                const mensajeID = lastIdRes.values[0].id;

                for (let i = 0; i < m.parrafos.length; i++) {
                    await db.run(
                        'INSERT INTO biblioteca_parrafos (mensajeID, num_parrafo, texto, titulo_luxury) VALUES (?, ?, ?, ?);',
                        [mensajeID, i + 1, m.parrafos[i], ""]
                    );
                }
            }
        }

    } catch (error) {
        console.error("Error crítico en la carga de datos:", error);
    }

    return db;
};