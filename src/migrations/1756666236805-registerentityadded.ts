import { MigrationInterface, QueryRunner } from "typeorm";

export class Registerentityadded1756666236805 implements MigrationInterface {
    name = 'Registerentityadded1756666236805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "gender" character varying, "phoneNumber" character varying, "img" character varying, "role" character varying NOT NULL DEFAULT 'admin', "resetToken" character varying, "resetTokenExpires" TIMESTAMP, "isVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admins"`);
    }

}
