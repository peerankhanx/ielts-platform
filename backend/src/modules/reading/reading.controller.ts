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
import { ReadingService } from './reading.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get('tests')
  async listTests() {
    const tests = await this.readingService.listTests();
    return { success: true, data: tests };
  }

  @Get('tests/:testId')
  async getTest(@Param('testId', ParseUUIDPipe) testId: string) {
    const test = await this.readingService.getTestForTaking(testId);
    return { success: true, data: test };
  }

  @Post('tests/:testId/attempts')
  async startAttempt(
    @Param('testId', ParseUUIDPipe) testId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const attempt = await this.readingService.startAttempt(user.sub, testId);
    return { success: true, data: attempt };
  }

  @Patch('attempts/:attemptId/answers')
  async saveAnswer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SaveAnswerDto,
  ) {
    const result = await this.readingService.saveAnswer(
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
    const result = await this.readingService.submitAttempt(attemptId, user.sub);
    return { success: true, data: result };
  }

  @Get('attempts/:attemptId')
  async getAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.readingService.getResult(attemptId, user.sub);
    return { success: true, data: result };
  }
}
