import { Router } from 'express';
import {
    login,
    register,
    logout,
    profile,
    verifyToken,
    updateProfile,
    getUserStats,
    addFavorite,
    removeFavorite,
    getFavorites,
    changePassword,
    deleteAccount,
    getAllUsers,
    deleteUser
} from '../controllers/auth.controller.js';

import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';

//importamos validateSchema
import { validateSchemas } from '../middlewares/validateSchemas.js';

//Importamos los esquemas de validacion
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js';

const router = Router();

//Ruta para validar del token
router.get('/verify', verifyToken)

//Ruta para registrar usuarios
router.post('/register', validateSchemas(registerSchema), register);

//Ruta para inicar sesión
router.post('/login', validateSchemas(loginSchema), login);

//Ruta para cerrar sesión
router.post('/logout', logout);

//Ruta para el perfil del usuario
router.get('/profile', authRequired, profile);

//Ruta para actualizar el perfil del usuario
router.put('/profile', authRequired, updateProfile);

//Ruta para obtener estadísticas del usuario
router.get('/profile/stats', authRequired, getUserStats);

//Rutas para favoritos
router.post('/favorites', authRequired, addFavorite);
router.delete('/favorites/:productId', authRequired, removeFavorite);
router.get('/favorites', authRequired, getFavorites);

//Ruta para cambiar contraseña
router.put('/change-password', authRequired, changePassword);

//Ruta para eliminar cuenta
router.delete('/delete-account', authRequired, deleteAccount);

//Rutas admin — gestión de usuarios
router.get('/admin/users', authRequired, isAdmin, getAllUsers);
router.delete('/admin/users/:id', authRequired, isAdmin, deleteUser);

export default router;