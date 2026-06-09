import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { env } from '../env.js';
import { db } from '../db.js';
import { sendEmail, buildBookEmailHtml } from '../services/mailer.js';

const router = Router();

// Initialize Stripe client
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
});

const CreateCheckoutSchema = z.object({
  tier: z.enum(['silver', 'gold', 'platinum']),
});

// POST /api/stripe/create-checkout-session — Public
router.post('/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const { tier } = parsed.data;

    let priceId: string;
    if (tier === 'silver') {
      priceId = env.STRIPE_PRICE_SILVER;
    } else if (tier === 'gold') {
      priceId = env.STRIPE_PRICE_GOLD;
    } else {
      priceId = env.STRIPE_PRICE_PLATINUM;
    }

    const origin = req.headers.origin || env.CORS_ORIGINS.split(',')[0].trim();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tier,
      },
      success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?status=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

const CreateBookCheckoutSchema = z.object({
  email: z.string().email(),
  lang: z.string().optional().default('ro'),
  items: z.array(z.object({
    id: z.string(),
    type: z.enum(['digital', 'physical']),
    quantity: z.number().int().positive()
  })).min(1),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

// POST /api/stripe/create-book-checkout — Public
router.post('/create-book-checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateBookCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'ValidationError',
        issues: parsed.error.issues,
      });
    }

    const { email, lang, items, shippingAddress } = parsed.data;
    const origin = req.headers.origin || env.CORS_ORIGINS.split(',')[0].trim();

    const hasPhysical = items.some(item => item.type === 'physical');

    const line_items: any[] = items.map(item => {
      const isPhysical = item.type === 'physical';
      const name = isPhysical ? 'Dr. Lucia Gariuc - Ghid Sănătate ORL (Carte Fizică)' : 'Dr. Lucia Gariuc - Ghid Sănătate ORL (Ediție Digitală)';
      const unit_amount = isPhysical ? 2500 : 1800; // $25 for physical, $18 for digital
      return {
        price_data: {
          currency: 'usd',
          product_data: { name },
          unit_amount,
        },
        quantity: item.quantity,
      };
    });

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items,
      metadata: {
        type: 'book',
        lang,
      },
      success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?status=cancel`,
    };

    if (hasPhysical) {
      if (shippingAddress) {
        sessionConfig.payment_intent_data = {
          shipping: {
            name: shippingAddress.name,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          },
        };
      } else {
        sessionConfig.shipping_address_collection = { allowed_countries: ['MD'] };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// POST /api/stripe/webhook — Webhook receiver (uses raw body parsed as Buffer)
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Webhook Error: Missing Stripe-Signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This is a Buffer thanks to express.raw() in index.ts
      sig as string,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`ℹ️ Received Stripe Webhook Event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.type === 'book') {
          const email = session.customer_details?.email || session.customer_email || '';
          const lang = session.metadata?.lang || 'ro';
          
          if (!email) {
            console.warn('⚠️ Webhook missing email for book purchase.');
            break;
          }

          const purchase = await db.bookPurchase.create({
            data: {
              email,
              stripeSessionId: session.id,
              status: 'completed',
            },
          });

          await sendEmail({
            to: email,
            subject: lang === 'en' ? 'Your book has arrived!' : 
                     lang === 'ru' ? 'Ваша книга прибыла!' :
                     lang === 'es' ? '¡Tu libro ha llegado!' : 'Cartea ta a sosit!',
            html: buildBookEmailHtml(lang, purchase.id),
          });
          
          console.log(`✅ Book purchase processed for ${email}`);
          break;
        }

        // Subscription processing
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const email = session.customer_details?.email || '';
        const name = session.customer_details?.name || '';
        const tier = session.metadata?.tier || 'unknown';

        if (!subscriptionId) {
          console.warn('⚠️ Webhook checkout.session.completed missing subscription ID.');
          break;
        }

        // Retrieve subscription from Stripe to get period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEndTimestamp = subscription.items.data[0]?.current_period_end || Math.floor(Date.now() / 1000);
        const currentPeriodEnd = new Date(periodEndTimestamp * 1000);

        await db.subscription.upsert({
          where: { stripeSubscriptionId: subscriptionId },
          update: {
            status: subscription.status,
            currentPeriodEnd,
            email,
            name,
            tier,
          },
          create: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            email,
            name,
            tier,
            status: subscription.status,
            currentPeriodEnd,
          },
        });
        console.log(`✅ Subscription saved/updated for ${email} (Tier: ${tier})`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const periodEndTimestamp = subscription.items.data[0]?.current_period_end || Math.floor(Date.now() / 1000);
        const currentPeriodEnd = new Date(periodEndTimestamp * 1000);

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status,
            currentPeriodEnd,
          },
        });
        console.log(`✅ Subscription status updated to '${status}' for sub_${subscriptionId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const status = subscription.status; // typically 'canceled'

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status,
          },
        });
        console.log(`❌ Subscription sub_${subscriptionId} marked as '${status}'`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
