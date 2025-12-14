import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import dotenv from 'dotenv';

//Configuramos la lectura de variables
//para poder usar las URL backend y frontend
dotenv.config();

console.log("Backend: ", process.env.BASE_URL_BACKEND);
console.log("Frontend: ", process.env.BASE_URL_FRONTEND);

//Importamos las rutas para usuarios
import authRoutes from './routes/auth.routes.js';
//Importamos las rutas para productos
import productRoutes from './routes/product.routes.js';
//Importamos las rutas para ordenes
import orderRoutes from './routes/order.routes.js';

const app = express();
app.use(cors({
    credentials: true,
    origin: [
        process.env.BASE_URL_BACKEND, //la dejamos para que funcione postman
        process.env.BASE_URL_FRONTEND
    ],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser()); //Cookies en formato json 
//Recibir imagenes en el req.body
app.use(express.urlencoded({extended: false}));

//Indicamos que el servidor utilice el objeto authRoutes
app.use('/api/', authRoutes);
app.use('/api/', productRoutes);
app.use('/api/', orderRoutes);

export default app;