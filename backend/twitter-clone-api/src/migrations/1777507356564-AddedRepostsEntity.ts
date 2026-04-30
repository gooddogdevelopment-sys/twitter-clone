import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedRepostsEntity1777507356564 implements MigrationInterface {
  name = 'AddedRepostsEntity1777507356564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reposts" ("id" SERIAL NOT NULL, "userId" uuid NOT NULL, "postId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7bf48d7d83b681bb3cbf44f62b8" UNIQUE ("userId", "postId"), CONSTRAINT "PK_52695faa15b7c703f8660581f81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_547e95c4a7ff1ec4a3715eec07" ON "reposts" ("postId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reposts" ADD CONSTRAINT "FK_d8f973ec285886ab4331780d4c6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reposts" ADD CONSTRAINT "FK_547e95c4a7ff1ec4a3715eec071" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reposts" DROP CONSTRAINT "FK_547e95c4a7ff1ec4a3715eec071"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reposts" DROP CONSTRAINT "FK_d8f973ec285886ab4331780d4c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_547e95c4a7ff1ec4a3715eec07"`,
    );
    await queryRunner.query(`DROP TABLE "reposts"`);
  }
}
