import Product from '../models/product.models.js';
import { v2 as cloudinary } from 'cloudinary';

// In-memory idempotency store: key -> { productId, expiresAt }
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL = 60 * 1000; // 60 seconds

//Funcion para obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        // req.user.roles is an array set by validateToken middleware
        const isAdmin = req.user.roles?.includes(process.env.ROLE_ADMIN);
        
        let query = {};
        if (!isAdmin) {
            query.user = req.user.id;
        }
        
        const products = await Product.find(query).populate('user');
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al obtener los productos'] });
    }
};
//Función para crear un producto
export const createProduct = async (req, res) => {
    try {
        // Idempotency check — prevent duplicates on slow connections / double-tap
        const idempotencyKey = req.headers['x-idempotency-key'];
        if (idempotencyKey) {
            const cached = idempotencyCache.get(idempotencyKey);
            if (cached && cached.expiresAt > Date.now()) {
                const existing = await Product.findById(cached.productId);
                if (existing) {
                    console.log('[PRODUCT] Duplicate request blocked, returning existing:', cached.productId);
                    return res.json(existing);
                }
            }
            // Clean expired entries
            for (const [k, v] of idempotencyCache.entries()) {
                if (v.expiresAt <= Date.now()) idempotencyCache.delete(k);
            }
        }

        const { name, description, price, quantity, categoria, tallas, colores } = req.body;
        const newProduct = new Product({
            name,
            description,
            price,
            quantity,
            categoria,
            tallas,
            colores,
            image: req.urlImage,
            user: req.user.id
        });
        const savedProduct = await newProduct.save();

        // Store in idempotency cache
        if (idempotencyKey) {
            idempotencyCache.set(idempotencyKey, {
                productId: savedProduct._id,
                expiresAt: Date.now() + IDEMPOTENCY_TTL
            });
        }

        res.json(savedProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al crear un producto'] });
    }
};//Fin de createProduct

//Función para obtrener un producto por ID
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                .json({ message: ['Producto no encontrado'] })
        res.json(product);
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: ['Error al obtener un producto por ID'] })
    }
};//Fin de getProduct

//Función para eliminar Producto
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: ['Producto no encontrado para eliminar'] });

        // Solo intentar borrar de Cloudinary si la imagen es de Cloudinary
        if (product.image && product.image.includes('cloudinary.com')) {
            const urlArray = product.image.split('/');
            const imageName = urlArray[urlArray.length - 1].split('.')[0];
            try {
                await cloudinary.uploader.destroy(imageName);
            } catch (cloudErr) {
                console.log('Advertencia: no se pudo eliminar imagen de Cloudinary:', cloudErr.message);
            }
        }

        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: ['Producto no eliminado'] });

        return res.json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al eliminar un producto'] });
    }
};//Fin de deleteProduct

//Función para actualizar un producto sin actualizar imagen
export const updateProductWithoutImage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                .json({ message: ['Producto no encontrado para actualizar'] })
        const dataProduct = ({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            categoria: req.body.categoria,
            tallas: req.body.tallas,
            colores: req.body.colores,
            image: req.body.image,
            user: req.user.id
        });
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, dataProduct, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: ['Error al actualizar un producto'] })
    }
};//Fin de updateProductWithoutImage

//Funcion para actualizar el producto con imagen
export const updateProductWithImage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: ['Producto no encontrado para actualizar'] });

        let imageUrl = product.image; // mantener imagen actual por defecto

        // Solo subir nueva imagen si viene archivo
        if (req.urlImage) {
            // Eliminar imagen anterior de Cloudinary si es de Cloudinary
            if (product.image && product.image.includes('cloudinary.com')) {
                const urlArray = product.image.split('/');
                const imageName = urlArray[urlArray.length - 1].split('.')[0];
                try { await cloudinary.uploader.destroy(imageName); } catch (e) {}
            }
            imageUrl = req.urlImage;
        }

        // Parsear tallas y colores si vienen como string
        let tallas = req.body.tallas;
        let colores = req.body.colores;
        if (typeof tallas === 'string') { try { tallas = JSON.parse(tallas); } catch { tallas = []; } }
        if (typeof colores === 'string') { try { colores = JSON.parse(colores); } catch { colores = []; } }

        const dataProduct = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            quantity: parseInt(req.body.quantity),
            categoria: req.body.categoria,
            tallas,
            colores,
            image: imageUrl,
            user: req.user.id
        };
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, dataProduct, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al actualizar un producto'] });
    }
};//Fin de updateProductWithImage

//Funcion para obtener todos los productos de todos los usuarios
//Para la compra de productos
export const getAllProducts = async (req, res) => {
    try {
        // In-stock products first, then out-of-stock, both groups by newest
        const products = await Product.find().sort({ quantity: -1, createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al obtener todos los productos'] });
    }
};//Fin de getAllProducts