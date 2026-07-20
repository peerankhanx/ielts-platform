import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Test,
  ModuleType,
  TestDifficulty,
} from '../modules/mock-tests/entities/test.entity';
import { ReadingPassage } from '../modules/reading/entities/reading-passage.entity';
import {
  Question,
  QuestionType,
} from '../modules/reading/entities/question.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const testRepo = app.get<Repository<Test>>(getRepositoryToken(Test));
  const passageRepo = app.get<Repository<ReadingPassage>>(
    getRepositoryToken(ReadingPassage),
  );
  const questionRepo = app.get<Repository<Question>>(
    getRepositoryToken(Question),
  );

  const existing = await testRepo.findOne({
    where: { title: 'The Rise of Urban Beekeeping' },
  });
  if (existing) {
    console.log('Sample reading test already exists, skipping seed.');
    await app.close();
    return;
  }

  const test = await testRepo.save(
    testRepo.create({
      title: 'The Rise of Urban Beekeeping',
      description:
        'Academic Reading practice test — one passage, mixed question types.',
      moduleType: ModuleType.READING,
      difficulty: TestDifficulty.MEDIUM,
      timeLimitMinutes: 20,
      isPublished: true,
    }),
  );

  const passageContent = `Over the past two decades, beekeeping has undergone a quiet transformation, migrating from rural farmland to the rooftops and balconies of major cities. London, New York, and Paris now host thousands of registered hives, many maintained not by commercial apiarists but by hobbyists, restaurant owners, and community groups. Proponents argue that urban beekeeping supports biodiversity in areas where green space is scarce, pointing to studies that show city bees often out-produce their rural counterparts due to the diversity of flowering plants found in parks, gardens, and street trees.

Critics, however, caution that the trend has grown faster than the ecological understanding behind it. Some entomologists warn that a concentration of honeybee hives in a small urban area can create intense competition for nectar, potentially crowding out native wild bee species — many of which are already in decline and are, in fact, more efficient pollinators of certain native plants than honeybees. A 2019 survey of London hives found that in several boroughs, hive density had reached levels comparable to the most intensively managed agricultural regions, raising questions about whether the city's flowering resources could sustainably support both managed and wild pollinators.

City governments have responded unevenly. Some, including Paris, have introduced licensing schemes that cap the number of hives permitted per district and require new beekeepers to complete a training course before registering a colony. Others have taken a more permissive approach, treating beekeeping primarily as a public engagement and education tool rather than an ecological intervention requiring regulation. Advocates for tighter rules argue that without data-driven limits, urban beekeeping risks becoming a victim of its own popularity — helping headline-grabbing honeybees while quietly harming the less visible wild species that ecosystems depend on just as heavily.`;

  const passage = await passageRepo.save(
    passageRepo.create({
      testId: test.id,
      orderIndex: 1,
      title: 'The Rise of Urban Beekeeping',
      content: passageContent,
      wordCount: passageContent.split(/\s+/).length,
    }),
  );

  const questions: Partial<Question>[] = [
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 1,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      promptText: 'Urban hives are always maintained by commercial apiarists.',
      correctAnswer: 'FALSE',
      explanation:
        'The passage states hives are "maintained not by commercial apiarists but by hobbyists, restaurant owners, and community groups."',
    },
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 2,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      promptText:
        'City bees sometimes produce more honey than bees kept in rural areas.',
      correctAnswer: 'TRUE',
      explanation:
        'The passage says city bees "often out-produce their rural counterparts."',
    },
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 3,
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      promptText:
        'All native wild bee species have already gone extinct in major cities.',
      correctAnswer: 'NOT GIVEN',
      explanation:
        'The passage says many wild species "are already in decline" but does not claim extinction.',
    },
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 4,
      type: QuestionType.MULTIPLE_CHOICE,
      promptText:
        'According to the passage, what did the 2019 survey of London hives find?',
      options: [
        'Hive density in some boroughs matched intensive agricultural regions',
        'Most London boroughs had no registered hives at all',
        'Wild bee populations had fully recovered',
        'Honeybee hives were banned in several boroughs',
      ],
      correctAnswer:
        'Hive density in some boroughs matched intensive agricultural regions',
      explanation:
        'The passage states hive density "had reached levels comparable to the most intensively managed agricultural regions."',
    },
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 5,
      type: QuestionType.MULTIPLE_CHOICE,
      promptText: 'What approach has Paris taken toward urban beekeeping?',
      options: [
        'Banning all hives within city limits',
        'Licensing with hive caps and mandatory training',
        'Ignoring the practice entirely',
        'Subsidizing unlimited hive registration',
      ],
      correctAnswer: 'Licensing with hive caps and mandatory training',
      explanation:
        'Paris introduced "licensing schemes that cap the number of hives... and require... training."',
    },
    {
      testId: test.id,
      passageId: passage.id,
      orderIndex: 6,
      type: QuestionType.SHORT_ANSWER,
      promptText:
        'What kind of bees are described as often being more efficient pollinators of certain native plants than honeybees? (one or two words)',
      correctAnswer: ['wild bees', 'native wild bees', 'wild bee species'],
      explanation:
        'The passage says wild bee species "are, in fact, more efficient pollinators of certain native plants than honeybees."',
    },
  ];

  await questionRepo.save(questions.map((q) => questionRepo.create(q)));

  console.log(
    `Seeded test "${test.title}" (id: ${test.id}) with ${questions.length} questions.`,
  );
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
