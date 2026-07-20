export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  durationDays: number;
  maxTests: number | null;
  aiAccess: boolean;
  features: string[];
  isActive: boolean;
}

export interface MySubscription {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface PaymentRecord {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  amount: string;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: string;
  createdAt: string;
}

export interface CheckoutResult {
  payment: { id: string; status: string };
  redirectUrl: string | null;
  subscription: MySubscription | null;
}
