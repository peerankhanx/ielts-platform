import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Test, ModuleType } from '../../mock-tests/entities/test.entity';
import { ReadingPassage } from '../../reading/entities/reading-passage.entity';
import { Question } from '../../reading/entities/question.entity';
import { ListeningSection } from '../../listening/entities/listening-section.entity';
import { WritingTask } from '../../writing/entities/writing-task.entity';
import { SpeakingTask } from '../../speaking/entities/speaking-task.entity';
import { SpeakingPart } from '../../speaking/entities/speaking-part.entity';

import {
  CreateReadingTestDto,
  UpdateTestMetaDto,
} from './dto/create-reading-test.dto';
import { CreateListeningTestDto } from './dto/create-listening-test.dto';
import {
  CreateWritingTaskDto,
  CreateSpeakingTaskDto,
} from './dto/create-task.dto';
import {
  UpsertQuestionDto,
  UpdatePassageDto,
  CreatePassageDto,
  UpdateSectionDto,
  CreateSectionDto,
} from './dto/edit-content.dto';

@Injectable()
export class ContentAdminService {
  constructor(
    @InjectRepository(Test) private readonly testRepo: Repository<Test>,
    @InjectRepository(ReadingPassage)
    private readonly passageRepo: Repository<ReadingPassage>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(ListeningSection)
    private readonly sectionRepo: Repository<ListeningSection>,
    @InjectRepository(WritingTask)
    private readonly writingTaskRepo: Repository<WritingTask>,
    @InjectRepository(SpeakingTask)
    private readonly speakingTaskRepo: Repository<SpeakingTask>,
    @InjectRepository(SpeakingPart)
    private readonly speakingPartRepo: Repository<SpeakingPart>,
  ) {}

  // --- Reading -----------------------------------------------------------

  async listReadingTests() {
    return this.testRepo.find({
      where: { moduleType: ModuleType.READING },
      order: { createdAt: 'DESC' },
    });
  }

  async createReadingTest(dto: CreateReadingTestDto) {
    if (dto.passages.length === 0)
      throw new BadRequestException('At least one passage is required');
    if (dto.questions.length === 0)
      throw new BadRequestException('At least one question is required');

    const test = await this.testRepo.save(
      this.testRepo.create({
        title: dto.title,
        description: dto.description,
        moduleType: ModuleType.READING,
        difficulty: dto.difficulty,
        timeLimitMinutes: dto.timeLimitMinutes ?? 60,
        isPublished: false, // authors publish explicitly once content is reviewed
      }),
    );

    const passages = await this.passageRepo.save(
      dto.passages.map((p) =>
        this.passageRepo.create({
          testId: test.id,
          orderIndex: p.orderIndex,
          title: p.title,
          content: p.content,
          wordCount: p.content.split(/\s+/).filter(Boolean).length,
        }),
      ),
    );

    for (const q of dto.questions) {
      if (q.passageIndex < 0 || q.passageIndex >= passages.length) {
        throw new BadRequestException(
          `Question references invalid passageIndex ${q.passageIndex}`,
        );
      }
    }

    await this.questionRepo.save(
      dto.questions.map((q) =>
        this.questionRepo.create({
          testId: test.id,
          passageId: passages[q.passageIndex].id,
          orderIndex: q.orderIndex,
          type: q.type,
          promptText: q.promptText,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          points: q.points ?? 1,
          explanation: q.explanation,
        }),
      ),
    );

    return test;
  }

  // --- Listening -----------------------------------------------------------

  async listListeningTests() {
    return this.testRepo.find({
      where: { moduleType: ModuleType.LISTENING },
      order: { createdAt: 'DESC' },
    });
  }

  async createListeningTest(dto: CreateListeningTestDto) {
    if (dto.sections.length === 0)
      throw new BadRequestException('At least one section is required');
    if (dto.questions.length === 0)
      throw new BadRequestException('At least one question is required');

    const test = await this.testRepo.save(
      this.testRepo.create({
        title: dto.title,
        description: dto.description,
        moduleType: ModuleType.LISTENING,
        difficulty: dto.difficulty,
        timeLimitMinutes: dto.timeLimitMinutes ?? 30,
        isPublished: false,
      }),
    );

    // audioUrl starts empty — set via uploadSectionAudio() once the admin
    // attaches a real audio file for each section.
    const sections = await this.sectionRepo.save(
      dto.sections.map((s) =>
        this.sectionRepo.create({
          testId: test.id,
          orderIndex: s.orderIndex,
          title: s.title,
          audioUrl: '',
          durationSeconds: 0,
        }),
      ),
    );

    for (const q of dto.questions) {
      if (q.sectionIndex < 0 || q.sectionIndex >= sections.length) {
        throw new BadRequestException(
          `Question references invalid sectionIndex ${q.sectionIndex}`,
        );
      }
    }

    await this.questionRepo.save(
      dto.questions.map((q) =>
        this.questionRepo.create({
          testId: test.id,
          sectionId: sections[q.sectionIndex].id,
          orderIndex: q.orderIndex,
          type: q.type,
          promptText: q.promptText,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          points: q.points ?? 1,
          explanation: q.explanation,
        }),
      ),
    );

    return { test, sections };
  }

