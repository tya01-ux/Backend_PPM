-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `userMembershipId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Membership` ADD COLUMN `sessionsPerMonth` INTEGER NOT NULL DEFAULT 4;

-- AlterTable
ALTER TABLE `MembershipRegistration` ADD COLUMN `courtId` INTEGER NULL,
    ADD COLUMN `dayOfWeek` INTEGER NULL,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `startTime` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `UserMembership` ADD COLUMN `courtId` INTEGER NULL,
    ADD COLUMN `dayOfWeek` INTEGER NULL,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `sessionsTotal` INTEGER NOT NULL DEFAULT 4,
    ADD COLUMN `sessionsUsed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `startTime` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Booking_userMembershipId_idx` ON `Booking`(`userMembershipId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userMembershipId_fkey` FOREIGN KEY (`userMembershipId`) REFERENCES `UserMembership`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipRegistration` ADD CONSTRAINT `MembershipRegistration_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMembership` ADD CONSTRAINT `UserMembership_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
