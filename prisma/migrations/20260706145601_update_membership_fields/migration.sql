/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `MembershipRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `proofImage` on the `MembershipRegistration` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `MembershipRegistration` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - Added the required column `benefits` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Membership` ADD COLUMN `benefits` JSON NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `isPopular` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `quotaLabel` VARCHAR(191) NULL,
    ADD COLUMN `theme` VARCHAR(191) NOT NULL DEFAULT 'blue';

-- AlterTable
ALTER TABLE `MembershipRegistration` DROP COLUMN `paymentMethod`,
    DROP COLUMN `proofImage`,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `UserMembership` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    MODIFY `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
