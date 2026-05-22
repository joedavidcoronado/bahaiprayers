import oracionesJSON from '../utils/oraciones.json'; 
import categoriasJSON from '../utils/categorias.json';
import mensajesJSON from '../utils/mensajes.json'; 
// Quechua
import oracionesQueJSON from '../utils/oracionesQue.json';
import categoriasQueJSON from '../utils/categoriasQue.json';
// Aymara
import oracionesAiJSON from '../utils/oracionesAi.json';
import categoriasAiJSON from '../utils/categoriasAi.json';

import { initDB } from './initDB';

export const populateDB = async () => {
    const db = await initDB();

    try {
        // --- POBLAR CATEGORÍAS (español, sin tocar) ---
        const resCat = await db.query('SELECT COUNT(*) as count FROM categorias;');
        if (resCat.values[0].count === 0) {
            for (let c of categoriasJSON) {
                await db.run('INSERT INTO categorias (nombre) VALUES (?);', [c.nombre]);
            }
        }

        // --- POBLAR ORACIONES español (sin tocar) ---
        const resOra = await db.query('SELECT COUNT(*) as count FROM oraciones;');
        if (resOra.values[0].count === 0) {
            console.log("Poblando oraciones detalladas...");
            for (let o of oracionesJSON) {
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

        // --- POBLAR BIBLIOTECA (sin tocar) ---
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

        // --- POBLAR CATEGORÍAS QUECHUA ---
        const resCatQu = await db.query('SELECT COUNT(*) as count FROM categorias_qu;');
        if (resCatQu.values[0].count === 0) {
            console.log("Poblando categorías quechua...");
            for (let c of categoriasQueJSON) {
                await db.run('INSERT INTO categorias_qu (nombre) VALUES (?);', [c.nombre]);
            }
        }

        // --- POBLAR ORACIONES QUECHUA ---
        const resOraQu = await db.query('SELECT COUNT(*) as count FROM oraciones_qu;');
        if (resOraQu.values[0].count === 0) {
            console.log("Poblando oraciones quechua...");
            for (let o of oracionesQueJSON) {
                const res = await db.query('SELECT id FROM categorias_qu WHERE nombre = ?;', [o.categoria]);
                const categoriaID = res.values.length > 0 ? res.values[0].id : null;

                await db.run(
                    `INSERT INTO oraciones_qu (titulo, previo, parrafos, post, autor, categoriaID) 
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

        // --- POBLAR CATEGORÍAS AYMARA ---
        const resCatAy = await db.query('SELECT COUNT(*) as count FROM categorias_ay;');
        if (resCatAy.values[0].count === 0) {
            console.log("Poblando categorías aymara...");
            for (let c of categoriasAiJSON) {
                await db.run('INSERT INTO categorias_ay (nombre) VALUES (?);', [c.nombre]);
            }
        }

        // --- POBLAR ORACIONES AYMARA ---
        const resOraAy = await db.query('SELECT COUNT(*) as count FROM oraciones_ay;');
        if (resOraAy.values[0].count === 0) {
            console.log("Poblando oraciones aymara...");
            for (let o of oracionesAiJSON) {
                const res = await db.query('SELECT id FROM categorias_ay WHERE nombre = ?;', [o.categoria]);
                const categoriaID = res.values.length > 0 ? res.values[0].id : null;

                await db.run(
                    `INSERT INTO oraciones_ay (titulo, previo, parrafos, post, autor, categoriaID) 
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

    } catch (error) {
        console.error("Error crítico en la carga de datos:", error);
    }

    return db;
};