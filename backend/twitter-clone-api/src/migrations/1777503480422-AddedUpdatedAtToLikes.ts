import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedUpdatedAtToLikes1777503480422 implements MigrationInterface {
  name = 'AddedUpdatedAtToLikes1777503480422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "UQ_likes_userId_postId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe"`,
    );
    await queryRunner.query(`ALTER TABLE "likes" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "UQ_likes_userId_postId" UNIQUE ("userId", "postId")`,
    );
  }
}
