import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import {
  Book,
  BookCategory,
  BookLevel,
} from '../modules/books/entities/book.entity';

const BOOKS_DIR = join(__dirname, '..', '..', 'uploads', 'books');

interface BookSpec {
  title: string;
  author: string;
  description: string;
  category: BookCategory;
  level: BookLevel;
  filename: string;
  sections: { heading: string; body: string[] }[];
}

const BOOKS: BookSpec[] = [
  {
    title: '100 Essential IELTS Vocabulary Words',
    author: 'Bandwise Editorial Team',
    description:
      'A curated list of high-frequency academic vocabulary that appears across IELTS Reading, Writing, and Speaking tasks, organized by theme with example sentences.',
    category: BookCategory.VOCABULARY,
    level: BookLevel.INTERMEDIATE,
    filename: 'ielts-vocabulary-100.pdf',
    sections: [
      {
        heading: 'Environment & Sustainability',
        body: [
          'sustainable (adj.) — able to continue over time without depleting resources. "The city adopted a sustainable approach to water management."',
          'depletion (n.) — the reduction in the amount of something. "Overfishing has led to the depletion of local fish stocks."',
          'renewable (adj.) — capable of being replenished naturally. "Solar and wind are renewable sources of energy."',
          'mitigate (v.) — to make less severe or serious. "New regulations aim to mitigate the effects of industrial pollution."',
          'biodiversity (n.) — the variety of plant and animal life in an area. "Deforestation threatens biodiversity in the region."',
        ],
      },
      {
        heading: 'Education & Learning',
        body: [
          'curriculum (n.) — the subjects comprising a course of study. "The university revised its curriculum to include more practical modules."',
          'pedagogy (n.) — the method and practice of teaching. "Modern pedagogy emphasizes active student participation."',
          'literacy (n.) — the ability to read and write. "Improving literacy rates remains a national priority."',
          'aptitude (n.) — natural ability or talent. "She showed a strong aptitude for mathematics from an early age."',
          'assessment (n.) — the evaluation of a student\'s ability or progress. "Continuous assessment replaced the single final exam."',
        ],
      },
      {
        heading: 'Economy & Work',
        body: [
          'productivity (n.) — the effectiveness of productive effort. "Remote work has been shown to increase productivity for many employees."',
          'unemployment (n.) — the state of being without a job. "Unemployment rose sharply during the economic downturn."',
          'investment (n.) — the action of putting money into something for future benefit. "Foreign investment has boosted the country\'s infrastructure."',
          'inflation (n.) — a general increase in prices and fall in purchasing power. "Inflation eroded the value of household savings."',
          'entrepreneur (n.) — a person who starts a business, taking on financial risk. "Young entrepreneurs are reshaping the retail sector."',
        ],
      },
    ],
  },
  {
    title: 'Grammar Foundations: Tenses and Clauses',
    author: 'Bandwise Editorial Team',
    description:
      'A practical grammar reference covering the tenses and clause structures most commonly tested in IELTS Writing and Speaking, with corrected example sentences.',
    category: BookCategory.GRAMMAR,
    level: BookLevel.BEGINNER,
    filename: 'grammar-foundations.pdf',
    sections: [
      {
        heading: 'Present Perfect vs. Past Simple',
        body: [
          'Use the past simple for actions completed at a specific time in the past: "I visited Paris in 2019."',
          'Use the present perfect for past actions with relevance to the present, or no specific time given: "I have visited Paris three times."',
          'Common error: "I have visited Paris in 2019" — incorrect, because a specific past time is stated. Correct: "I visited Paris in 2019."',
          'Signal words for past simple: yesterday, last week, in 2019, ago.',
          'Signal words for present perfect: ever, never, already, yet, since, for.',
        ],
      },
      {
        heading: 'Relative Clauses',
        body: [
          'A relative clause adds information about a noun using who, which, that, whose, where, or when.',
          'Defining relative clause (no commas, essential meaning): "Students who study regularly perform better."',
          'Non-defining relative clause (uses commas, extra information): "My brother, who lives in London, is visiting next week."',
          'Common error: omitting the relative pronoun when it is the subject. Incorrect: "The report was written by the team missed the deadline." Correct: "The report that was written by the team missed the deadline."',
        ],
      },
      {
        heading: 'Conditional Sentences',
        body: [
          'Zero conditional (general truths): "If you heat water to 100 degrees, it boils."',
          'First conditional (real future possibility): "If it rains tomorrow, we will cancel the trip."',
          'Second conditional (hypothetical present/future): "If I had more time, I would learn a new language."',
          'Third conditional (hypothetical past, cannot be changed): "If she had studied harder, she would have passed the exam."',
        ],
      },
    ],
  },
];

function generatePdf(spec: BookSpec): Promise<number> {
  return new Promise((resolve, reject) => {
    const filePath = join(BOOKS_DIR, spec.filename);
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(spec.title, { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .font('Helvetica-Oblique')
      .text(`by ${spec.author}`, { align: 'center' });
    doc.moveDown(2);
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(spec.description, { align: 'left' });
    doc.moveDown(2);

    let pageCount = 1;

    for (const section of spec.sections) {
      doc.addPage();
      pageCount++;
      doc.fontSize(16).font('Helvetica-Bold').text(section.heading);
      doc.moveDown(1);
      for (const line of section.body) {
        doc.fontSize(11).font('Helvetica').text(`• ${line}`, { align: 'left' });
        doc.moveDown(0.8);
      }
    }

    doc.end();
    stream.on('finish', () => resolve(pageCount));
    stream.on('error', reject);
  });
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookRepo = app.get<Repository<Book>>(getRepositoryToken(Book));

  const existing = await bookRepo.findOne({ where: { title: BOOKS[0].title } });
  if (existing) {
    console.log('Sample library books already exist, skipping seed.');
    await app.close();
    return;
  }

  mkdirSync(BOOKS_DIR, { recursive: true });

  for (const spec of BOOKS) {
    const pageCount = await generatePdf(spec);
    await bookRepo.save(
      bookRepo.create({
        title: spec.title,
        author: spec.author,
        description: spec.description,
        category: spec.category,
        level: spec.level,
        pageCount,
        fileUrl: `/media/books/${spec.filename}`,
        isPublished: true,
      }),
    );
    console.log(
      `Generated and seeded "${spec.title}" (${pageCount} pages) -> ${spec.filename}`,
    );
  }

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
