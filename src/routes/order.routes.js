import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import {
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getUserOrders,
    getOrderById,
    deleteOrder
} from '../controllers/order.controller.js';

//Importamos el middleware para validar el esquema
import { validateSchemas } from '../middlewares/validateSchemas.js';

//Importamos el esquema de validación para crear una orden
import { orderSchema } from '../schemas/order.schemas.js';

const router = Router();

//Ruta para crear una orden
router.post('/order', authRequired, validateSchemas(orderSchema), createOrder);

//Ruta para actualizar el status de una orden por Id
router.put('/order/:id', authRequired, updateOrderStatus);

//Obtener todas las ordenes para el administrador
router.get('/order/', authRequired, isAdmin, getAllOrders);

//Obtener todas las ordenes para un usuario
router.get('/order/getuserorders', authRequired, getUserOrders)

//Obtener una orden por id
router.get('/order/:id', authRequired, getOrderById);

//Eliminar una orden (solo órdenes canceladas)
router.delete('/order/:id', authRequired, deleteOrder);

export default router;