import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WritingService } from './writing.service';
import { UpdateEssayDto } from './dto/update-essay.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('writing')
@UseGuards(JwtAuthGuard)
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  @Get('tasks')
  async listTasks() {
    const tasks = await this.writingService.listTasks();
    return { success: true, data: tasks };
  }

  @Get('tasks/:taskId')
  async getTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    const task = await this.writingService.getTask(taskId);
    return { success: true, data: task };
  }

  @Post('tasks/:taskId/submissions')
  async startSubmission(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const submission = await this.writingService.startSubmission(
      user.sub,
      taskId,
    );
    return { success: true, data: submission };
  }

  @Patch('submissions/:submissionId')
  async updateEssay(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateEssayDto,
  ) {
    const result = await this.writingService.updateEssay(
      submissionId,
      user.sub,
      dto.essayText,
    );
    return { success: true, data: result };
  }

  @Post('submissions/:submissionId/submit')
  async submit(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.writingService.submit(submissionId, user.sub);
    return { success: true, data: result };
  }

  @Get('submissions/:submissionId')
  async getSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.writingService.getSubmission(
      submissionId,
      user.sub,
    );
    return { success: true, data: result };
  }
}
