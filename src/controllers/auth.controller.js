// Importamos el modelo de datos
import User from '../models/user.models.js';
import bcryptjs from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import Role from '../models/roles.models.js';

import dotenv from 'dotenv';
//Configuramos las variables de entorno
dotenv.config()

//Obtenemos el rol del usuario para el registro de usuarios
const roleUser = process.env.SETUP_ROLE_USER;

// Función para registrar usuarios
export const register = async (req, res) => {
    //console.log(req);
    const { username, email, password } = req.body; //Esto es desestructurar variables. Descomponer el req
    //console.log(req.body);
    //console.log(username, email, password);

    try {
        //Validar que el email no este registrado en la BD
        const userFound = await User.findOne({ email });
        if (userFound) //Ya se encuentra el email registrado en la BD
            return res.status(400).json({ message: ["El email ya esta registrado"] }); //Retornamos error en el registro

        // Encriptar la contraseña
        const passwordHash = await bcryptjs.hash(password, 10);



        //Obtenemos el rol por defecto para usuarios
        // Y lo agregamos al usuario para guardarlo en la db con ese rol
        const role = await Role.findOne({ role: roleUser });
        if (!role) // No se encuentra el rol de usuario inicializado
            return res.status(400) // Retornamos el error en el registro
                .json({ message: ["El rol para usuario no esta definido"] })



        const newUser = new User({
            username,
            email,
            password: passwordHash,
            role: role._id
        });


        //console.log(newUser);
        const userSaved = await newUser.save();

        //Generamos la cookie de inicio de seión
        const token = await createAccessToken({ id: userSaved._id });
        //Verificamos si el token de inicio de sesion lo generamos para el entorno local
        //de desarrollo o lo generamos para el servidor en la nube
        if (process.env.ENVIROMENT == 'local') {
            res.cookie('token', token, {
                sameSite: 'lax', //Para indicar que el back y front son locales para desarrollo
            });
        } else { //El back y front se encuentran en distintos servidores remotos
            res.cookie('token', token, {
                sameSite: 'none', //Para peticiones remotas
                secure: true, //para activar https en deployment
            });
        }//Fin de if(process.env.ENVIROMENT)


        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: role.role
        });
    } catch (error) {
        console.log(error);
        console.log('Error al registrar');
        return res.status(400).json({ message: ["Error al registrar un usuario"] });

    }
}; // Fin de register

// Función para inciar sesión
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await User.findOne({ email });
        // No se encuentra en la BD
        if (!userFound)
            return res.status(400).json({ message: ["Usuario no encontrado"] })
        // Comparamos el password que envió el usuario con lo que tenemos en la db
        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch)
            return res.status(400).json({ message: ["Password no coincide"] });
        // Existe en la db y su password es correcta
        // Generamos el token de inicio de sesión y retornamos los datos
        const token = await createAccessToken({ id: userFound._id });

        //Verificamos si el token de inicio de sesion lo generamos para el entorno local
        //de desarrollo o lo generamos para el servidor en la nube
        if (process.env.ENVIROMENT == 'local') {
            res.cookie('token', token, {
                sameSite: 'lax', //Para indicar que el back y front son locales para desarrollo
            });
        } else { //El back y front se encuentran en distintos servidores remotos
            res.cookie('token', token, {
                sameSite: 'none', //Para peticiones remotas
                secure: true, //para activar https en deployment
            });
        }//Fin de if(process.env.ENVIROMENT)

        //Obtenemos el rol para el usuario que inicio sesion
        //Y lo asignamos en el return del usuario.
        const role = await Role.findById(userFound.role);
        if (!role)//No se encuentra el rol del usuario
            return res.status(400)//Retornamos error en el login
                .json({ message: ["El rol para el usuario no esta definido"] })

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        })
    } catch (error) {
        console.log(error);
        console.log("Error al iniciar sesión");
        return res.status(400).json({ message: ["Error al iniciar sesión"] });

    }
}; // Fin de login

// Función para cerrar sesión 
export const logout = (req, res) => { // req para recibir res para responder
    res.cookie("token", "", {
        expires: new Date(0)
    });
    return res.sendStatus(200);
}

