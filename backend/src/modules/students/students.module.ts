import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile])],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
