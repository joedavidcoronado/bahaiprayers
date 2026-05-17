import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);

export const initDB = async () => {
    // Creamos/Abrimos la conexión
    const db = await sqlite.createConnection("bahaiOracionesDB", false, "no-encrypted", 1);
    await db.open();

    // 1. Estructura de Oraciones y Categorías (ACTUALIZADA)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS oraciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            previo TEXT,
            parrafos TEXT,
            post TEXT,
            autor TEXT,
            categoriaID INTEGER,
            favorito INTEGER DEFAULT 0,
            FOREIGN KEY (categoriaID) REFERENCES categorias(id)
        );
    `);

    // 2. Estructura de Biblioteca (Mensajes, Párrafos y Notas)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS biblioteca_mensajes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            fecha TEXT
        );
        CREATE TABLE IF NOT EXISTS biblioteca_parrafos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mensajeID INTEGER,
            num_parrafo INTEGER,
            texto TEXT,
            titulo_luxury TEXT,
            FOREIGN KEY (mensajeID) REFERENCES biblioteca_mensajes(id)
        );
        CREATE TABLE IF NOT EXISTS biblioteca_notas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parrafoID INTEGER,
            comentario TEXT,
            fecha_creacion TEXT,
            FOREIGN KEY (parrafoID) REFERENCES biblioteca_parrafos(id)
        );
    `);

    return db;
};