// Función para el perfil del usuario
export const profile = async (req, res) => {
    //res.json(req.user);
    const userFound = await User.findById(req.user.id);

    if (!userFound) //No se encontró en la base de datos
        return res.status(400).json({ message: ["Usuario no encontrado"] });

    //Obtenemos el rol para el usuario que inicio sesion
    //Y lo asignamos en el return del usuario.
    const role = await Role.findById(userFound.role);
    if (!role) //No se encuentra el rol del usuario
        return res.status(400) //Retornamos error en el login
            .json({ message: ["El rol para el usuario no esta definido"] })

    res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        role: role.role,
        createdAt: userFound.createdAt
    });
} // Fin del Profile
//Función para validar el token de inicio de sesión
export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token)
        return res.status(400)
            .json({ message: ["No autorizado"] });

    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err)//Hay error al validar el token
            return res.status(401)
                .json({ message: ["No autorizado"] });

        const userFound = await User.findById(user.id);
        if (!userFound)//Si no encuentra el usuario que viene en el token
            return res.status(401)
                .json({ message: ["No autorizado"] });

        //Obtenemos el rol para el usuario que inició sesión
        //Y lo asignamos en el return del usuario.
        const role = await Role.findById(userFound.role);
        if (!role)//No se encuenttra el rol del usuario
            return res.status(400)//Retornamos error en el login
                .json({ message: ["El rol para el usuario no está definido"] })

        const userResponse = {
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        }

        return res.json(userResponse);

    })//Fin de jwt.verifyToken
}//Fin de verifyToken

// Función para actualizar el perfil del usuario
export const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        // Verificar si el email ya está en uso por otro usuario
        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: ["El email ya está en uso"] });
            }
        }

        // Actualizar usuario
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        // Obtener el rol del usuario
        const role = await Role.findById(updatedUser.role);

        res.json({
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: role.role,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al actualizar el perfil"] });
    }
};

// Función para obtener estadísticas del usuario
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const Order = (await import('../models/order.models.js')).default;

        // Obtener el usuario con favoritos
        const user = await User.findById(userId);

        // Obtener todas las órdenes del usuario
        const orders = await Order.find({ user: userId });

        // Calcular estadísticas
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'delivered').length;

        res.json({
            totalOrders,
            completedOrders,
            favoriteProducts: user.favorites?.length || 0
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al obtener estadísticas"] });
    }
};

// Función para agregar un producto a favoritos
export const addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        // Inicializar favorites si no existe
        if (!user.favorites) {
            user.favorites = [];
        }

        // Verificar si ya está en favoritos
        if (user.favorites.includes(productId)) {
            return res.status(400).json({ message: ["El producto ya está en favoritos"] });
        }

        user.favorites.push(productId);
        await user.save();

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al agregar a favoritos"] });
    }
};

// Función para quitar un producto de favoritos
export const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        // Inicializar favorites si no existe
        if (!user.favorites) {
            user.favorites = [];
        }

        user.favorites = user.favorites.filter(fav => fav.toString() !== productId);
        await user.save();

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al quitar de favoritos"] });
    }
};

// Función para obtener productos favoritos
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('favorites');
        
        if (!user) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        // Si el usuario no tiene el campo favorites, devolver array vacío
        res.json(user.favorites || []);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al obtener favoritos"] });
    }
};

// Función para cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Buscar el usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        // Verificar que la contraseña actual sea correcta
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: ["La contraseña actual es incorrecta"] });
        }

        // Encriptar la nueva contraseña
        const passwordHash = await bcryptjs.hash(newPassword, 10);
        
        // Actualizar la contraseña
        user.password = passwordHash;
        await user.save();

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al cambiar la contraseña"] });
    }
};

// Función para eliminar cuenta
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: ["Contraseña incorrecta"] });
        }

        await User.findByIdAndDelete(userId);

        res.cookie("token", "", {
            expires: new Date(0)
        });

        res.json({ message: "Cuenta eliminada correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al eliminar la cuenta"] });
    }
};

// Función para obtener todos los usuarios (admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('role').select('-password');
        const result = users.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role?.role || 'user',
            createdAt: u.createdAt
        }));
        res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al obtener usuarios"] });
    }
};

// Función para eliminar un usuario (admin)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id)
            return res.status(400).json({ message: ["No puedes eliminar tu propia cuenta desde aquí"] });
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ message: ["Usuario no encontrado"] });
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ["Error al eliminar el usuario"] });
    }
};