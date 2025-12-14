import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProductWithoutImage,
  updateProductWithImage,
  getAllProducts,
} from "../controllers/products.controller.js";

//importamos el validateSchemas
import { validateSchemas } from "../middlewares/validateSchemas.js";

//Importamos los esquemas de validación
import {
  productSchema,
  productUpdateSchema,
} from "../schemas/product.schemas.js";

//Importamos el middleware para subir imagenes a cloudinary
import { uploadToCloudinary } from "../middlewares/uploadImage.js";

//Importamos el middleware para administrador
import { isAdmin } from "../middlewares/isAdmin.js";

//Importamos el middleware para validarId
import { validateId } from "../middlewares/validateId.js";

const router = Router();

//Ruta para obtener todos los productos para la compra
router.get("/products/getallproducts", authRequired, getAllProducts);

//Ruta para obtener todos los productos
router.get("/products", authRequired, getProducts);

//Ruta para crear un producto
router.post(
  "/products",
  authRequired,
  isAdmin,
  uploadToCloudinary,
  validateSchemas(productSchema),
  createProduct
);

//Ruta para obtener un producto por ID
router.get("/products/:id", validateId, authRequired, isAdmin, getProduct);

//Ruta para eliminar un producto
router.delete(
  "/products/:id",
  validateId,
  authRequired,
  isAdmin,
  deleteProduct
);

//Ruta para actualizar un producto sin actualizar imagen
router.put(
  "/products/:id",
  validateId,
  authRequired,
  isAdmin,
  validateSchemas(productUpdateSchema),
  updateProductWithoutImage
);

//Ruta para actualizar un producto y CAMBIAR la imagen
router.put(
  "/products/updatewithimage/:id",
  validateId,
  authRequired,
  isAdmin,
  uploadToCloudinary,
  validateSchemas(productSchema),
  updateProductWithImage
);

//Ruta para obtener todos los productos para la compra
router.get("/getallproducts", getAllProducts);

export default router;