import { z } from "zod";

export const productSchema = z.object({
    name: z.string({required_error: 'Nombre del producto requerido'}).min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string({required_error: 'Descripción del producto requerida'}).min(10, 'La descripción debe tener al menos 10 caracteres'),
    price: z.string()
        .transform ( (val) => parseFloat(val))
        .pipe(
            z.number('Precio del producto requerido')
                .positive('El precio del producto debe ser mayor a 0')
        .refine((val)=>!isNaN(val), { message: 'El precio debe ser número válido' })
    ),
    quantity:z.string()
        .transform((val) => parseInt(val))
        .pipe(
            z.number('Cantidad del producto requerida')
                .min(0, {message: 'La cantidad de productos debe ser mayor o igual a 0'})
        .refine((val)=>!isNaN(val), { message: 'La cantidad debe ser número válido' })
    ),
    categoria: z.enum(['tops', 'leggings', 'shorts', 'calzado', 'sudaderas', 'pants', 'accesorios'], {
        required_error: 'Categoría requerida',
        invalid_type_error: 'Categoría inválida'
    }),
    tallas: z.array(z.string())
        .min(0)
        .optional()
        .default([]),
    colores: z.array(z.string()).min(1, 'Debe seleccionar al menos un color')
}).refine(
    (data) => {
        // Si no es accesorio, debe tener al menos una talla
        if (data.categoria !== 'accesorios') {
            return data.tallas && data.tallas.length > 0;
        }
        return true;
    },
    {
        message: 'Debe seleccionar al menos una talla',
        path: ['tallas'],
    }
);//Fin de ProductSchema

export const productUpdateSchema =z.object({
    name: z.string('Nombre del producto requerido'),
    price: z.number('Precio del producto requerido')
    .positive('El precio debe ser mayor a 0')
    .refine((val) => !isNaN(val), { error: 'El preciodebe ser un número válido' }),
    quantity: z.number()
    .int({error:'Cantidad del producto requerida'})
    .min(0, {error:'La cantidad debe ser mayor o igual a 0'})
    .refine((val) => !isNaN(val), {error: 'La cantidad debe ser un número válido' }),
    image: z.string().optional(),
});//Fin de ProductUpdateSchema