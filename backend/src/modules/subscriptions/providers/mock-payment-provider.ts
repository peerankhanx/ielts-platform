import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
} from './payment-provider.interface';

/**
 * Simulates a successful payment with no external gateway involved — used
 * automatically when STRIPE_SECRET_KEY isn't set. This is what makes the
 * subscription flow (checkout -> payment record -> active subscription)
 * genuinely testable end-to-end without real payment credentials, the same
 * pattern as HeuristicWritingEvaluator standing in for ClaudeWritingEvaluator.
 *
 * It does NOT simulate failure cases, 3D Secure, or refunds — it only proves
 * the pipeline wiring is correct. Real card-decline/dispute handling should
 * be tested against Stripe's test-mode cards once a real key is configured.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by the PaymentProvider interface
  createCheckout(_params: CreateCheckoutParams): Promise<CheckoutResult> {
    return Promise.resolve({
      status: 'completed',
      providerPaymentId: `mock_${randomUUID()}`,
    });
  }
}
