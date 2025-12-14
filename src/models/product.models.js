import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            default: 0.0,
            required: true
        },
        quantity: {
            type: Number,
            default: 0,
            required: true
        },
        categoria: {
            type: String,
            required: true,
            enum: ['vestidos', 'blusas', 'pantalones', 'faldas', 'trajes', 'abrigos', 'accesorios'],
            default: 'vestidos'
        },
        tallas: [{
            type: String,
            required: false
        }],
        colores: [{
            type: String,
            required: true
        }],
        image: {
            type: String,
            required: true
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Product', productSchema);