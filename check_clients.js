const { Database } = require('sqlite3');
const path = require('path');

// Intentamos usar better-sqlite3 o sqlite3 según lo que esté disponible en node_modules
let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
} catch (e) {
    console.error("No se encontró el módulo sqlite3. Intentando búsqueda manual...");
    process.exit(1);
}

const dbPath = path.join(__dirname, 'server', 'prisma', 'prod.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.get("SELECT count(*) as count FROM Cliente", (err, row) => {
        if (err) {
            console.error("Error al leer la tabla Cliente:", err.message);
        } else {
            console.log(`\n✅ CONTEO EXITOSO: Se encontraron ${row.count} clientes en la base de datos de producción.\n`);
        }
    });
});

db.close();
