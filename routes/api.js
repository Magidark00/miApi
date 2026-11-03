const express = require('express');
const crudRouter = require('./crudRouter');
const movimientosRouter = require('./movimientos');
const { Categoria, Proveedor, Producto, Usuario } = require('../models');

const router = express.Router();

router.use('/productos', crudRouter(Producto, {
    include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Proveedor, as: 'proveedor', attributes: ['id', 'razon_social'] }
    ]
}));
router.use('/categorias', crudRouter(Categoria));
router.use('/proveedores', crudRouter(Proveedor));
// El password nunca se devuelve al frontend
router.use('/usuarios', crudRouter(Usuario, { attributes: { exclude: ['password'] } }));
router.use('/movimientos', movimientosRouter);

module.exports = router;
