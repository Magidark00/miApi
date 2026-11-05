const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidos = []) => (req, res, next) => {
    const [esquema, token] = (req.headers.authorization || '').split(' ');
    if (esquema !== 'Bearer' || !token) {
        return res.status(403).json({ error: 'Acceso denegado: token no proporcionado.' });
    }
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        if (rolesPermitidos.length && !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }
        next();
    } catch {
        return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }
};
