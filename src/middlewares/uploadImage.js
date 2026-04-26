import multer from 'multer';
import cloudinary from 'cloudinary';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const uploadToCloudinary = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE')
                return res.status(400).json({ message: ['Tamaño del archivo excedido (máx 5MB)'] });
            return res.status(400).json({ message: [err.message] });
        }

        // Accept file from either 'image' (single) or 'images' (multiple) field
        const file = req.files?.image?.[0] || req.files?.images?.[0] || req.file || null;
        console.log('[UPLOAD] file received:', !!file, file?.originalname);

        // Sin imagen nueva → continuar sin subir
        if (!file) return next();

        if (!allowedMimes.includes(file.mimetype))
            return res.status(400).json({ message: ['Tipo de archivo no permitido'] });

        // Parsear tallas y colores si vienen como string
        if (req.body.tallas && typeof req.body.tallas === 'string') {
            try { req.body.tallas = JSON.parse(req.body.tallas); } catch { req.body.tallas = []; }
        }
        if (req.body.colores && typeof req.body.colores === 'string') {
            try { req.body.colores = JSON.parse(req.body.colores); } catch { req.body.colores = []; }
        }

        // Subir a Cloudinary
        const base64Image = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64Image}`;

        cloudinary.v2.uploader.upload(dataUri)
            .then((uploadResponse) => {
                req.urlImage = uploadResponse.url;
                console.log('[UPLOAD] Cloudinary URL:', req.urlImage);
                next();
            })
            .catch((cloudErr) => {
                console.error('Error Cloudinary:', cloudErr);
                return res.status(500).json({ message: ['Error al subir imagen a Cloudinary'] });
            });
    });
};
