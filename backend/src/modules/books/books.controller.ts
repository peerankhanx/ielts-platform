import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { BookCategory, BookLevel } from './entities/book.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('library')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('books')
  async listBooks(
    @Query('category') category?: BookCategory,
    @Query('level') level?: BookLevel,
    @Query('search') search?: string,
  ) {
    const books = await this.booksService.listBooks({
      category,
      level,
      search,
    });
    return { success: true, data: books };
  }

  @Get('books/:bookId')
  async getBook(@Param('bookId', ParseUUIDPipe) bookId: string) {
    const book = await this.booksService.getBook(bookId);
    return { success: true, data: book };
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async listFavorites(@CurrentUser() user: JwtPayload) {
    const books = await this.booksService.listFavorites(user.sub);
    return { success: true, data: books };
  }

  @Get('in-progress')
  @UseGuards(JwtAuthGuard)
  async listInProgress(@CurrentUser() user: JwtPayload) {
    const items = await this.booksService.listInProgress(user.sub);
    return { success: true, data: items };
  }

  @Get('books/:bookId/progress')
  @UseGuards(JwtAuthGuard)
  async getMyProgress(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const progress = await this.booksService.getMyProgress(user.sub, bookId);
    return { success: true, data: progress };
  }

  @Patch('books/:bookId/progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProgressDto,
  ) {
    const progress = await this.booksService.updateProgress(
      user.sub,
      bookId,
      dto,
    );
    return { success: true, data: progress };
  }

  @Post('books/:bookId/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.booksService.toggleFavorite(user.sub, bookId);
    return { success: true, data: result };
  }
}
