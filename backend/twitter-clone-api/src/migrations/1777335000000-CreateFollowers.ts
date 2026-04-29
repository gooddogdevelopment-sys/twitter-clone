import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowers1777335000000 implements MigrationInterface {
  name = 'CreateFollowers1777335000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "follower" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "followerUserId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follower_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "follower"
        ADD CONSTRAINT "FK_follower_userId"
        FOREIGN KEY ("userId")
        REFERENCES "user"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "follower"
        ADD CONSTRAINT "FK_follower_followerUserId"
        FOREIGN KEY ("followerUserId")
        REFERENCES "user"("id")
        ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "follower" DROP CONSTRAINT "FK_follower_followerUserId"`);
    await queryRunner.query(`ALTER TABLE "follower" DROP CONSTRAINT "FK_follower_userId"`);
    await queryRunner.query(`DROP TABLE "follower"`);
  }
}
