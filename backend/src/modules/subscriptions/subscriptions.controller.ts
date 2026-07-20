import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';

import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async listPlans() {
    const plans = await this.subscriptionsService.listPlans();
    return { success: true, data: plans };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@CurrentUser() user: JwtPayload) {
    const subscription = await this.subscriptionsService.getMySubscription(
      user.sub,
    );
    return { success: true, data: subscription };
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@CurrentUser() user: JwtPayload) {
    const payments = await this.subscriptionsService.getMyPayments(user.sub);
    return { success: true, data: payments };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    const result = await this.subscriptionsService.createCheckout(
      user.sub,
      user.email,
      dto.planId,
    );
    return { success: true, data: result };
  }

  /**
   * Stripe webhook — verifies the signature against the raw request body
   * before fulfilling anything. Requires STRIPE_WEBHOOK_SECRET to be set;
   * without it, this endpoint refuses all requests rather than trusting
   * an unverified payload. Untestable in this sandbox (no Stripe account),
   * but the verification logic is real and would reject a forged request.
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
      throw new BadRequestException('Stripe is not configured on this server');
    }
    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing raw request body for signature verification',
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.subscriptionsService.fulfillPaymentByProviderId(session.id);
    }

    return { received: true };
  }
}
