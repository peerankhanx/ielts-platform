import { NestFactory } from '@nestjs/core';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Test,
  ModuleType,
  TestDifficulty,
} from '../modules/mock-tests/entities/test.entity';
import { ListeningSection } from '../modules/listening/entities/listening-section.entity';
import {
  Question,
  QuestionType,
} from '../modules/reading/entities/question.entity';

const TRANSCRIPT = `Good morning, and welcome to the Riverside Community Library. Before we begin today's orientation session, let me go over a few practical details. The library is open Monday to Friday from nine a.m. to eight p.m., and on Saturdays from ten a.m. to four p.m. We are closed on Sundays and public holidays.

New members can register for a library card at the front desk. You will need to bring one form of photo identification and proof of your current address, such as a utility bill. The registration process usually takes about ten minutes, and the card itself is free of charge.

Once registered, members may borrow up to eight items at a time, including books, magazines, and audio books. The standard loan period is three weeks, and items can be renewed twice online, provided no one else has placed a hold on them. Please note that overdue items incur a small fine of twenty cents per day, per item.

If you're looking for a quiet place to study, the second floor has a dedicated silent study area, while the ground floor café area allows for group discussion. Wifi is available throughout the building, and the password is printed on the back of your library card.

Finally, we run a number of free workshops each month, including resume writing, digital literacy for seniors, and children's story time on Saturday mornings. You can find the full schedule posted on the noticeboard near the entrance, or on our website.`;

function generateAudio(outputDir: string): {
  filename: string;
  durationSeconds: number;
} {
  mkdirSync(outputDir, { recursive: true });

  const filename = 'library-orientation.mp3';
  const wavPath = join(outputDir, 'library-orientation.wav');
  const mp3Path = join(outputDir, filename);

  if (!existsSync(mp3Path)) {
    const escaped = TRANSCRIPT.replace(/"/g, '\\"');
    execSync(`espeak-ng -v en-us -s 150 "${escaped}" -w "${wavPath}"`, {
      stdio: 'ignore',
    });
    execSync(
      `ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 4 "${mp3Path}"`,
      { stdio: 'ignore' },
    );
  }

  const durationOutput = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${mp3Path}"`,
  ).toString();

  return { filename, durationSeconds: Math.round(parseFloat(durationOutput)) };
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const testRepo = app.get<Repository<Test>>(getRepositoryToken(Test));
  const sectionRepo = app.get<Repository<ListeningSection>>(
    getRepositoryToken(ListeningSection),
  );
  const questionRepo = app.get<Repository<Question>>(
    getRepositoryToken(Question),
  );

  const existing = await testRepo.findOne({
    where: { title: 'Library Orientation' },
  });
  if (existing) {
    console.log('Sample listening test already exists, skipping seed.');
    await app.close();
    return;
  }

  const audioDir = join(__dirname, '..', '..', 'uploads', 'audio');
  const { filename, durationSeconds } = generateAudio(audioDir);

  const test = await testRepo.save(
    testRepo.create({
      title: 'Library Orientation',
      description:
        'Listening practice test — one audio section, mixed question types.',
      moduleType: ModuleType.LISTENING,
      difficulty: TestDifficulty.EASY,
      timeLimitMinutes: 10,
      isPublished: true,
    }),
  );

  const section = await sectionRepo.save(
    sectionRepo.create({
      testId: test.id,
      orderIndex: 1,
      title: 'Section 1 — Library Orientation',
      audioUrl: `/media/audio/${filename}`,
      durationSeconds,
      transcript: TRANSCRIPT,
    }),
  );

  const questions: Partial<Question>[] = [
    {
      testId: test.id,
      sectionId: section.id,
      orderIndex: 1,
      type: QuestionType.MULTIPLE_CHOICE,
      promptText: 'What time does the library open on Saturdays?',
      options: [
        '9:00 a.m.',
        '10:00 a.m.',
        '8:00 a.m.',
        'It is closed on Saturdays',
      ],
      correctAnswer: '10:00 a.m.',
      explanation:
        'The speaker says the library is open "on Saturdays from ten a.m. to four p.m."',
    },
    {
      testId: test.id,
      sectionId: section.id,
      orderIndex: 2,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      promptText: 'There is a fee to register for a library card.',
      correctAnswer: 'FALSE',
      explanation: 'The speaker states the card "is free of charge."',
    },
    {
      testId: test.id,
      sectionId: section.id,
      orderIndex: 3,
      type: QuestionType.SHORT_ANSWER,
      promptText:
        'How many items can a member borrow at one time? (write the number)',
      correctAnswer: ['8', 'eight'],
      explanation:
        'The speaker says members "may borrow up to eight items at a time."',
    },
    {
      testId: test.id,
      sectionId: section.id,
      orderIndex: 4,
      type: QuestionType.MULTIPLE_CHOICE,
      promptText: 'Where should a member go to study in silence?',
      options: [
        'The ground floor café',
        'The second floor',
        'The entrance noticeboard',
        'The front desk',
      ],
      correctAnswer: 'The second floor',
      explanation:
        'The speaker mentions "the second floor has a dedicated silent study area."',
    },
    {
      testId: test.id,
      sectionId: section.id,
      orderIndex: 5,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      promptText: "Children's story time takes place on Saturday mornings.",
      correctAnswer: 'TRUE',
      explanation:
        'The speaker lists "children\'s story time on Saturday mornings" among the workshops.',
    },
  ];

  await questionRepo.save(questions.map((q) => questionRepo.create(q)));

  console.log(
    `Seeded test "${test.title}" (id: ${test.id}) with ${questions.length} questions.`,
  );
  console.log(`Audio: ${audioDir}/${filename} (${durationSeconds}s)`);
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
