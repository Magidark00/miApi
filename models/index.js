// Registra todos los modelos y define las asociaciones (llaves foráneas)
const Categoria = require('./Categoria');
const Proveedor = require('./Proveedor');
const Producto = require('./Producto');
const Usuario = require('./Usuario');
const Movimiento = require('./Movimiento');

// Categoría 1 : N Productos
Categoria.hasMany(Producto, { as: 'productos', foreignKey: 'categoria_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Producto.belongsTo(Categoria, { as: 'categoria', foreignKey: 'categoria_id' });

// Proveedor 1 : N Productos
Proveedor.hasMany(Producto, { as: 'productos', foreignKey: 'proveedor_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Producto.belongsTo(Proveedor, { as: 'proveedor', foreignKey: 'proveedor_id' });

// Producto 1 : N Movimientos
Producto.hasMany(Movimiento, { as: 'movimientos', foreignKey: 'producto_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Movimiento.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });

// Usuario 1 : N Movimientos
Usuario.hasMany(Movimiento, { as: 'movimientos', foreignKey: 'usuario_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Movimiento.belongsTo(Usuario, { as: 'usuario', foreignKey: 'usuario_id' });

module.exports = { Categoria, Proveedor, Producto, Usuario, Movimiento };
