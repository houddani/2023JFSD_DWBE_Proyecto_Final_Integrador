// venta.js
import { DataTypes } from 'sequelize';
import db from '../db/connection.js';
import Carrito from './carrito.js';
import Producto from './producto.js';

const Venta = db.define('Venta', {
    venta_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    carrito_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Carrito,
            key: 'carrito_id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Producto,
            key: 'producto_id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2)
    }
}, {
    timestamps: false,
    tableName: 'ventas'
});

Venta.belongsTo(Carrito, { foreignKey: 'carrito_id' });
Venta.belongsTo(Producto, { foreignKey: 'producto_id' });

export default Venta;
