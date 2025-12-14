import { TOKEN_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const authRequired = async (req, res, next) => {
    //Obtenemos las cookies
    const { token } = req.cookies;

    if (!token) //Si no hay token en las cookies
        return res.status(401)
            .json({ message: ["No token, autorización denegada"] });

    //Verificar el token
    jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
        if (err) //Si hay error 
            return res.status(403)
                .json({ message: ["Token Invalido"] });

        // Buscar el usuario y sus roles
        try {
            const user = await User.findById(decoded.id).populate('role');
            if (!user) {
                return res.status(404).json({ message: ["Usuario no encontrado"] });
            }

            // Agregar la información del usuario al request
            req.user = {
                id: decoded.id,
                roles: user.role ? [user.role.role] : []
            };
            
            next();
        } catch (error) {
            console.error("Error en authRequired:", error);
            return res.status(500).json({ message: ["Error al validar token"] });
        }
    })
}//Fin de authRequired