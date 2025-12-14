import Product from '../models/product.models.js';
import { v2 as cloudinary } from 'cloudinary';

//Funcion para obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        // Verificar si el usuario es administrador
        const isAdmin = req.user.role === process.env.ROLE_ADMIN;
        
        let query = {};
        
        // Si NO es admin, filtrar por su usuario
        if (!isAdmin) {
            query.user = req.user.id;
        }
        // Si ES admin, query vacío = todos los productos
        
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
        const { name, description, price, quantity, categoria, tallas, colores } = req.body;
        const newProduct = new Product({
            name,
            description,
            price,
            quantity,
            categoria,
            tallas,
            colores,
            image: req.urlImage, //url de cloudinary
            user: req.user.id
        });
        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: ['Error al crear un producto'] })
    }

};//Fin de CreateProduct

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
        if (!product) //No se encontró el producto
            return res.status(404)
                .json({ message: ['Producto no encontrado para eliminar'] })

        //Par eliminar la imagen de cloudinary, es necesario
        //extraer rl nombre de la imagen sin url ni extención

        //Obtenemos la url de la imagen de cloudinary
        //http://res.cloudinary.com/dzcyhcl75/image/upload/v1761746747/cbugwkxxilxz9sdssi8q.jpg
        const imageUrl = product.image;

        //Dividimos por diagonales / la url y nos quedamos con el ultimo elemento
        //que constiene el nombre de la imagen
        const urlArray = imageUrl.split('/');

        //image contendrá el id de la imagfen en cloudinary
        //image = cbugwkxxilxz9sdssi8q.jpg
        const image = urlArray[urlArray.length - 1];

        //Dividimos el nombre de la imagen para quitar la extención
        //imageName = cbugwkxxilxz9sdssi8q
        const imageName = image.split('.')[0];

        //Eliminamos la imagen de cloudinary
        const result = await cloudinary.uploader.destroy(imageName);
        if (result.result === 'ok') {
            //Si se eliminó la imagen, 
            const deleteProduct = await Product.findByIdAndDelete(req.params.id);

            if (!deleteProduct)//No se pudo eliminar el producto
                return res.status(404)
                    .json({ message: ['Producto no eliminado'] })

            return res.json(deleteProduct);
        } else {
            //Si hay error al eliminar la imagen retornamos el error y no borramos el producto
            return res.status(500)
                .json({ message: ['Error al eliminar el producto'] })
        }//Fin de else
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: ['Error al eliminar un producto por'] })
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
    try { //Comprobamos que exista el producto a actualizar en la red
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                .json({ message: ['Producto no encontrado para actualizar'] })

        //Comprobamos que venga el nuevo archivo para actualizar
        if (!req.file) {
            res.status(500)
                .json({ message: ['Error al actualizar producto, no se encontró la imagen'] });
        };

        //Eliminamos la imagen anterior de Cloudinary
        //Obtenemos la url de la imagen de Cloudinary
        const imageUrl = product.image;
        const urlArray = imageUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0];

        //Eliminamos la imagen de cloudinary
        const result = await cloudinary.uploader.destroy(imageName);
        if (!result.result === 'ok') { //Hay un error al eliminar la imagen y retornamos error
            return res.status(500)//si hay error
                .json({ message: ['Error al eliminar la imagen del producto'] })
        }//Fin de if

        const dataProduct = ({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            categoria: req.body.categoria,
            tallas: req.body.tallas,
            colores: req.body.colores,
            image: req.urlImage,
            user: req.user.id
        });
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, dataProduct, { new: true });
        res.json(updatedProduct);

    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: ['Error al actualizar un producto'] })
    }
};//Fin de updateProductWithImage

//Funcion para obtener todos los productos de todos los usuarios
//Para la copra de productos
export const getAllProducts = async (req, res)=>{
    try {
    const products = await Product.find( ); 
    res.json(products);
    } catch (error){
        console.log(error);
        res.status(500)
        .json({message:['Error al obtener todos los productos']})
    }
};//Fin de getAllProducts