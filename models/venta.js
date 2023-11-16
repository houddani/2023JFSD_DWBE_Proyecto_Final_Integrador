
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
Carrito.belongsToMany(Producto, { through: Venta, foreignKey: 'carrito_id' });
Producto.belongsToMany(Carrito, { through: Venta, foreignKey: 'producto_id' });
export default Venta;
