/*
  Warnings:

  - You are about to drop the column `product_id` on the `calorie_log` table. All the data in the column will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `food_item_id` to the `calorie_log` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "calorie_log" DROP CONSTRAINT "calorie_log_product_id_fkey";

-- AlterTable
ALTER TABLE "calorie_log" DROP COLUMN "product_id",
ADD COLUMN     "food_item_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "product";

-- CreateTable
CREATE TABLE "food_item" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1024) NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein" DECIMAL(10,2) NOT NULL,
    "carbs" DECIMAL(10,2) NOT NULL,
    "fat" DECIMAL(10,2) NOT NULL,
    "serving_size" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_item_name_key" ON "food_item"("name");

-- CreateIndex
CREATE INDEX "food_item_name_idx" ON "food_item"("name");

-- AddForeignKey
ALTER TABLE "calorie_log" ADD CONSTRAINT "calorie_log_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
