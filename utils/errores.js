// Error de reglas de negocio (ej. stock insuficiente) con su código HTTP
class ErrorNegocio extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

// Traduce los errores de Sequelize a respuestas claras para el frontend
const manejarError = (res, error) => {
    if (error instanceof ErrorNegocio) {
        return res.status(error.status).json({ error: error.message });
    }

    switch (error.name) {
        case 'SequelizeValidationError':
            return res.status(400).json({ error: error.errors.map((e) => e.message).join('. ') });
        case 'SequelizeUniqueConstraintError':
            return res.status(400).json({ error: 'Ya existe un registro con ese valor único (por ejemplo, el email).' });
        case 'SequelizeForeignKeyConstraintError':
            return res.status(409).json({
                error: 'No se puede completar la acción: el registro está relacionado con otros datos (por ejemplo, un producto con movimientos en el Kardex) o referencia un registro que no existe.',
            });
        default:
            console.error(error);
            return res.status(500).json({ error: error.message });
    }
};

module.exports = { ErrorNegocio, manejarError };
