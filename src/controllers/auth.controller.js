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
        role: role.role
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