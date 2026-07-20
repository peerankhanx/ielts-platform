import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription-service";

export function usePlans() {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: subscriptionService.listPlans,
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ["subscriptions", "me"],
    queryFn: subscriptionService.getMySubscription,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ["subscriptions", "payments"],
    queryFn: subscriptionService.getMyPayments,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => subscriptionService.checkout(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}
