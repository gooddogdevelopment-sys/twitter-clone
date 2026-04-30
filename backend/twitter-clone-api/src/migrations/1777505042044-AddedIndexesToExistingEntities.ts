import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedIndexesToExistingEntities1777505042044 implements MigrationInterface {
  name = 'AddedIndexesToExistingEntities1777505042044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c1cf55c308037b5aca1038a13" ON "post" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fe328c3c08b70a5c9c7934883" ON "follower" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ee88721db5ec1806561b09a44" ON "follower" ("followerUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59318cd1fa4b0f8fdea9232d04" ON "user" ("clerkId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_59318cd1fa4b0f8fdea9232d04"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ee88721db5ec1806561b09a44"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6fe328c3c08b70a5c9c7934883"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c1cf55c308037b5aca1038a13"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2fe567ad8d305fefc918d44f5"`,
    );
  }
}
