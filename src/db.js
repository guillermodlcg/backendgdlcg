import mongoose from 'mongoose';

export const connectDB = async ()=>{
    const url = process.env.MONGODB_URL;
    await mongoose.connect(url)
    .then (()=>{
        console.log("Base de datos conectada");
    })
    .catch ((error)=>{
        console.log("Error al conectarse a la base de datos")
        console.log(error);
    })
}
//Fin de connectDB;