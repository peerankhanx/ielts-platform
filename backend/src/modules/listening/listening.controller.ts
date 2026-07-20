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
import { ListeningService } from './listening.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('listening')
@UseGuards(JwtAuthGuard)
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get('tests')
  async listTests() {
    const tests = await this.listeningService.listTests();
    return { success: true, data: tests };
  }

  @Get('tests/:testId')
  async getTest(@Param('testId', ParseUUIDPipe) testId: string) {
    const test = await this.listeningService.getTestForTaking(testId);
    return { success: true, data: test };
  }

  @Post('tests/:testId/attempts')
  async startAttempt(
    @Param('testId', ParseUUIDPipe) testId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const attempt = await this.listeningService.startAttempt(user.sub, testId);
    return { success: true, data: attempt };
  }

  @Patch('attempts/:attemptId/answers')
  async saveAnswer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SaveAnswerDto,
  ) {
    const result = await this.listeningService.saveAnswer(
      attemptId,
      user.sub,
      dto.questionId,
      dto.responseValue,
    );
    return { success: true, data: result };
  }

  @Post('attempts/:attemptId/submit')
  async submitAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.listeningService.submitAttempt(
      attemptId,
      user.sub,
    );
    return { success: true, data: result };
  }

  @Get('attempts/:attemptId')
  async getAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.listeningService.getResult(attemptId, user.sub);
    return { success: true, data: result };
  }
}
