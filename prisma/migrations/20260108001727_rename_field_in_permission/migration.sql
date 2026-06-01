/*
  Warnings:

  - You are about to drop the column `actionId` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resourceId,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Permission_actionId_idx";

-- DropIndex
DROP INDEX "public"."Permission_resourceId_actionId_key";

-- AlterTable
ALTER TABLE "public"."Permission" DROP COLUMN "actionId";

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "public"."Permission"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resourceId_action_key" ON "public"."Permission"("resourceId", "action");
