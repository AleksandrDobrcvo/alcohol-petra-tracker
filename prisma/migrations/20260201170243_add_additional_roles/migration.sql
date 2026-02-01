-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];
