import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const datos = require('./datos.json')

import express from 'express'
import jwt from 'jsonwebtoken'

import db from './db/connection.js'
import Producto from './models/producto.js'
import Proveedor from './models/proveedor.js'
import Cliente from './models/cliente.js'
import Admin from './models/administrador.js'
import Carrito from './models/carrito.js'
import Venta from './models/venta.js'

const html = '<h1>Bienvenido a la API</h1><p>Los comandos disponibles son:</p><ul><li>GET: /productos/</li><li>GET: /productos/id</li>    <li>POST: /productos/</li>    <li>DELETE: /productos/id</li>    <li>PUT: /productos/id</li>    <li>PATCH: /productos/id</li>    <li>GET: /usuarios/</li>    <li>GET: /usuarios/id</li>    <li>POST: /usuarios/</li>    <li>DELETE: /usuarios/id</li>    <li>PUT: /usuarios/id</li>    <li>PATCH: /usuarios/id</li></ul>'

const app = express()

const exposedPort = 1234


// Middleware para la validacion de los token recibidos
function autenticacionDeToken(req, res, next){
    const headerAuthorization = req.headers['authorization']

    const tokenRecibido = headerAuthorization.split(" ")[1]

    if (tokenRecibido == null){
        return res.status(401).json({message: 'Token inválido'})
    }

    let payload = null

    try {
        // intentamos sacar los datos del payload del token
        payload = jwt.verify(tokenRecibido, process.env.SECRET_KEY)
    } catch (error) {
        return res.status(401).json({message: 'Token inválido'})
    }

    if (Date.now() > payload.exp){
        return res.status(401).json({message: 'Token caducado'})
    }

    // Pasadas las validaciones
    req.user = payload

    next()
}

// Middleware que construye el body en req de tipo post y patch
app.use((req, res, next) =>{
    if ((req.method !== 'POST') && (req.method !== 'PATCH')) { return next()}

    if (req.headers['content-type'] !== 'application/json') { return next()}

    let bodyTemporal = ''

    req.on('data', (chunk) => {
        bodyTemporal += chunk.toString()
    })

    req.on('end', () => {
        req.body = JSON.parse(bodyTemporal)

        next()
})})


app.get('/', (req, res) => {
    res.status(200).send(html)
})

app.post('/auth', async (req, res) => {
    const { usuario, password } = req.body;

    let usuarioEncontrado = null

    try {
        // Buscar en la tabla de clientes
        usuarioEncontrado = await Cliente.findOne({ where: { usuario } });

        if (!usuarioEncontrado) {
            usuarioEncontrado = await Proveedor.findOne({ where: { usuario } });

            if (!usuarioEncontrado) {
                usuarioEncontrado = await Admin.findOne({ where: { usuario } });

                if (!usuarioEncontrado) {
                    console.log('Usuario no encontrado en ninguna tabla');
                    return res.status(400).json({ message: 'Usuario no encontrado' });
                }
            }
        }

        console.log('Usuario encontrado:', usuarioEncontrado);

        // Comprobación de la contraseña
        if (!usuarioEncontrado || usuarioEncontrado.contrasena !== password) {
            console.log('Contraseña incorrecta');
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Comprobación del estado activo
        if (!usuarioEncontrado.activo) {
            console.log('El usuario no está activo');
            return res.status(400).json({ message: 'El usuario no está activo' });
        }

        // Generación del token
        const { id, nivel } = usuarioEncontrado;
        const token = jwt.sign({
            sub: id,
            usuario,
            nivel,
            exp: Date.now() + (60 * 3000)
        }, process.env.SECRET_KEY);

        console.log('Token generado:', token);

        res.status(200).json({ accessToken: token });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ message: 'Error en la autenticación' });
    }
});


app.get('/proveedores', async (req, res) => {
    try {
        const allProveedores = await Proveedor.findAll();
        res.status(200).json(allProveedores);
    } catch (error) {
        res.status(204).json({ message: 'Error al obtener los proveedores' });
    }
});

