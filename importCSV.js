const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const connectionConfig = {
    host: 'localhost',
    user: 'Sergio',
    password: 'proyecto2024',
    database: 'mi_proyecto'
};

async function importCSV() {
    const connection = await mysql.createConnection(connectionConfig);
    await connection.connect();

    const csvFilePath = path.join(__dirname, 'vehiculo.csv');
    const vehiculos = [];

    // Leer y procesar el archivo CSV
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            vehiculos.push([
                row.id,
                row.Marca,
                row.Modelo,
                row.Combustible,
                row.Año === 'undefined' ? null : parseInt(row.Año, 10),
                parseFloat(row.Precio.replace('.', '').replace(',', '.')),
                row.Imagen1,
                row.Imagen2
            ]);
        })
        .on('end', async () => {
            try {
                const [rows] = await connection.query('SELECT 1 FROM Vehiculos LIMIT 1');

                const insertQuery = `
                    INSERT INTO Vehiculos (id, Marca, Modelo, Combustible, Año, Precio, Imagen1, Imagen2)
                    VALUES ?
                `;

                await connection.query(insertQuery, [vehiculos]);
                console.log('Datos importados correctamente');
            } catch (error) {
                console.error('Error al importar datos:', error);
            } finally {
                await connection.end();
            }
        });
}

importCSV();
