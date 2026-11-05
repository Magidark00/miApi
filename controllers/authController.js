const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const emitirToken = (usuario) => jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
);

exports.registrar = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'Indica nombre, email y una contraseña de al menos 8 caracteres.' });
        }
        const correo = email.trim().toLowerCase();
        if (await Usuario.findOne({ where: { email: correo } })) {
            return res.status(409).json({ error: 'El correo ya se encuentra registrado.' });
        }
        // La primera cuenta administra el sistema; el registro abierto posterior
        // siempre crea almaceneros y no acepta el rol enviado por el cliente.
        const rol = await Usuario.count() === 0 ? 'Administrador' : 'Almacenero';
        const usuario = await Usuario.create({ nombre: nombre.trim(), email: correo, password, rol });
        const token = emitirToken(usuario);
        res.status(201).json({ message: 'Usuario registrado exitosamente', token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
        }
        const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        res.json({
            message: 'Inicio de sesión exitoso',
            token: emitirToken(usuario),
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo iniciar sesión.' });
    }
};
