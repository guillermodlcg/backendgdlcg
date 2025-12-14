import Role from '../models/roles.models.js';
import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../db.js';

export const initializeSetup = async () => {
    try {
        //Configuramos la lectura de variables de enctorno
        dotenv.config();

        //Nos conectamos a la base de datos
        connectDB();

        const roleAdmin = process.env.SETUP_ROLE_ADMIN;
        const roleUser = process.env.SETUP_ROLE_USER;

        //Buscamos si existe algún rol creado en la base de datos
        const countRoles = await Role.estimatedDocumentCount();

        //Si countRoles es cero, significa que no hay roles creados
        if (countRoles == 0) {
            //Hay que crear los roles de usuario en la red
            console.log("Creando roles de usuarios");
            await Promise.all([
                new Role({ role: roleUser }).save(),
                new Role({ role: roleAdmin }).save()
            ])
        }//Fin de if(countRoles)

        //Importamos los datos del usuario administrador definidos en .env
        const setupAdminName = process.env.SETUP_ADMIN_USERNAME;
        const setupPwd = process.env.SETUP_ADMIN_PWD;
        const setupEmail = process.env.SETUP_ADMIN_EMAIL;

        //Buscamos si existe un usuario admin
        const userAdmin = await User.findOne({username: setupAdminName});
        if(userAdmin == null){ //No existe un usuario administratidor
            //Se crea un usuario admin tomando las variables de ambiente
            console.log("Creando un usuario admin");
            const roleAdminDB = await Role.findOne({role: roleAdmin});
            const passwordAdmin = await bcrypt.hash(setupPwd,10);
            const newUserAdmin = new User({
                username: setupAdminName,
                email: setupEmail,
                password: passwordAdmin,
                role: roleAdminDB._id
            });
            await newUserAdmin.save();
            console.log("Roles y usuarios inicializados")
        };//Fin de if(userAdmin == null)
    } catch (error) {
        console.log(error);
        console.log("Error al inicializar los roles de usuario");
    }
};//Fin de initializeSetup


initializeSetup();