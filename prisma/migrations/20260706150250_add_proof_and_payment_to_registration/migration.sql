-- AlterTable
ALTER TABLE `MembershipRegistration` ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `proofImageUrl` VARCHAR(191) NULL;
