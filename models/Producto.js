const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre del producto es obligatorio' } }
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: { args: [0], msg: 'El precio no puede ser negativo' } }
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: { args: [0], msg: 'El stock no puede ser negativo' } }
    },
    // Llaves foráneas: las asociaciones se declaran en models/index.js
    categoria_id: {
        type: DataTypes.INTEGER
    },
    proveedor_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'productos',
    timestamps: true, // createdAt y updatedAt
    validate: {
        // Solo se exige al crear o al cambiar la categoría; así se puede actualizar
        // el stock de productos antiguos que aún no tienen categoría.
        categoriaObligatoria() {
            const sinCategoria = this.categoria_id === null || this.categoria_id === undefined;
            if (sinCategoria && (this.isNewRecord || this.changed('categoria_id'))) {
                throw new Error('El producto debe tener una categoría');
            }
        }
    }
});

module.exports = Producto;
