import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1745784000000 implements MigrationInterface {
  name = 'CreateUsers1745784000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clerkId" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_clerkId" UNIQUE ("clerkId"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
