import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { SubscriptionPlan, MySubscription, PaymentRecord, CheckoutResult } from "@/types/subscription";

export const subscriptionService = {
  async listPlans() {
    const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]>>("/subscriptions/plans");
    return data.data;
  },

  async getMySubscription() {
    const { data } = await apiClient.get<ApiResponse<MySubscription | null>>("/subscriptions/me");
    return data.data;
  },

  async getMyPayments() {
    const { data } = await apiClient.get<ApiResponse<PaymentRecord[]>>("/subscriptions/payments");
    return data.data;
  },

  async checkout(planId: string) {
    const { data } = await apiClient.post<ApiResponse<CheckoutResult>>("/subscriptions/checkout", { planId });
    return data.data;
  },
};
