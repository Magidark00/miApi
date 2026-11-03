const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();

// Importar modelos (con sus asociaciones) para que Sequelize los registre
require('./models');
const apiRoutes = require('./routes/api');

const app = express();

// --- MIDDLEWARES ---
// Habilitar CORS para permitir peticiones desde el frontend (React)
app.use(cors());
// Parsear el body de las peticiones a JSON
app.use(express.json());

// --- RUTAS BÁSICAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// --- RUTAS DE LA API ---
// Se montan en /api (usado por las guías #10 y #11) y también en la raíz,
// para que funcione sin importar si el baseURL del frontend lleva /api o no.
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// --- SINCRONIZACIÓN Y ARRANQUE ---
const PORT = process.env.PORT || 3011;

// force: false evita que se borren los datos cada vez que se reinicia el servidor
sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos conectada y sincronizada.');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });
