import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';

import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PAYMENT_PROVIDER } from './providers/payment-provider.token';
import type { PaymentProvider } from './providers/payment-provider.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listPlans() {
    return this.planRepo.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async getMySubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date()),
      },
      relations: { plan: true },
      order: { endDate: 'DESC' },
    });
    return subscription;
  }

  async getMyPayments(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createCheckout(userId: string, userEmail: string, planId: string) {
    const plan = await this.planRepo.findOne({
      where: { id: planId, isActive: true },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const result = await this.provider.createCheckout({
      userId,
      userEmail,
      planId: plan.id,
      planName: plan.name,
      amount: Number(plan.price),
      currency: plan.currency,
    });

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        userId,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status:
          result.status === 'completed'
            ? PaymentStatus.SUCCEEDED
            : PaymentStatus.PENDING,
        provider: this.provider.name,
        providerPaymentId: result.providerPaymentId,
      }),
    );

    let subscription: Subscription | null = null;
    if (result.status === 'completed') {
      subscription = await this.activateSubscription(userId, plan);

      await this.notificationsService.create(
        userId,
        NotificationType.PAYMENT,
        'Payment received',
        `Your payment of ${plan.currency} ${Number(plan.price).toFixed(2)} for ${plan.name} was successful.`,
      );
      await this.notificationsService.create(
        userId,
        NotificationType.SUBSCRIPTION,
        `${plan.name} activated`,
        `Your ${plan.name} subscription is now active until ${subscription.endDate.toLocaleDateString()}.`,
      );
    }

    return {
      payment: { id: payment.id, status: payment.status },
      redirectUrl: result.redirectUrl ?? null,
      subscription,
    };
  }

  /**
   * Called by the Stripe webhook once a checkout session actually completes.
   * Idempotent: if the payment is already marked succeeded, does nothing.
   */
  async fulfillPaymentByProviderId(providerPaymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { providerPaymentId },
    });
    if (!payment)
      throw new NotFoundException(
        'Payment not found for this provider reference',
      );
    if (payment.status === PaymentStatus.SUCCEEDED) return payment;

    const plan = await this.planRepo.findOne({ where: { id: payment.planId } });
    if (!plan)
      throw new BadRequestException('Plan for this payment no longer exists');

    payment.status = PaymentStatus.SUCCEEDED;
    await this.paymentRepo.save(payment);

    await this.activateSubscription(payment.userId, plan);
    return payment;
  }

  // ---------------------------------------------------------------------

  private async activateSubscription(
    userId: string,
    plan: SubscriptionPlan,
  ): Promise<Subscription> {
    const existing = await this.getMySubscription(userId);
    const start =
      existing && existing.endDate > new Date() ? existing.endDate : new Date();
    const end = new Date(
      start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    if (existing) {
      existing.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(existing);
    }

    return this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        userId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: start,
        endDate: end,
        autoRenew: false,
      }),
    );
  }
}