app.get('/proveedores/:id', async (req, res) => {
    try {
        const proveedorId = parseInt(req.params.id);
        const proveedor = await Proveedor.findByPk(proveedorId);
        
        if (proveedor) {
            res.status(200).json(proveedor);
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/clientes', async (req, res) => {
    try {
        const allClientes = await Cliente.findAll();
        res.status(200).json(allClientes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/clientes/:id', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.id);
        const cliente = await Cliente.findByPk(clienteId);
        if (cliente) {
            res.status(200).json(cliente);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/administradores/:id', async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        const admin = await Admin.findByPk(adminId);
        
        if (admin) {
            res.status(200).json(admin);
        } else {
            res.status(404).json({ message: 'Administrador no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/productos/', async (req, res) => {
    try {
        //let allProducts = datos.productos
        let allProducts = await Producto.findAll()

        res.status(200).json(allProducts)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.get('/productos/:id', async (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = await Producto.findByPk(productoId)

        res.status(200).json(productoEncontrado)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.get('/carritos', async (req, res) => {
    try {
      const carritos = await Carrito.findAll();
      res.json(carritos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

app.get('/carritos/:id', async (req, res) => {
    const carritoId = req.params.id;
    try {
      const carrito = await Carrito.findByPk(carritoId, { include: Producto });
      if (carrito) {
        res.json(carrito);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

app.get('/ventas', async (req, res) => {
    try {
        const ventas = await Venta.findAll();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/ventas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const venta = await Venta.findByPk(id);
        if (venta) {
            res.json(venta);
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function verificarAcceso(req, res, next){
    const nivelAcceso = req.user.nivel

    if (nivelAcceso !== 'administrador'){
        return res.status(403).json({message: 'Acceso denegado'})
    }

    next()
}


app.post('/proveedores', async (req, res) => {
    try {
        const nuevoProveedor = await Proveedor.create(req.body);
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear un nuevo proveedor' });
    }
});

app.post('/clientes', async (req, res) => {
    try {
        const newCliente = await Cliente.create(req.body);
        res.status(201).json(newCliente);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/administradores', autenticacionDeToken, async (req, res) => {
    try {
        const newAdmin = await Admin.create(req.body);
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.post('/productos', autenticacionDeToken, verificarAcceso, async (req, res) => {
    try {

        //datos.productos.push(req.body)
        const productoAGuardar = new Producto(req.body)
        await productoAGuardar.save()
    
        res.status(201).json({"message": "success"})

    } catch (error) {
        res.status(204).json({"message": "error"})
    }
})

app.post('/carritos', async (req, res) => {
    const { monto } = req.body;
    try {
      const nuevoCarrito = await Carrito.create({ monto });
      res.status(201).json(nuevoCarrito);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.post('/ventas', async (req, res) => {
    const { carrito_id, producto_id, cantidad } = req.body;
    try {
        let carrito = await Carrito.findByPk(carrito_id);
        let producto = await Producto.findByPk(producto_id);

        if (!carrito || !producto) {
            return res.status(404).json({ message: 'Carrito o Producto no encontrado' });
        }
        await carrito.addProducto(producto, { through: { cantidad: cantidad } });
        const nuevaVenta = await Venta.create({ carrito_id, producto_id, cantidad, subtotal });
        res.status(201).json(nuevaVenta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.patch('/proveedores/:id', async (req, res) => {
    const proveedorId = req.params.id;
    try {
        const proveedor = await Proveedor.findByPk(proveedorId);
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        await proveedor.update(req.body);
        res.status(200).json({ message: 'Proveedor actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proveedor' });
    }
});

app.patch('/clientes/:id', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.id);
        const clienteToUpdate = await Cliente.findByPk(clienteId);
        if (clienteToUpdate) {
            await clienteToUpdate.update(req.body);
            res.status(200).json({ message: 'Cliente actualizado' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/administradores/:id', autenticacionDeToken, async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        const adminToUpdate = await Admin.findByPk(adminId);

        if (adminToUpdate) {
            await adminToUpdate.update(req.body);
            res.status(200).json({ message: 'Administrador actualizado' });
        } else {
            res.status(404).json({ message: 'Administrador no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/productos/:id', autenticacionDeToken, verificarAcceso, async (req, res) => {
    let idProductoAEditar = parseInt(req.params.id)
    try {
        let productoAActualizar = await Producto.findByPk(idProductoAEditar)

        if (!productoAActualizar) {
            return res.status(204).json({"message":"Producto no encontrado"})}
        
            await productoAActualizar.update(req.body)

            res.status(200).send('Producto actualizado')
    
    } catch (error) {
        res.status(204).json({"message":"Producto no encontrado"})
    }
})

app.patch('/carritos/:id', async (req, res) => {
    const carritoId = req.params.id;
    const { monto } = req.body;
    try {
      const carrito = await Carrito.findByPk(carritoId);
      if (carrito) {
        await carrito.update({ monto });
        res.json({ message: 'Carrito actualizado' });
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.patch('/ventas/:id', async (req, res) => {
    const { id } = req.params;
    const { carrito_id, producto_id, cantidad, subtotal } = req.body;
    try {
        const venta = await Venta.findByPk(id);
        if (venta) {
            await venta.update({ carrito_id, producto_id, cantidad, subtotal });
            res.json(venta);
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/proveedores/:id', async (req, res) => {
    const proveedorId = req.params.id;
    try {
        const proveedor = await Proveedor.findByPk(proveedorId);
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        await proveedor.destroy();
        res.status(200).json({ message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el proveedor' });
    }
});

app.delete('/clientes/:id', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.id);
        const clienteToDelete = await Cliente.findByPk(clienteId);
        if (clienteToDelete) {
            await clienteToDelete.destroy();
            res.status(200).json({ message: 'Cliente eliminado' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/administradores/:id', autenticacionDeToken, async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        const adminToDelete = await Admin.findByPk(adminId);

        if (adminToDelete) {
            await adminToDelete.destroy();
            res.status(200).json({ message: 'Administrador eliminado' });
        } else {
            res.status(404).json({ message: 'Administrador no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/productos/:id', autenticacionDeToken, verificarAcceso, async (req, res) => {
    let idProductoABorrar = parseInt(req.params.id)
    try {
        let productoABorrar = await Producto.findByPk(idProductoABorrar);
        if (!productoABorrar){
            return res.status(204).json({"message":"Producto no encontrado"})
        }

        await productoABorrar.destroy()
        res.status(200).json({message: 'Producto borrado'})

    } catch (error) {
        res.status(204).json({message: error})
    }
})

app.delete('/carritos/:id', async (req, res) => {
    const carritoId = req.params.id;
    try {
      const carrito = await Carrito.findByPk(carritoId);
      if (carrito) {
        await carrito.destroy();
        res.json({ message: 'Carrito eliminado' });
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.delete('/ventas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const venta = await Venta.findByPk(id);
        if (venta) {
            await venta.destroy();
            res.json({ message: 'Venta eliminada' });
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})

try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  


app.listen( exposedPort, () => {
    console.log('Servidor escuchando en http://localhost:1234' + exposedPort)
})




