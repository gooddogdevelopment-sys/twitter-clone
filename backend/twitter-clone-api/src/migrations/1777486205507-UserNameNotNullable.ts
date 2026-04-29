import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserNameNotNullable1777486205507 implements MigrationInterface {
  name = 'UserNameNotNullable1777486205507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "username" DROP NOT NULL`,
    );
  }
}
