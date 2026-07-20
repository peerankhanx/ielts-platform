import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

import { ContentAdminService } from './content-admin.service';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleName } from '../../users/entities/role.entity';

const AUDIO_DIR = join(__dirname, '..', '..', '..', '..', 'uploads', 'audio');
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
export class ContentAdminController {
  constructor(private readonly contentAdminService: ContentAdminService) {}

  // --- Reading -----------------------------------------------------------

  @Get('reading-tests')
  async listReadingTests() {
    const tests = await this.contentAdminService.listReadingTests();
    return { success: true, data: tests };
  }

  @Post('reading-tests')
  async createReadingTest(@Body() dto: CreateReadingTestDto) {
    const test = await this.contentAdminService.createReadingTest(dto);
    return { success: true, data: test };
  }

  // --- Listening -----------------------------------------------------------

  @Get('listening-tests')
  async listListeningTests() {
    const tests = await this.contentAdminService.listListeningTests();
    return { success: true, data: tests };
  }

  @Post('listening-tests')
  async createListeningTest(@Body() dto: CreateListeningTestDto) {
    const result = await this.contentAdminService.createListeningTest(dto);
    return { success: true, data: result };
  }

  @Post('listening-sections/:sectionId/audio')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async uploadSectionAudio(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No audio file was uploaded');

    mkdirSync(AUDIO_DIR, { recursive: true });
    const ext = extname(file.originalname) || '.mp3';
    const filename = `section-${sectionId}-${randomUUID()}${ext}`;
    const filePath = join(AUDIO_DIR, filename);
    writeFileSync(filePath, file.buffer);

    const durationOutput = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
    ).toString();
    const durationSeconds = Math.round(parseFloat(durationOutput) || 0);

    const audioUrl = `/media/audio/${filename}`;
    const section = await this.contentAdminService.setSectionAudio(
      sectionId,
      audioUrl,
      durationSeconds,
    );
    return { success: true, data: section };
  }

  // --- Writing -----------------------------------------------------------

  @Get('writing-tasks')
  async listWritingTasks() {
    const tasks = await this.contentAdminService.listWritingTasks();
    return { success: true, data: tasks };
  }

  @Post('writing-tasks')
  async createWritingTask(@Body() dto: CreateWritingTaskDto) {
    const task = await this.contentAdminService.createWritingTask(dto);
    return { success: true, data: task };
  }

  @Patch('writing-tasks/:taskId/publish')
  async toggleWritingTaskPublish(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    const task = await this.contentAdminService.toggleWritingTaskPublish(
      taskId,
      isPublished,
    );
    return { success: true, data: task };
  }

  @Delete('writing-tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWritingTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    await this.contentAdminService.deleteWritingTask(taskId);
  }

  // --- Speaking -----------------------------------------------------------

  @Get('speaking-tasks')
  async listSpeakingTasks() {
    const tasks = await this.contentAdminService.listSpeakingTasks();
    return { success: true, data: tasks };
  }

  @Post('speaking-tasks')
  async createSpeakingTask(@Body() dto: CreateSpeakingTaskDto) {
    const task = await this.contentAdminService.createSpeakingTask(dto);
    return { success: true, data: task };
  }

  @Patch('speaking-tasks/:taskId/publish')
  async toggleSpeakingTaskPublish(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    const task = await this.contentAdminService.toggleSpeakingTaskPublish(
      taskId,
      isPublished,
    );
    return { success: true, data: task };
  }

  @Delete('speaking-tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpeakingTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    await this.contentAdminService.deleteSpeakingTask(taskId);
  }

  // --- Shared (reading/listening tests) -----------------------------------

  @Patch('tests/:testId')
  async updateTestMeta(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body() dto: UpdateTestMetaDto,
  ) {
    const test = await this.contentAdminService.updateTestMeta(testId, dto);
    return { success: true, data: test };
  }

  @Patch('tests/:testId/publish')
  async toggleTestPublish(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    const test = await this.contentAdminService.toggleTestPublish(
      testId,
      isPublished,
    );
    return { success: true, data: test };
  }

  @Delete('tests/:testId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTest(@Param('testId', ParseUUIDPipe) testId: string) {
    await this.contentAdminService.deleteTest(testId);
  }

  // --- Full detail (for the edit UI) --------------------------------------

  @Get('reading-tests/:testId/full')
  async getReadingTestFull(@Param('testId', ParseUUIDPipe) testId: string) {
    const result = await this.contentAdminService.getReadingTestFull(testId);
    return { success: true, data: result };
  }

  @Get('listening-tests/:testId/full')
  async getListeningTestFull(@Param('testId', ParseUUIDPipe) testId: string) {
    const result = await this.contentAdminService.getListeningTestFull(testId);
    return { success: true, data: result };
  }

  // --- Passages (reading) --------------------------------------------------

  @Post('reading-tests/:testId/passages')
  async addPassage(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body() dto: CreatePassageDto,
  ) {
    const passage = await this.contentAdminService.addPassage(testId, dto);
    return { success: true, data: passage };
  }

  @Patch('passages/:passageId')
  async updatePassage(
    @Param('passageId', ParseUUIDPipe) passageId: string,
    @Body() dto: UpdatePassageDto,
  ) {
    const passage = await this.contentAdminService.updatePassage(
      passageId,
      dto,
    );
    return { success: true, data: passage };
  }

  @Delete('passages/:passageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePassage(@Param('passageId', ParseUUIDPipe) passageId: string) {
    await this.contentAdminService.deletePassage(passageId);
  }

  // --- Sections (listening) -------------------------------------------------

  @Post('listening-tests/:testId/sections')
  async addSection(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body() dto: CreateSectionDto,
  ) {
    const section = await this.contentAdminService.addSection(testId, dto);
    return { success: true, data: section };
  }

  @Patch('sections/:sectionId')
  async updateSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    const section = await this.contentAdminService.updateSection(
      sectionId,
      dto,
    );
    return { success: true, data: section };
  }

  @Delete('sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSection(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    await this.contentAdminService.deleteSection(sectionId);
  }

  // --- Questions -------------------------------------------------------------

  @Post('reading-tests/:testId/questions')
  async addReadingQuestion(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body() dto: UpsertQuestionDto,
  ) {
    const question = await this.contentAdminService.addReadingQuestion(
      testId,
      dto,
    );
    return { success: true, data: question };
  }

  @Post('listening-tests/:testId/questions')
  async addListeningQuestion(
    @Param('testId', ParseUUIDPipe) testId: string,
    @Body() dto: UpsertQuestionDto,
  ) {
    const question = await this.contentAdminService.addListeningQuestion(
      testId,
      dto,
    );
    return { success: true, data: question };
  }

  @Patch('questions/:questionId')
  async updateQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: UpsertQuestionDto,
  ) {
    const question = await this.contentAdminService.updateQuestion(
      questionId,
      dto,
    );
    return { success: true, data: question };
  }

  @Delete('questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    await this.contentAdminService.deleteQuestion(questionId);
  }
}
