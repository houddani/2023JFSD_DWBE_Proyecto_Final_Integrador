import { DataTypes } from 'sequelize';
import db from '../db/connection.js';
import Cliente from './cliente.js'; 

const Carrito = db.define('Carrito', {
  carrito_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  timestamps: false,
  tableName: 'carritos'
});


// Establece la relación con el cliente
Carrito.belongsTo(Cliente, { foreignKey: 'cliente_id' });

export default Carrito;
