const express = require('express');
const sequelize = require('../config/db');
const { Producto, Usuario, Movimiento } = require('../models');
const { ErrorNegocio, manejarError } = require('../utils/errores');

const router = express.Router();

const incluirRelaciones = [
    { model: Producto, as: 'producto', attributes: ['id', 'nombre'] },
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'rol'] }
];

// GET: historial del Kardex (más recientes primero)
router.get('/', async (req, res) => {
    try {
        const movimientos = await Movimiento.findAll({
            include: incluirRelaciones,
            order: [['fecha_hora', 'DESC'], ['id', 'DESC']]
        });
        res.json(movimientos);
    } catch (error) {
        manejarError(res, error);
    }
});

// POST: registra el movimiento Y actualiza el stock en una sola transacción.
// Si cualquier paso falla, no se guarda nada (rollback).
router.post('/', async (req, res) => {
    try {
        const { producto_id, usuario_id, tipo_movimiento, observaciones } = req.body;
        const cantidad = Number(req.body.cantidad);

        if (!['Entrada', 'Salida', 'Ajuste'].includes(tipo_movimiento)) {
            throw new ErrorNegocio(400, 'El tipo de movimiento debe ser Entrada, Salida o Ajuste');
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new ErrorNegocio(400, 'La cantidad debe ser un número entero mayor a 0');
        }

        const movimiento = await sequelize.transaction(async (t) => {
            // lock: bloquea la fila del producto para evitar que dos movimientos
            // simultáneos lean el mismo stock
            const producto = await Producto.findByPk(producto_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!producto) throw new ErrorNegocio(404, 'El producto no existe');

            const usuario = await Usuario.findByPk(usuario_id, { transaction: t });
            if (!usuario) throw new ErrorNegocio(404, 'El usuario no existe');

            let nuevoStock = producto.stock;
            if (tipo_movimiento === 'Salida') {
                if (producto.stock < cantidad) {
                    throw new ErrorNegocio(400, `Stock insuficiente: "${producto.nombre}" tiene ${producto.stock} unidades`);
                }
                nuevoStock -= cantidad;
            } else {
                // Entrada y Ajuste suman al stock
                nuevoStock += cantidad;
            }

            const creado = await Movimiento.create(
                { producto_id, usuario_id, tipo_movimiento, cantidad, observaciones: observaciones || null },
                { transaction: t }
            );
            await producto.update({ stock: nuevoStock }, { transaction: t });

            return creado;
        });

        res.status(201).json(await Movimiento.findByPk(movimiento.id, { include: incluirRelaciones }));
    } catch (error) {
        manejarError(res, error);
    }
});

module.exports = router;
