"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { usePlans, useMySubscription, useMyPayments, useCheckout } from "@/hooks/use-subscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function SubscriptionPage() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: mySubscription, isLoading: subLoading } = useMySubscription();
  const { data: payments } = useMyPayments();
  const checkout = useCheckout();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setPurchasingId(planId);
    try {
      const result = await checkout.mutateAsync(planId);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Subscription</h1>
        <p className="mt-1 text-sm text-text-soft">Manage your plan and billing history.</p>
      </div>

      {!subLoading && (
        <Card>
          <CardContent className="flex items-center justify-between">
            {mySubscription ? (
              <>
                <div>
                  <p className="text-xs text-text-soft">Current plan</p>
                  <p className="font-display text-lg font-semibold">{mySubscription.plan.name}</p>
                  <p className="mt-1 text-xs text-text-soft">
                    Renews or expires on {new Date(mySubscription.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </>
            ) : (
              <div>
                <p className="text-xs text-text-soft">Current plan</p>
                <p className="font-display text-lg font-semibold">No active subscription</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Plans</h2>
        {plansLoading && <p className="text-sm text-text-soft">Loading plans…</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans?.map((plan) => {
            const isCurrent = mySubscription?.planId === plan.id;
            const isPopular = plan.name === "Premium Monthly";
            return (
              <Card key={plan.id} className={cn("relative", isPopular && "border-primary")}>
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-text-soft">{plan.description}</p>
                  </div>
                  <div>
                    <span className="font-display text-3xl font-bold">
                      {Number(plan.price) === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {Number(plan.price) > 0 && (
                      <span className="text-sm text-text-soft">
                        {" "}
                        / {plan.durationDays >= 365 ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-auto w-full"
                    variant={isCurrent ? "outline" : "primary"}
                    disabled={isCurrent}
                    isLoading={purchasingId === plan.id}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {isCurrent ? "Current plan" : Number(plan.price) === 0 ? "Switch to Free" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {payments && payments.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Billing history
          </h2>
          <Card>
            <CardContent className="flex flex-col divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{p.plan.name}</p>
                    <p className="text-xs text-text-soft">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${p.amount} {p.currency}
                    </p>
                    <Badge variant={p.status === "succeeded" ? "success" : p.status === "failed" ? "error" : "warning"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
