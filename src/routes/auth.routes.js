import { Router } from 'express';
import {
    login,
    register,
    logout,
    profile,
    verifyToken
} from '../controllers/auth.controller.js';

import { authRequired } from '../middlewares/validateToken.js';

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


export default router;