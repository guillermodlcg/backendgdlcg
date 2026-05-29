import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        talla: {
          type: String,
          required: false,
          enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'],
          default: 'Única'
        },
        color: {
          type: String,
          required: false,
          default: 'Sin especificar'
        }
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    iva: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    totalProducts: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      method: {
        type: String,
        required: true,
        enum: ["card", "pickup", "transfer", "cash"],
        default: "card",
      },
      cardDetails: {
        cardName: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
        },
        cardNumber: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
          validate: {
            validator: function (v) {
              return /^\d{12,19}$/.test(v.replace(/\s+/g, ""));
            },
            message: (props) =>
              `${props.value} no es un numero de tarjeta valido`,
          },
        },
        expirationDate: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
          validate: {
            validator: function (v) {
              return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(v);
            },
            message: (props) =>
              `${props.value} no es una fecha de expiracion valida (mm/yy)`,
          },
        },
        ccv: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
          validate: {
            validator: function (v) {
              return /^\d{3,4}$/.test(v);
            },
            message: (props) => `${props.value} no es un CCV valido`,
          },
        },
      }, //Fin de cardDetails
      shippingAddress: {
        address: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
        },
        name: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
        },
        phone: {
          type: String,
          trim: true,
          required: function () {
            return this.paymentMethod.method === "card";
          },
          validate: {
            validator: function (v) {
              return /^[\d\s+\-\(\)]{7,20}$/.test(v);
            },
            message: (props) =>
              `${props.value} no es un número de teléfono válido`,
          },
        },
      }, //Fin de shippingAddress
      userName: {
        type: String,
        trim: true,
        required: function () {
          return this.paymentMethod.method === "pickup";
        },
      }, //Fin de userName
    }, //Fin de paymentMethod
    status: {
      type: String,
      enum: ["pending_payment", "received", "confirmed", "cancelled", "delivered"],
      default: "received",
    }, //Fin de status
    stripeSessionId: { type: String, default: null },
    stripePaymentStatus: { type: String, default: null },
    totalStripe: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
); //Fin de productsSchema

export default mongoose.model("Orders", OrderSchema);