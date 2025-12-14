import { z } from "zod";

//Esquema para los ítems del carrito
const cartItemSchema = z.object({
  productId: z.string("El id del producto es requerido").min(1, {
    error: "El id del producto no es válido",
  }),
  quantity: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(
      z
        .number("Cantidad de producto requerido")
        .positive("Cantidad debe ser mayor a 0")
        .refine((val) => !isNaN(val), {
          error: "Cantidad debe ser un número válido",
        })
    ),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(
      z
        .number()
        .int({ error: "Precio del producto requerida" })
        .min(0, { error: "Precio debe ser mayor o igual a 0" })
        .refine((val) => !isNaN(val), {
          error: "Precio debe ser un número válido",
        })
    ),
});

//Esquema para los detalles de la tarjeta
const cardDetailsSchema = z.object({
  cardName: z
    .string("El nombre de la tarjeta es requerido")
    .min(3, {
      error: "El nombre de la tarjeta debe tener al menos 3 caracteres",
    })
    .trim(),
  cardNumber: z
    .string("Número de tarjeta requerido")
    .min(12, {
      error: "El número de tarjeta debe tener al menos 12 dígitos",
    })
    .max(19, {
      error: "El número de tarjeta no puede exceder 19 dígitos",
    })
    .regex(/^\d{12,19}$/, "Número de tarjeta inválido")
    .trim(),
  ccv: z
    .string("Ccv requerido")
    .min(3, {
      error: "El ccv debe tener al menos 3 dígitos",
    })
    .max(4, {
      error: "El ccv no puede exceder 4 dígitos",
    })
    .regex(/^\d{3,4}$/, "Ccv inválido")
    .trim(),
  expirationDate: z
    .string("Fecha de expiración requerida")
    .regex(
      /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
      "Formato de fecha inválido (mm/yy)"
    )
    .trim(),
});

//Esquema para la dirección de envío
const shippingAddressSchema = z.object({
  address: z
    .string("La dirección es requerida")
    .min(5, {
      error: "La dirección debe tener al menos 5 caracteres",
    })
    .trim(),
  name: z
    .string("El nombre es requerido")
    .min(3, {
      error: "El nombre debe tener al menos 3 caracteres",
    })
    .trim(),
  phone: z
    .string("El teléfono es requerido")
    .min(7, {
      error: "El teléfono debe tener al menos 7 caracteres",
    })
    .max(20, {
      error: "El teléfono no puede exceder 20 caracteres",
    })
    .regex(/^[\d\s+\-\(\)]{7,20}$/, "Número de teléfono inválido")
    .trim(),
});

//Esquema para la información de pago
const paymentMethodSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardDetails: cardDetailsSchema,
    shippingAddress: shippingAddressSchema,
  }),
  z.object({
    method: z.enum(["pickup"]),
    userName: z
      .string("El nombre es requerido")
      .min(3, {
        error: "El nombre debe tener al menos 3 caracteres",
      })
      .trim(),
  }),
]);

//Esquema principal para la orden de compra
export const orderSchema = z
  .object({
    items: z
      .array(cartItemSchema)
      .min(1, "La orden debe tener al menos un producto"),

    //Método de envío para discriminar la unión (card o pickup pero no ambos)
    paymentMethod: paymentMethodSchema,

    //Campos para el cálculo del total de productos y precio de la orden
    subTotal: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(
        z
          .number("Subtotal requerido")
          .min(0, { error: "Subtotal debe ser mayor o igual a 0" })
          .refine((val) => !isNaN(val), {
            error: "Subtotal debe ser un número válido",
          })
      ),

    iva: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(
        z
          .number("Iva requerido")
          .min(0, { error: "Iva debe ser mayor o igual a 0" })
          .refine((val) => !isNaN(val), {
            error: "Iva debe ser un número válido",
          })
      ),
    total: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(
        z
          .number("Total del pedido requerido")
          .min(1, { error: "El total del pedido debe ser mayor a cero" })
          .refine((val) => !isNaN(val), {
            error: "Total del pedido debe ser un número válido",
          })
      ),

    totalProducts: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(
        z
          .number()
          .int({ error: "Total de productos requerido" })
          .min(0, { error: "La orden debe tener al menos un producto" })
          .refine((val) => !isNaN(val), {
            error: "Total de productos debe ser un número válido",
          })
      ),

    //Datos para el estado del pedido y la fecha y hora de creación
    status: z
      .enum(["received", "confirmed", "cancelled", "delivered"])
      .default("received"),
    createdAt: z.date().optional(),
  })

  .superRefine((data, ctx) => {
    //Validación personalizada: Subtotal + iva = total
    const calculatedTotal = data.subTotal + data.iva;
    if (Math.abs(calculatedTotal - data.total) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El total calculado (${calculatedTotal}) no coincide con el total proporcionado (${data.total})`,
        path: ["total"],
      });
    }

    //Validación personalizada: totalProducts debe ser igual a la suma de las cantidades
    const calculatedProducts = data.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    if (calculatedProducts !== data.totalProducts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El total de productos calculado (${calculatedProducts}) no coincide con el valor proporcionado (${data.totalProducts})`,
        path: ["totalProducts"],
      });
    }
  });
//Fin de orderSchema