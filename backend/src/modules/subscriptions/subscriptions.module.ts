import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { Payment } from './entities/payment.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { MockPaymentProvider } from './providers/mock-payment-provider';
import { StripePaymentProvider } from './providers/stripe-payment-provider';
import { PAYMENT_PROVIDER } from './providers/payment-provider.token';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Subscription, Payment]),
    NotificationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    MockPaymentProvider,
    StripePaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (mock: MockPaymentProvider, stripe: StripePaymentProvider) =>
        process.env.STRIPE_SECRET_KEY ? stripe : mock,
      inject: [MockPaymentProvider, StripePaymentProvider],
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
