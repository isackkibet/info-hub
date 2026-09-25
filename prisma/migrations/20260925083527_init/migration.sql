-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PENDING', 'COMMITTED', 'FAILED');

-- CreateEnum
CREATE TYPE "SihuRole" AS ENUM ('STEWARD', 'VALIDATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubmissionCategory" AS ENUM ('WATER_HYACINTH_TRACKING', 'LAKE_CLEANUP', 'BLUE_ECONOMY_NEWS', 'HUMAN_RIGHTS_REPORT', 'POLLUTION_ALERT', 'COMMUNITY_DEVELOPMENT_NEWS');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'BATCHED');

-- CreateEnum
CREATE TYPE "CFARole" AS ENUM ('MEMBER', 'SITE_MANAGER', 'VERIFIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SpeciesCategory" AS ENUM ('INDIGENOUS', 'EXOTIC');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ADDITION', 'PLANTING', 'MORTALITY_LOSS', 'TRANSFER', 'SALE');

-- CreateEnum
CREATE TYPE "DataQualityStatus" AS ENUM ('RAW', 'NEEDS_CORRECTION', 'CLEAN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'IN_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnChainBatch" (
    "id" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "txHash" TEXT,
    "recordCount" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PENDING',
    "committedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnChainBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SihuMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SihuRole" NOT NULL DEFAULT 'STEWARD',
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SihuMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SubmissionCategory" NOT NULL,
    "topic" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "publicMediaUrl" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "contentHash" TEXT,
    "anchorBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CFA" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CFA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CFAMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cfaId" TEXT NOT NULL,
    "role" "CFARole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CFAMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConservationSite" (
    "id" TEXT NOT NULL,
    "cfaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaHectares" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConservationSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "localNames" TEXT[],
    "classification" "SpeciesCategory" NOT NULL,
    "purposes" TEXT[],
    "suitableConditions" TEXT,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreeInventory" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "countPlanted" INTEGER NOT NULL DEFAULT 0,
    "countAvailable" INTEGER NOT NULL DEFAULT 0,
    "countSurviving" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreeInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryEvent" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConservationActivity" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "participantCount" INTEGER,
    "rawData" JSONB NOT NULL,
    "cleanData" JSONB,
    "dataQualityStatus" "DataQualityStatus" NOT NULL DEFAULT 'RAW',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "contentHash" TEXT,
    "anchorBatchId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConservationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAsset" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "verifierId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "OnChainBatch_merkleRoot_key" ON "OnChainBatch"("merkleRoot");

-- CreateIndex
CREATE UNIQUE INDEX "SihuMembership_userId_key" ON "SihuMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "TreeInventory_siteId_speciesId_key" ON "TreeInventory"("siteId", "speciesId");

-- AddForeignKey
ALTER TABLE "SihuMembership" ADD CONSTRAINT "SihuMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_anchorBatchId_fkey" FOREIGN KEY ("anchorBatchId") REFERENCES "OnChainBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CFAMembership" ADD CONSTRAINT "CFAMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CFAMembership" ADD CONSTRAINT "CFAMembership_cfaId_fkey" FOREIGN KEY ("cfaId") REFERENCES "CFA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConservationSite" ADD CONSTRAINT "ConservationSite_cfaId_fkey" FOREIGN KEY ("cfaId") REFERENCES "CFA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeInventory" ADD CONSTRAINT "TreeInventory_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "ConservationSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeInventory" ADD CONSTRAINT "TreeInventory_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEvent" ADD CONSTRAINT "InventoryEvent_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "TreeInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConservationActivity" ADD CONSTRAINT "ConservationActivity_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "ConservationSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConservationActivity" ADD CONSTRAINT "ConservationActivity_anchorBatchId_fkey" FOREIGN KEY ("anchorBatchId") REFERENCES "OnChainBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ConservationActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ConservationActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
