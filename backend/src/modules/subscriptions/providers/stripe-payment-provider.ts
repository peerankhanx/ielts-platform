import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
} from './payment-provider.interface';

/**
 * Real Stripe Checkout integration. Only used when STRIPE_SECRET_KEY is set
 * (see subscriptions.module.ts's provider factory) — otherwise
 * MockPaymentProvider handles checkout so the flow stays testable without
 * real payment credentials. This could not be tested in this sandbox since
 * no Stripe key was available; the webhook handler (see
 * subscriptions.controller.ts) verifies the Stripe signature before
 * fulfilling, so it's safe to deploy once a real key and webhook secret
 * are configured.
 */
@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  private client: Stripe | null = null;

  private getClient(): Stripe {
    if (!this.client) {
      this.client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    }
    return this.client;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const session = await this.getClient().checkout.sessions.create({
      mode: 'payment',
      customer_email: params.userEmail,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: { name: params.planName },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { userId: params.userId, planId: params.planId },
      success_url: `${process.env.CORS_ORIGIN}/student/subscription?checkout=success`,
      cancel_url: `${process.env.CORS_ORIGIN}/student/subscription?checkout=cancelled`,
    });

    return {
      status: 'redirect',
      redirectUrl: session.url ?? undefined,
      providerPaymentId: session.id,
    };
  }
}
