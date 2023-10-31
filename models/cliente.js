import { DataTypes } from 'sequelize';
import db from '../db/connection.js';

const Cliente = db.define('Cliente', {
    clientes_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    usuario: {
        type: DataTypes.STRING
    },
    nivel: {
        type: DataTypes.INTEGER
    },
    contrasena: {
        type: DataTypes.STRING
    },
    activo: {
        type: DataTypes.BOOLEAN
    },
}, {
    timestamps: false,
    tableName: 'clientes'
});


export default Cliente;
