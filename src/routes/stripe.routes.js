import { Router } from 'express';

import { createCheckoutSession, stripeWebhookHandler } from '../controllers/stripe.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Webhook de Stripe (sin auth)
router.post('/webhook', stripeWebhookHandler);

// Crear sesión de checkout (requiere auth)
router.post('/create-checkout-session', authRequired, createCheckoutSession);

export default router;
