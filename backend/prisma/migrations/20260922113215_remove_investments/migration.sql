-- DropForeignKey
ALTER TABLE "investments" DROP CONSTRAINT "investments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_investment_id_fkey";

-- DropIndex
DROP INDEX "transactions_investment_id_idx";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "investment_id";

-- DropTable
DROP TABLE "investments";

