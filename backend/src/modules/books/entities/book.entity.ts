import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum BookCategory {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  READING = 'reading',
  WRITING = 'writing',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  GENERAL = 'general',
}

export enum BookLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('books')
export class Book extends BaseEntity {
  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: BookCategory })
  category: BookCategory;

  @Column({ type: 'enum', enum: BookLevel })
  level: BookLevel;

  @Column({ name: 'page_count', default: 0 })
  pageCount: number;

  // Served by GET /media/books/... (same static mount as listening/speaking).
  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;
}
