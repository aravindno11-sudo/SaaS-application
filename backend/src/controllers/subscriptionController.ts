import type { Request, Response } from 'express';
import Stripe from 'stripe';
import Workspace from '../models/workspaceModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-11' as any,
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.body;
    const workspace = (req as any).workspace; // From authorizeWorkspace middleware

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Mock Mode for testing with placeholder keys
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder' || !process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe Mock Mode: Redirecting to Mock Checkout UI');
      return res.json({ 
        id: 'mock_session_id', 
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mock-checkout?session_id=mock_session_id` 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan',
              description: 'Unlimited documents and advanced features',
            },
            unit_amount: 2000, // $20.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
      metadata: {
        workspaceId: workspaceId.toString(),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspaceId;

    if (workspaceId) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        'subscription.plan': 'pro',
        'subscription.stripeCustomerId': session.customer as string,
        'subscription.stripeSubscriptionId': session.subscription as string,
        'subscription.status': 'active',
      });
      console.log(`Workspace ${workspaceId} upgraded to Pro`);
    }
  }

  res.json({ received: true });
};

export const mockUpgrade = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID is required' });

    await Workspace.findByIdAndUpdate(workspaceId, {
      'subscription.plan': 'pro',
      'subscription.status': 'active',
    });

    console.log(`Mock Upgrade: Workspace ${workspaceId} upgraded to Pro`);
    res.json({ message: 'Workspace upgraded successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { priceId, workspaceId } = req.body;
    const orderId = `order_mock_${Math.random().toString(36).substring(7)}`;
    res.json({
      id: orderId,
      amount: priceId === 'price_pro' ? 2900 : 0,
      currency: 'INR',
      workspaceId,
      mock: true
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
