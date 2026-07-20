import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../modules/subscriptions/entities/subscription-plan.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const planRepo = app.get<Repository<SubscriptionPlan>>(
    getRepositoryToken(SubscriptionPlan),
  );

  const existing = await planRepo.findOne({ where: { name: 'Free' } });
  if (existing) {
    console.log('Subscription plans already exist, skipping seed.');
    await app.close();
    return;
  }

  await planRepo.save([
    planRepo.create({
      name: 'Free',
      description: 'Get started with limited practice tests.',
      price: 0,
      currency: 'USD',
      durationDays: 36500, // effectively permanent
      maxTests: 3,
      aiAccess: false,
      features: [
        '3 practice tests per module',
        'Basic progress tracking',
        'No AI evaluation',
      ],
      isActive: true,
    }),
    planRepo.create({
      name: 'Premium Monthly',
      description: 'Full access with AI-evaluated Writing and Speaking.',
      price: 19.99,
      currency: 'USD',
      durationDays: 30,
      maxTests: null,
      aiAccess: true,
      features: [
        'Unlimited practice tests',
        'AI-evaluated Writing and Speaking',
        'Full analytics and progress tracking',
        'Priority support',
      ],
      isActive: true,
    }),
    planRepo.create({
      name: 'Premium Annual',
      description: 'The best value for serious exam preparation.',
      price: 179.99,
      currency: 'USD',
      durationDays: 365,
      maxTests: null,
      aiAccess: true,
      features: [
        'Unlimited practice tests',
        'AI-evaluated Writing and Speaking',
        'Full analytics and progress tracking',
        'Priority support',
        '2 months free vs. monthly billing',
      ],
      isActive: true,
    }),
  ]);

  console.log(
    'Seeded 3 subscription plans: Free, Premium Monthly, Premium Annual.',
  );
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
