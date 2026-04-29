import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToLikes1777494300000 implements MigrationInterface {
  name = 'AddIsActiveToLikes1777494300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "UQ_likes_userId_postId" UNIQUE ("userId", "postId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "UQ_likes_userId_postId"`,
    );
    await queryRunner.query(`ALTER TABLE "likes" DROP COLUMN "isActive"`);
  }
}
