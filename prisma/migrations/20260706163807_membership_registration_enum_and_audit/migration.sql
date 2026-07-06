/*
  Warnings:

  - You are about to alter the column `status` on the `MembershipRegistration` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `paymentMethod` on the `MembershipRegistration` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `MembershipRegistration` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL,
    ADD COLUMN `paymentChannelId` INTEGER NULL,
    ADD COLUMN `rejectReason` VARCHAR(191) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('pending', 'verification', 'active', 'rejected') NOT NULL DEFAULT 'pending',
    MODIFY `paymentMethod` ENUM('transfer', 'qris', 'ewallet', 'cash') NULL;

-- AlterTable
ALTER TABLE `PaymentChannel` MODIFY `type` ENUM('transfer', 'qris', 'ewallet', 'cash') NOT NULL;

-- CreateIndex
CREATE INDEX `MembershipRegistration_status_idx` ON `MembershipRegistration`(`status`);

-- AddForeignKey
ALTER TABLE `MembershipRegistration` ADD CONSTRAINT `MembershipRegistration_paymentChannelId_fkey` FOREIGN KEY (`paymentChannelId`) REFERENCES `PaymentChannel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipRegistration` ADD CONSTRAINT `MembershipRegistration_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Booking` RENAME INDEX `Booking_userId_fkey` TO `Booking_userId_idx`;
