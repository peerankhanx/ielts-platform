import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Book, BookCategory, BookLevel } from './entities/book.entity';
import { BookProgress } from './entities/book-progress.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @InjectRepository(BookProgress)
    private readonly progressRepo: Repository<BookProgress>,
  ) {}

  async listBooks(filters: {
    category?: BookCategory;
    level?: BookLevel;
    search?: string;
  }) {
    const qb = this.bookRepo
      .createQueryBuilder('book')
      .where('book.isPublished = true');

    if (filters.category) {
      qb.andWhere('book.category = :category', { category: filters.category });
    }
    if (filters.level) {
      qb.andWhere('book.level = :level', { level: filters.level });
    }
    if (filters.search) {
      qb.andWhere('(book.title ILIKE :search OR book.author ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    return qb.orderBy('book.createdAt', 'DESC').getMany();
  }

  async getBook(bookId: string) {
    const book = await this.bookRepo.findOne({
      where: { id: bookId, isPublished: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async getMyProgress(userId: string, bookId: string) {
    return this.progressRepo.findOne({ where: { userId, bookId } });
  }

  async listFavorites(userId: string) {
    const progress = await this.progressRepo.find({
      where: { userId, isFavorite: true },
      relations: { book: true },
    });
    return progress.map((p) => p.book);
  }

  async listInProgress(userId: string) {
    const progress = await this.progressRepo.find({
      where: { userId, isCompleted: false },
      relations: { book: true },
      order: { updatedAt: 'DESC' },
    });
    return progress
      .filter((p) => p.lastPageRead > 0)
      .map((p) => ({ book: p.book, lastPageRead: p.lastPageRead }));
  }

  async updateProgress(
    userId: string,
    bookId: string,
    data: { lastPageRead?: number; isCompleted?: boolean },
  ) {
    await this.getBook(bookId); // validates existence + published

    let progress = await this.progressRepo.findOne({
      where: { userId, bookId },
    });
    if (!progress) {
      progress = this.progressRepo.create({ userId, bookId });
    }

    if (data.lastPageRead !== undefined)
      progress.lastPageRead = data.lastPageRead;
    if (data.isCompleted !== undefined) progress.isCompleted = data.isCompleted;

    await this.progressRepo.save(progress);
    return progress;
  }

  async toggleFavorite(userId: string, bookId: string) {
    await this.getBook(bookId);

    let progress = await this.progressRepo.findOne({
      where: { userId, bookId },
    });
    if (!progress) {
      progress = this.progressRepo.create({ userId, bookId, isFavorite: true });
    } else {
      progress.isFavorite = !progress.isFavorite;
    }

    await this.progressRepo.save(progress);
    return { bookId, isFavorite: progress.isFavorite };
  }
}
