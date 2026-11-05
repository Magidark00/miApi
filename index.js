const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: ['.env.local', '.env'] });
const sequelize = require('./config/db');

// Importar modelos (con sus asociaciones) para que Sequelize los registre
require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const autenticar = require('./middleware/authMiddleware');

const app = express();

// --- SEGURIDAD Y MIDDLEWARES ---
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const limitador = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones. Intenta nuevamente más tarde.' }
});
app.use('/api/', limitador);

// --- RUTAS BÁSICAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// Login y registro son públicos; el resto de la API requiere un JWT válido.
app.use('/api/auth', authRoutes);
app.use('/api', autenticar(), apiRoutes);
// Compatibilidad con las rutas anteriores que no incluían el prefijo /api.
app.use('/', autenticar(), apiRoutes);

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
