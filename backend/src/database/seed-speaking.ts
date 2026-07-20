import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeakingTask } from '../modules/speaking/entities/speaking-task.entity';
import { SpeakingPart } from '../modules/speaking/entities/speaking-part.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const taskRepo = app.get<Repository<SpeakingTask>>(
    getRepositoryToken(SpeakingTask),
  );
  const partRepo = app.get<Repository<SpeakingPart>>(
    getRepositoryToken(SpeakingPart),
  );

  const existing = await taskRepo.findOne({
    where: { title: 'General Speaking Practice' },
  });
  if (existing) {
    console.log('Sample speaking task already exists, skipping seed.');
    await app.close();
    return;
  }

  const task = await taskRepo.save(
    taskRepo.create({
      title: 'General Speaking Practice',
      description:
        'A full 3-part speaking test: introduction, a long turn, and a discussion.',
      isPublished: true,
    }),
  );

  await partRepo.save([
    partRepo.create({
      taskId: task.id,
      partNumber: 1,
      promptText:
        "Let's talk about your hometown. Where are you from, and what do you like about living there?",
      cueCardPoints: null,
      prepTimeSeconds: 0,
      speakTimeSeconds: 60,
    }),
    partRepo.create({
      taskId: task.id,
      partNumber: 2,
      promptText: 'Describe a skill you would like to learn.',
      cueCardPoints: [
        'What the skill is',
        'Why you want to learn it',
        'How you would go about learning it',
        'And explain how this skill could be useful to you in the future',
      ],
      prepTimeSeconds: 60,
      speakTimeSeconds: 120,
    }),
    partRepo.create({
      taskId: task.id,
      partNumber: 3,
      promptText:
        "Now let's discuss learning skills more generally. Do you think it is more important to learn practical skills or academic knowledge? Why?",
      cueCardPoints: null,
      prepTimeSeconds: 0,
      speakTimeSeconds: 90,
    }),
  ]);

  console.log(
    `Seeded speaking task "${task.title}" (id: ${task.id}) with 3 parts.`,
  );
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
