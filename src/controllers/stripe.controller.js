
import Stripe from 'stripe';
import Order from '../models/order.models.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_API_KEY);



// Crea una sesión de Stripe Checkout
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, subTotal, iva, total, totalProducts, paymentMethod, shippingAddress } = req.body;
    // Convertir items a Stripe line_items
    const line_items = items.map(item => ({
      price_data: {
        currency: 'mxn',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.productName,
        },
      },
      quantity: item.quantity,
    }));
    // Agregar IVA como un item separado
    line_items.push({
      price_data: {
        currency: 'mxn',
        unit_amount: Math.round(iva * 100),
        product_data: {
          name: 'IVA (16%)',
        },
      },
      quantity: 1,
    });
    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/sale?cancelled=true`,
      metadata: {
        userId: req.user.id,
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
        totalProducts: String(totalProducts),
      },
    });
    // Guardar orden preliminar en MongoDB
    await Order.create({
      user: req.user.id,
      items,
      subTotal,
      iva,
      total,
      totalProducts,
      paymentMethod,
      shippingAddress,
      status: 'pending_payment',
      stripeSessionId: session.id,
    });
    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// Webhook de Stripe
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const order = await Order.findOne({ stripeSessionId: session.id });
      if (order) {
        order.status = 'received';
        order.totalStripe = session.amount_total;
        order.paymentMethod = { method: 'card' };
        order.shippingAddress = JSON.parse(session.metadata.shippingAddress);
        order.stripeSessionId = session.id;
        await order.save();
      }
    } catch (err) {
      return res.status(500).send();
    }
  }
  res.status(200).send();
};
