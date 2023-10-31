import { DataTypes } from 'sequelize';
import db from '../db/connection.js';

const Admin = db.define('Admin', {
    admin_id: {
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
    }
}, {
    timestamps: false,
    tableName: 'administradores'
});


export default Admin;
