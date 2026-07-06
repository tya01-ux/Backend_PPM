/*
  Warnings:

  - You are about to drop the column `description` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Membership` DROP COLUMN `description`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `UserMembership` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `MembershipRegistration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `membershipId` INTEGER NOT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `proofImage` VARCHAR(191) NULL,
    `status` ENUM('pending', 'verification', 'active', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MembershipRegistration_userId_idx`(`userId`),
    INDEX `MembershipRegistration_membershipId_idx`(`membershipId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MembershipRegistration` ADD CONSTRAINT `MembershipRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipRegistration` ADD CONSTRAINT `MembershipRegistration_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Membership`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `UserMembership` RENAME INDEX `UserMembership_membershipId_fkey` TO `UserMembership_membershipId_idx`;

-- RenameIndex
ALTER TABLE `UserMembership` RENAME INDEX `UserMembership_userId_fkey` TO `UserMembership_userId_idx`;