  async setSectionAudio(
    sectionId: string,
    audioUrl: string,
    durationSeconds: number,
  ) {
    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
    });
    if (!section) throw new NotFoundException('Listening section not found');

    section.audioUrl = audioUrl;
    section.durationSeconds = durationSeconds;
    return this.sectionRepo.save(section);
  }

  // --- Writing -----------------------------------------------------------

  async listWritingTasks() {
    return this.writingTaskRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createWritingTask(dto: CreateWritingTaskDto) {
    return this.writingTaskRepo.save(
      this.writingTaskRepo.create({
        title: dto.title,
        taskType: dto.taskType,
        promptText: dto.promptText,
        imageUrl: dto.imageUrl ?? null,
        minWords: dto.minWords,
        timeLimitMinutes: dto.timeLimitMinutes,
        isPublished: false,
      }),
    );
  }

  async deleteWritingTask(taskId: string) {
    const result = await this.writingTaskRepo.delete({ id: taskId });
    if (!result.affected) throw new NotFoundException('Writing task not found');
  }

  async toggleWritingTaskPublish(taskId: string, isPublished: boolean) {
    const task = await this.writingTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Writing task not found');
    task.isPublished = isPublished;
    return this.writingTaskRepo.save(task);
  }

  // --- Speaking -----------------------------------------------------------

  async listSpeakingTasks() {
    return this.speakingTaskRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createSpeakingTask(dto: CreateSpeakingTaskDto) {
    if (dto.parts.length === 0)
      throw new BadRequestException('At least one part is required');

    const task = await this.speakingTaskRepo.save(
      this.speakingTaskRepo.create({
        title: dto.title,
        description: dto.description,
        isPublished: false,
      }),
    );

    await this.speakingPartRepo.save(
      dto.parts.map((p) =>
        this.speakingPartRepo.create({
          taskId: task.id,
          partNumber: p.partNumber,
          promptText: p.promptText,
          cueCardPoints: p.cueCardPoints ?? null,
          prepTimeSeconds: p.prepTimeSeconds ?? 0,
          speakTimeSeconds: p.speakTimeSeconds,
        }),
      ),
    );

    return task;
  }

  async deleteSpeakingTask(taskId: string) {
    const result = await this.speakingTaskRepo.delete({ id: taskId });
    if (!result.affected)
      throw new NotFoundException('Speaking task not found');
  }

  async toggleSpeakingTaskPublish(taskId: string, isPublished: boolean) {
    const task = await this.speakingTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Speaking task not found');
    task.isPublished = isPublished;
    return this.speakingTaskRepo.save(task);
  }

  // --- Shared (reading/listening tests) -----------------------------------

  async deleteTest(testId: string) {
    const result = await this.testRepo.delete({ id: testId });
    if (!result.affected) throw new NotFoundException('Test not found');
  }

  async toggleTestPublish(testId: string, isPublished: boolean) {
    const test = await this.testRepo.findOne({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test not found');
    test.isPublished = isPublished;
    return this.testRepo.save(test);
  }

  async updateTestMeta(testId: string, dto: UpdateTestMetaDto) {
    const test = await this.testRepo.findOne({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test not found');

    if (dto.title !== undefined) test.title = dto.title;
    if (dto.description !== undefined) test.description = dto.description;
    if (dto.isPublished !== undefined) test.isPublished = dto.isPublished;

    return this.testRepo.save(test);
  }

  // --- Full detail (for the edit UI) --------------------------------------

  async getReadingTestFull(testId: string) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.READING },
    });
    if (!test) throw new NotFoundException('Test not found');

    const passages = await this.passageRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });
    const questions = await this.questionRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });

    return { test, passages, questions };
  }

  async getListeningTestFull(testId: string) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.LISTENING },
    });
    if (!test) throw new NotFoundException('Test not found');

    const sections = await this.sectionRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });
    const questions = await this.questionRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });

    return { test, sections, questions };
  }

  // --- Passages (reading) --------------------------------------------------

  async addPassage(testId: string, dto: CreatePassageDto) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.READING },
    });
    if (!test) throw new NotFoundException('Reading test not found');

    return this.passageRepo.save(
      this.passageRepo.create({
        testId,
        orderIndex: dto.orderIndex,
        title: dto.title,
        content: dto.content,
        wordCount: dto.content.split(/\s+/).filter(Boolean).length,
      }),
    );
  }

  async updatePassage(passageId: string, dto: UpdatePassageDto) {
    const passage = await this.passageRepo.findOne({
      where: { id: passageId },
    });
    if (!passage) throw new NotFoundException('Passage not found');

    if (dto.orderIndex !== undefined) passage.orderIndex = dto.orderIndex;
    if (dto.title !== undefined) passage.title = dto.title;
    if (dto.content !== undefined) {
      passage.content = dto.content;
      passage.wordCount = dto.content.split(/\s+/).filter(Boolean).length;
    }

    return this.passageRepo.save(passage);
  }

  async deletePassage(passageId: string) {
    const result = await this.passageRepo.delete({ id: passageId });
    if (!result.affected) throw new NotFoundException('Passage not found');
  }

  // --- Sections (listening) -------------------------------------------------

  async addSection(testId: string, dto: CreateSectionDto) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.LISTENING },
    });
    if (!test) throw new NotFoundException('Listening test not found');

    return this.sectionRepo.save(
      this.sectionRepo.create({
        testId,
        orderIndex: dto.orderIndex,
        title: dto.title,
        audioUrl: '',
        durationSeconds: 0,
      }),
    );
  }

  async updateSection(sectionId: string, dto: UpdateSectionDto) {
    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
    });
    if (!section) throw new NotFoundException('Section not found');

    if (dto.orderIndex !== undefined) section.orderIndex = dto.orderIndex;
    if (dto.title !== undefined) section.title = dto.title;

    return this.sectionRepo.save(section);
  }

  async deleteSection(sectionId: string) {
    const result = await this.sectionRepo.delete({ id: sectionId });
    if (!result.affected) throw new NotFoundException('Section not found');
  }

  // --- Questions (shared by reading & listening) ----------------------------

  async addReadingQuestion(testId: string, dto: UpsertQuestionDto) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.READING },
    });
    if (!test) throw new NotFoundException('Reading test not found');
    if (!dto.passageId)
      throw new BadRequestException(
        'passageId is required for a reading question',
      );

    return this.questionRepo.save(
      this.questionRepo.create({
        testId,
        passageId: dto.passageId,
        orderIndex: dto.orderIndex,
        type: dto.type,
        promptText: dto.promptText,
        options: dto.options ?? null,
        correctAnswer: dto.correctAnswer,
        points: dto.points ?? 1,
        explanation: dto.explanation,
      }),
    );
  }

  async addListeningQuestion(testId: string, dto: UpsertQuestionDto) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.LISTENING },
    });
    if (!test) throw new NotFoundException('Listening test not found');
    if (!dto.sectionId)
      throw new BadRequestException(
        'sectionId is required for a listening question',
      );

    return this.questionRepo.save(
      this.questionRepo.create({
        testId,
        sectionId: dto.sectionId,
        orderIndex: dto.orderIndex,
        type: dto.type,
        promptText: dto.promptText,
        options: dto.options ?? null,
        correctAnswer: dto.correctAnswer,
        points: dto.points ?? 1,
        explanation: dto.explanation,
      }),
    );
  }

  async updateQuestion(questionId: string, dto: UpsertQuestionDto) {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    question.orderIndex = dto.orderIndex;
    question.type = dto.type;
    question.promptText = dto.promptText;
    question.options = dto.options ?? null;
    question.correctAnswer = dto.correctAnswer;
    question.points = dto.points ?? question.points;
    if (dto.explanation !== undefined) question.explanation = dto.explanation;
    if (dto.passageId !== undefined) question.passageId = dto.passageId;
    if (dto.sectionId !== undefined) question.sectionId = dto.sectionId;

    return this.questionRepo.save(question);
  }

  async deleteQuestion(questionId: string) {
    const result = await this.questionRepo.delete({ id: questionId });
    if (!result.affected) throw new NotFoundException('Question not found');
  }
}
