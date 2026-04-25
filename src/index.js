import app from './app.js';
import { connectDB } from './db.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import './libs/initialSetup.js';
import { runSeedIfEmpty } from './seed.js';

//Configuramos la lectura de variables de entorno
//para conección con Cloudinary
dotenv.config();

connectDB();

//Configuración
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    await runSeedIfEmpty();
});