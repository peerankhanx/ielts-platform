import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Called by other modules after real events (a writing evaluation
   * completing, a payment succeeding, etc.) — there is no public "create"
   * endpoint; notifications are always system-generated from something
   * that actually happened.
   */
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ) {
    return this.notificationRepo.save(
      this.notificationRepo.create({ userId, type, title, message }),
    );
  }

  async list(userId: string, page: number, limit: number) {
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId)
      throw new ForbiddenException('This notification does not belong to you');

    notification.isRead = true;
    await this.notificationRepo.save(notification);
    return notification;
  }

  async markAllRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
