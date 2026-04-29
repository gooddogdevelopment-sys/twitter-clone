import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNameToUser1777486086099 implements MigrationInterface {
  name = 'AddUserNameToUser1777486086099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follower" DROP CONSTRAINT "FK_follower_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follower" DROP CONSTRAINT "FK_follower_followerUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "follower" ADD CONSTRAINT "FK_6fe328c3c08b70a5c9c79348839" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follower" ADD CONSTRAINT "FK_2ee88721db5ec1806561b09a444" FOREIGN KEY ("followerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follower" DROP CONSTRAINT "FK_2ee88721db5ec1806561b09a444"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follower" DROP CONSTRAINT "FK_6fe328c3c08b70a5c9c79348839"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "follower" ADD CONSTRAINT "FK_follower_followerUserId" FOREIGN KEY ("followerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follower" ADD CONSTRAINT "FK_follower_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
