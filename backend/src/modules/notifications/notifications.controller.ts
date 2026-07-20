import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.notificationsService.list(user.sub, page, limit);
    return { success: true, data: result };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: JwtPayload) {
    const result = await this.notificationsService.unreadCount(user.sub);
    return { success: true, data: result };
  }

  @Patch(':notificationId/read')
  async markRead(
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.notificationsService.markRead(
      user.sub,
      notificationId,
    );
    return { success: true, data: result };
  }

  @Post('read-all')
  async markAllRead(@CurrentUser() user: JwtPayload) {
    const result = await this.notificationsService.markAllRead(user.sub);
    return { success: true, data: result };
  }
}
