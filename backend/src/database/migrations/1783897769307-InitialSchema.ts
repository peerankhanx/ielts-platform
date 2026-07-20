import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783897769307 implements MigrationInterface {
  name = 'InitialSchema1783897769307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying, "action" character varying NOT NULL, "module" character varying, "ip_address" character varying, "user_agent" text, "metadata" jsonb, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."roles_name_enum" AS ENUM('student', 'admin', 'super_admin', 'content_manager', 'support_staff')`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" "public"."roles_name_enum" NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_profiles_preferred_test_type_enum" AS ENUM('academic', 'general')`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "country" character varying, "target_band" numeric(2,1) NOT NULL DEFAULT '7', "current_band" numeric(2,1) NOT NULL DEFAULT '0', "study_goal" text, "preferred_test_type" "public"."student_profiles_preferred_test_type_enum" NOT NULL DEFAULT 'academic', "bio" text, "exam_date" date, CONSTRAINT "UQ_cef016a0d95e26ae7c0f167ec28" UNIQUE ("user_id"), CONSTRAINT "REL_cef016a0d95e26ae7c0f167ec2" UNIQUE ("user_id"), CONSTRAINT "PK_5ed0a32eeaddfe812fb326177d0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "phone" character varying, "avatar_url" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending', "email_verified" boolean NOT NULL DEFAULT false, "last_login" TIMESTAMP WITH TIME ZONE, "role_id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "device_label" character varying, "ip_address" character varying, "user_agent" text, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens"  ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "email_verification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c20ed35f3d31d486aabcd0564d" ON "email_verification_tokens"  ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_91185d86d5d7557b19abbb2868" ON "password_reset_tokens"  ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."books_category_enum" AS ENUM('grammar', 'vocabulary', 'reading', 'writing', 'listening', 'speaking', 'general')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."books_level_enum" AS ENUM('beginner', 'intermediate', 'advanced')`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "author" character varying NOT NULL, "description" text NOT NULL, "category" "public"."books_category_enum" NOT NULL, "level" "public"."books_level_enum" NOT NULL, "page_count" integer NOT NULL DEFAULT '0', "file_url" character varying NOT NULL, "is_published" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "book_id" uuid NOT NULL, "last_page_read" integer NOT NULL DEFAULT '0', "is_favorite" boolean NOT NULL DEFAULT false, "is_completed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3c94dde283eb733098c6b174265" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5d73b0f2393eb786f047cd9e74" ON "book_progress"  ("user_id", "book_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tests_module_type_enum" AS ENUM('reading', 'listening', 'writing', 'speaking', 'full_mock')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tests_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" text, "module_type" "public"."tests_module_type_enum" NOT NULL, "difficulty" "public"."tests_difficulty_enum" NOT NULL DEFAULT 'medium', "time_limit_minutes" integer NOT NULL DEFAULT '60', "is_published" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reading_passages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "test_id" uuid NOT NULL, "order_index" integer NOT NULL DEFAULT '1', "title" character varying NOT NULL, "content" text NOT NULL, "word_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_512427c6f46cfa4d93caefde6e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."questions_type_enum" AS ENUM('multiple_choice', 'true_false_not_given', 'short_answer', 'matching_heading')`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "test_id" uuid NOT NULL, "passage_id" uuid, "section_id" uuid, "order_index" integer NOT NULL DEFAULT '1', "type" "public"."questions_type_enum" NOT NULL, "prompt_text" text NOT NULL, "options" jsonb, "correct_answer" jsonb NOT NULL, "points" integer NOT NULL DEFAULT '1', "explanation" text, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listening_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "test_id" uuid NOT NULL, "order_index" integer NOT NULL DEFAULT '1', "title" character varying NOT NULL, "audio_url" character varying NOT NULL, "duration_seconds" integer NOT NULL DEFAULT '0', "transcript" text, CONSTRAINT "PK_823b674797f2ec96770f6f3a5c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('ai_evaluation', 'subscription', 'test', 'achievement', 'reminder', 'payment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."test_attempts_status_enum" AS ENUM('in_progress', 'completed', 'abandoned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "test_id" uuid NOT NULL, "status" "public"."test_attempts_status_enum" NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "submitted_at" TIMESTAMP WITH TIME ZONE, "raw_score" integer, "total_questions" integer NOT NULL DEFAULT '0', "band_score" numeric(2,1), CONSTRAINT "PK_d40272f8162c607f12e76c0a18e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "attempt_id" uuid NOT NULL, "question_id" uuid NOT NULL, "response_value" jsonb, "is_correct" boolean, "points_awarded" integer, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ebd9dfcd875dfe84b76b321def" ON "answers"  ("attempt_id", "question_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "speaking_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "task_id" uuid NOT NULL, "part_number" integer NOT NULL, "prompt_text" text NOT NULL, "cue_card_points" jsonb, "prep_time_seconds" integer NOT NULL DEFAULT '0', "speak_time_seconds" integer NOT NULL, CONSTRAINT "PK_72f79ca40309dd0c26427caeccf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "speaking_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" text, "is_published" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_af8fd66a25ba7b128642d9012aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "speaking_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "submission_id" uuid NOT NULL, "part_id" uuid NOT NULL, "audio_url" character varying NOT NULL, "duration_seconds" double precision NOT NULL DEFAULT '0', "silence_seconds" double precision NOT NULL DEFAULT '0', "pause_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_90d56419d4a01f95ed334be7d17" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_39f837a95355d47bacd9351f7d" ON "speaking_responses"  ("submission_id", "part_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."speaking_submissions_status_enum" AS ENUM('in_progress', 'evaluating', 'evaluated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "speaking_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "task_id" uuid NOT NULL, "status" "public"."speaking_submissions_status_enum" NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "submitted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6dabf6b922d5a4f78120a348c30" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "speaking_evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "submission_id" uuid NOT NULL, "fluency_coherence" numeric(2,1), "lexical_resource" numeric(2,1), "grammatical_range" numeric(2,1), "pronunciation" numeric(2,1), "overall_band" numeric(2,1), "feedback" jsonb NOT NULL, "evaluator" character varying NOT NULL DEFAULT 'audio-heuristic', CONSTRAINT "UQ_3bee2e9ec37df06faf086395dfd" UNIQUE ("submission_id"), CONSTRAINT "REL_3bee2e9ec37df06faf086395df" UNIQUE ("submission_id"), CONSTRAINT "PK_9854f6b5507d5a8fba924904f9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "duration_days" integer NOT NULL, "max_tests" integer, "ai_access" boolean NOT NULL DEFAULT true, "features" jsonb NOT NULL DEFAULT '[]', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "provider" character varying NOT NULL, "provider_payment_id" character varying NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9670987a405c3f3a93b3ac08a4" ON "payments"  ("provider_payment_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "auto_renew" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."writing_tasks_task_type_enum" AS ENUM('task_1', 'task_2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "writing_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "task_type" "public"."writing_tasks_task_type_enum" NOT NULL, "prompt_text" text NOT NULL, "image_url" character varying, "min_words" integer NOT NULL, "time_limit_minutes" integer NOT NULL, "is_published" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8ee5755c86e687f69c4adf6fcd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."writing_submissions_status_enum" AS ENUM('in_progress', 'evaluating', 'evaluated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "writing_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "task_id" uuid NOT NULL, "essay_text" text NOT NULL DEFAULT '', "word_count" integer NOT NULL DEFAULT '0', "status" "public"."writing_submissions_status_enum" NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "submitted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9b25206ddee833d73f7bbafffc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "writing_evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "submission_id" uuid NOT NULL, "task_achievement" numeric(2,1) NOT NULL, "coherence_cohesion" numeric(2,1) NOT NULL, "lexical_resource" numeric(2,1) NOT NULL, "grammatical_range" numeric(2,1) NOT NULL, "overall_band" numeric(2,1) NOT NULL, "feedback" jsonb NOT NULL, "evaluator" character varying NOT NULL DEFAULT 'heuristic', CONSTRAINT "UQ_a07df8f066183ed9afa42f92c52" UNIQUE ("submission_id"), CONSTRAINT "REL_a07df8f066183ed9afa42f92c5" UNIQUE ("submission_id"), CONSTRAINT "PK_ba9a3a1c76b41e18eacaee1608e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "FK_fdcb77f72f529bf65c95d72a147" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_progress" ADD CONSTRAINT "FK_ce2805f0f280b98b94be415d883" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_progress" ADD CONSTRAINT "FK_60ded174f34f36351e36d6c7251" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_passages" ADD CONSTRAINT "FK_667afd962cb1d53292e19f514bd" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_b1f107600ed9ed81aba56edfcea" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_71de478c6bb3635a98680f68037" FOREIGN KEY ("passage_id") REFERENCES "reading_passages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_f358a1c801460a4a10b72169b8c" FOREIGN KEY ("section_id") REFERENCES "listening_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listening_sections" ADD CONSTRAINT "FK_5c7f938e9299ac9ef6f6fc99520" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_e600c136cef60f166f0b315ab19" FOREIGN KEY ("attempt_id") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_parts" ADD CONSTRAINT "FK_ce7e4469ab279d5a459f9ced646" FOREIGN KEY ("task_id") REFERENCES "speaking_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" ADD CONSTRAINT "FK_77688431be4aa38a258299687f0" FOREIGN KEY ("submission_id") REFERENCES "speaking_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" ADD CONSTRAINT "FK_7355fc84b36cd75604bfb869e3c" FOREIGN KEY ("part_id") REFERENCES "speaking_parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_submissions" ADD CONSTRAINT "FK_a13f917b41e9f555ff0c03bd506" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_submissions" ADD CONSTRAINT "FK_eef80fee55efb8578ed20caf201" FOREIGN KEY ("task_id") REFERENCES "speaking_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_evaluations" ADD CONSTRAINT "FK_3bee2e9ec37df06faf086395dfd" FOREIGN KEY ("submission_id") REFERENCES "speaking_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_f9b6a4c3196864cdd91b1a440ee" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing_submissions" ADD CONSTRAINT "FK_e37954575d9595bab879c714788" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing_submissions" ADD CONSTRAINT "FK_600de5b1795dbe982bedacd2c2f" FOREIGN KEY ("task_id") REFERENCES "writing_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing_evaluations" ADD CONSTRAINT "FK_a07df8f066183ed9afa42f92c52" FOREIGN KEY ("submission_id") REFERENCES "writing_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "writing_evaluations" DROP CONSTRAINT "FK_a07df8f066183ed9afa42f92c52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing_submissions" DROP CONSTRAINT "FK_600de5b1795dbe982bedacd2c2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing_submissions" DROP CONSTRAINT "FK_e37954575d9595bab879c714788"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_f9b6a4c3196864cdd91b1a440ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_evaluations" DROP CONSTRAINT "FK_3bee2e9ec37df06faf086395dfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_submissions" DROP CONSTRAINT "FK_eef80fee55efb8578ed20caf201"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_submissions" DROP CONSTRAINT "FK_a13f917b41e9f555ff0c03bd506"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" DROP CONSTRAINT "FK_7355fc84b36cd75604bfb869e3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_responses" DROP CONSTRAINT "FK_77688431be4aa38a258299687f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "speaking_parts" DROP CONSTRAINT "FK_ce7e4469ab279d5a459f9ced646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_e600c136cef60f166f0b315ab19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listening_sections" DROP CONSTRAINT "FK_5c7f938e9299ac9ef6f6fc99520"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_f358a1c801460a4a10b72169b8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_71de478c6bb3635a98680f68037"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_b1f107600ed9ed81aba56edfcea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_passages" DROP CONSTRAINT "FK_667afd962cb1d53292e19f514bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_progress" DROP CONSTRAINT "FK_60ded174f34f36351e36d6c7251"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_progress" DROP CONSTRAINT "FK_ce2805f0f280b98b94be415d883"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "FK_fdcb77f72f529bf65c95d72a147"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28"`,
    );
    await queryRunner.query(`DROP TABLE "writing_evaluations"`);
    await queryRunner.query(`DROP TABLE "writing_submissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."writing_submissions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "writing_tasks"`);
    await queryRunner.query(
      `DROP TYPE "public"."writing_tasks_task_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9670987a405c3f3a93b3ac08a4"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(`DROP TABLE "speaking_evaluations"`);
    await queryRunner.query(`DROP TABLE "speaking_submissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."speaking_submissions_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_39f837a95355d47bacd9351f7d"`,
    );
    await queryRunner.query(`DROP TABLE "speaking_responses"`);
    await queryRunner.query(`DROP TABLE "speaking_tasks"`);
    await queryRunner.query(`DROP TABLE "speaking_parts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ebd9dfcd875dfe84b76b321def"`,
    );
    await queryRunner.query(`DROP TABLE "answers"`);
    await queryRunner.query(`DROP TABLE "test_attempts"`);
    await queryRunner.query(`DROP TYPE "public"."test_attempts_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "listening_sections"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
    await queryRunner.query(`DROP TABLE "reading_passages"`);
    await queryRunner.query(`DROP TABLE "tests"`);
    await queryRunner.query(`DROP TYPE "public"."tests_difficulty_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tests_module_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d73b0f2393eb786f047cd9e74"`,
    );
    await queryRunner.query(`DROP TABLE "book_progress"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TYPE "public"."books_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."books_category_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_91185d86d5d7557b19abbb2868"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c20ed35f3d31d486aabcd0564d"`,
    );
    await queryRunner.query(`DROP TABLE "email_verification_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TABLE "student_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."student_profiles_preferred_test_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd2726fd31b35443f2245b93ba"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
