// Importa los módulos necesarios
import { DataTypes } from 'sequelize';
import db from '../db/connection.js'

// Define el modelo para la tabla proveedores
const Proveedor = db.define('Proveedor', {
    proveedores_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING,
    cuit: DataTypes.INTEGER,
    usuario: DataTypes.STRING,
    nivel: DataTypes.INTEGER,
    contrasena: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
}, {
    tableName: 'proveedores', // Asegúrate de especificar el nombre de la tabla correctamente
    timestamps: false // Dependiendo de tu configuración, puedes tener timestamps o no
});


// Exporta el modelo
export default Proveedor;
