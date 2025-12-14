import multer from 'multer';
import cloudinary from 'cloudinary';

//Configuración de multer
//multer recupera la iumagen del request y la carga en memoria local
const storage = multer.memoryStorage();
const upload = multer({ //upload actua como un middleware para recibir imagenes
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024  //5MB
    }
}).single('image');//Single sube una sola imagen
//Image es el nombre del atributo del formulario

export const uploadToCloudinary = async (req, res, next) => {
    const allowedMimes = ['image/jpeg', 'image/jpg',
        'image/png', 'image/gif', 'image/webp'];
    try {
        upload(req, res, async (err) => {
            if (err) {
                if (err.code == 'LIMIT_FILE_SIZE')
                    return res.status(400)
                        .json({ message: ['Tamaño del archivo excedido'] })
            }//Fin del if(err)
            //req.file es donde se guarda la imagen cargada en memoria
            if (!req.file)
                return res.status(400)
                    .json({ message: ['Imagen no encontrada'] })
            if (!allowedMimes.includes(req.file.mimetype))
                return res.status(400)
                    .json({ message: ['Tipo de archivo no permitido'] })

            //Creamos una url de cloudinary para la imagen del producto
            const image = req.file;

            //Convertir el objeto de la imagen a un objeto base64
            //para poderlo almacenar como imagen en Cloudinary
            const base64Image = Buffer.from(image.buffer).toString('base64');
            const dataUri = 'data:' + image.mimetype +';base64,' + base64Image;

            //Subimos la imagen a cloudinary
            const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
            req.urlImage = uploadResponse.url;

            // Parsear arrays JSON que vienen como strings desde FormData
            if (req.body.tallas && typeof req.body.tallas === 'string') {
                try {
                    req.body.tallas = JSON.parse(req.body.tallas);
                } catch (e) {
                    req.body.tallas = [];
                }
            }
            
            if (req.body.colores && typeof req.body.colores === 'string') {
                try {
                    req.body.colores = JSON.parse(req.body.colores);
                } catch (e) {
                    req.body.colores = [];
                }
            }

            next();
        })//Fin de upload
    } catch (error) {
        return res.status(400)
            .json({ message: [error.message] })
    }//Fin del catch
}; //Fin de uploadToCloudinary