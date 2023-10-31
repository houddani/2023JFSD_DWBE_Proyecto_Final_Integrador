import { DataTypes } from 'sequelize';
import db from '../db/connection.js';
import Proveedor from './proveedor.js';

const Producto = db.define('Producto', {
    producto_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    proveedores_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'proveedores',
            key: 'proveedores_id',
        },
    },
    stock: {
        type: DataTypes.INTEGER,
    },
    nombre: {
        type: DataTypes.STRING,
    },
    precio: {
        type: DataTypes.NUMERIC(10, 2),
    },
    activo: {
        type: DataTypes.BOOLEAN,
    },
},
{
    timestamps: false,
    tableName: 'productos',
});

Producto.belongsTo(Proveedor, { foreignKey: 'proveedores_id' });

export default Producto;
