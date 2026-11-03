const express = require('express');
const { ErrorNegocio, manejarError } = require('../utils/errores');

// Quita campos que no se deben enviar y convierte '' en null
const limpiarBody = (body) => {
    const datos = {};
    for (const [clave, valor] of Object.entries(body)) {
        if (['id', 'createdAt', 'updatedAt'].includes(clave)) continue;
        datos[clave] = valor === '' ? null : valor;
    }
    return datos;
};

// Genera las rutas GET, POST, PUT y DELETE para un modelo
module.exports = (Modelo, { include = [], attributes, order = [['id', 'ASC']] } = {}) => {
    const router = express.Router();
    const opciones = { include, attributes };

    router.get('/', async (req, res) => {
        try {
            res.json(await Modelo.findAll({ ...opciones, order }));
        } catch (error) {
            manejarError(res, error);
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const item = await Modelo.findByPk(req.params.id, opciones);
            if (!item) throw new ErrorNegocio(404, 'Registro no encontrado');
            res.json(item);
        } catch (error) {
            manejarError(res, error);
        }
    });

    router.post('/', async (req, res) => {
        try {
            const creado = await Modelo.create(limpiarBody(req.body));
            // Se vuelve a leer para devolver el registro con sus relaciones y sin campos ocultos
            res.status(201).json(await Modelo.findByPk(creado.id, opciones));
        } catch (error) {
            manejarError(res, error);
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const item = await Modelo.findByPk(req.params.id);
            if (!item) throw new ErrorNegocio(404, 'Registro no encontrado');
            await item.update(limpiarBody(req.body)); // ejecuta los hooks (ej. cifrado de password)
            res.json(await Modelo.findByPk(item.id, opciones));
        } catch (error) {
            manejarError(res, error);
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const item = await Modelo.findByPk(req.params.id);
            if (!item) throw new ErrorNegocio(404, 'Registro no encontrado');
            await item.destroy();
            res.json({ message: 'Registro eliminado' });
        } catch (error) {
            manejarError(res, error);
        }
    });

    return router;
};
