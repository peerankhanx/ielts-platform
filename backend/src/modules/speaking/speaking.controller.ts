import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeakingService } from './speaking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB — generous for a 2-minute recording

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  @Get('tasks')
  async listTasks() {
    const tasks = await this.speakingService.listTasks();
    return { success: true, data: tasks };
  }

  @Get('tasks/:taskId')
  async getTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    const task = await this.speakingService.getTask(taskId);
    return { success: true, data: task };
  }

  @Post('tasks/:taskId/submissions')
  async startSubmission(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const submission = await this.speakingService.startSubmission(
      user.sub,
      taskId,
    );
    return { success: true, data: submission };
  }

  @Post('submissions/:submissionId/parts/:partId/audio')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async uploadResponse(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Param('partId', ParseUUIDPipe) partId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No audio file was uploaded');

    const result = await this.speakingService.uploadResponse(
      submissionId,
      user.sub,
      partId,
      {
        buffer: file.buffer,
        originalname: file.originalname,
      },
    );
    return { success: true, data: result };
  }

  @Post('submissions/:submissionId/submit')
  async submit(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.speakingService.submit(submissionId, user.sub);
    return { success: true, data: result };
  }

  @Get('submissions/:submissionId')
  async getSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.speakingService.getSubmission(
      submissionId,
      user.sub,
    );
    return { success: true, data: result };
  }
}
