import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComments1777510000000 implements MigrationInterface {
  name = 'CreateComments1777510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "userId" uuid NOT NULL, "postId" integer NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_postId" ON "comment" ("postId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_comment_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_comment_postId" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_postId"`);
    await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_comment_postId"`);
    await queryRunner.query(`DROP TABLE "comment"`);
  }
}
