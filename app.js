const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');  // Importar la configuración de la base de datos
const jwt = require('jsonwebtoken');
const methodOverride = require('method-override');

const usuarioRoutes = require('./routes/usuarioRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const authRoutes = require('./routes/authRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const venderRoutes = require('./routes/venderRoutes');
const publicarRoutes = require('./routes/publicarRoutes');
const publicacionesRoutes = require('./routes/publicacionesRoutes');

const app = express();

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para logging
app.use(morgan('dev'));

// Middleware para análisis de cuerpo de la solicitud
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejar sesiones
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware para sobrescribir métodos HTTP
app.use(methodOverride('_method'));

// Middleware para pasar usuario a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const token = req.session.token;
    if (!token) {
        return res.status(401).send('Acceso denegado. No se proporcionó un token.');
    }
    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Token no válido.');
    }
};

// Middleware para verificar si el usuario es administrador
const isAdminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Acceso denegado. No tienes permiso para realizar esta acción.');
    }
};

// Rutas
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/vehiculos', vehiculoRoutes);
app.use('/carrito', carritoRoutes);
app.use('/vender', venderRoutes);
app.use('/publicar', publicarRoutes);
app.use('/publicaciones', authMiddleware, isAdminMiddleware, publicacionesRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Dashboard' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

app.get('/vehiculos', (req, res) => {
    res.render('vehiculos', { title: 'Vehículos' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Sincronizar base de datos y arrancar el servidor
sequelize.sync().then(async () => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(err => console.log(err));
