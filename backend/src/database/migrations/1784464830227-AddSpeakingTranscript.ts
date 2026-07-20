import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpeakingTranscript1784464830227 implements MigrationInterface {
  name = 'AddSpeakingTranscript1784464830227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" ADD "transcript" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" DROP COLUMN "transcript"`,
    );
  }
}
