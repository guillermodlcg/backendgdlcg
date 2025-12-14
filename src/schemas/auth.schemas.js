import { email, z } from 'zod'

export const registerSchema = z.object({
    username: z.string('Nombre de usuario requerido')
        .min(5,
            { error: 'El nombre de usuario debe de tener al menos 5 caracteres' }),
    email: z.email({
        error: (email) => email.input === undefined ? 'Email es requerido' : 'Formato de Email inválido'
    }),
    password: z.string('Contraseña requerida')
        .min(6, {
            error: 'El password debe de tener al menos 6 caracteres'
        })
}); //Fin de registerSchema


export const loginSchema = z.object({
    email: z.email({
        error: (email) => email.input === undefined ? 'Email es requerido' : 'Formato de Email inválido'
    }),
    password: z.string('Contraseña requerida')
        .min(6, {
            error: 'El password debe de tener al menos 6 caracteres'
        })
}); //Fin de loginSchema