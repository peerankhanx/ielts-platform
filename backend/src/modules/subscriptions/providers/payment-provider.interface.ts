export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
}

export interface CheckoutResult {
  /** 'completed' means the payment is already settled (mock provider, no
   *  external redirect needed). 'redirect' means the client must send the
   *  user to `redirectUrl` to complete payment (real Stripe Checkout). */
  status: 'completed' | 'redirect';
  redirectUrl?: string;
  providerPaymentId: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
}
