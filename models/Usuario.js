const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre es obligatorio' } }
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: 'El email no es válido' } }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('Administrador', 'Almacenero'),
        defaultValue: 'Almacenero'
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        // Nunca se guarda la contraseña en texto plano
        beforeCreate: async (usuario) => {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
});

module.exports = Usuario;
