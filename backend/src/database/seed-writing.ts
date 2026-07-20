import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WritingTask,
  WritingTaskType,
} from '../modules/writing/entities/writing-task.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const taskRepo = app.get<Repository<WritingTask>>(
    getRepositoryToken(WritingTask),
  );

  const existing = await taskRepo.findOne({
    where: { title: 'Remote Work and Team Collaboration' },
  });
  if (existing) {
    console.log('Sample writing tasks already exist, skipping seed.');
    await app.close();
    return;
  }

  await taskRepo.save([
    taskRepo.create({
      title: 'Remote Work and Team Collaboration',
      taskType: WritingTaskType.TASK_2,
      promptText:
        'Some people believe that employees who work from home are less productive and less committed to their teams than those who work in an office. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      imageUrl: null,
      minWords: 250,
      timeLimitMinutes: 40,
      isPublished: true,
    }),
    taskRepo.create({
      title: 'University Enrollment by Field of Study',
      taskType: WritingTaskType.TASK_1,
      promptText:
        'The chart below shows the percentage of university students enrolled in four fields of study (Engineering, Business, Arts, and Science) in a particular country in 2000, 2010, and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      imageUrl: null,
      minWords: 150,
      timeLimitMinutes: 20,
      isPublished: true,
    }),
  ]);

  console.log('Seeded 2 sample writing tasks (Task 1 and Task 2).');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
