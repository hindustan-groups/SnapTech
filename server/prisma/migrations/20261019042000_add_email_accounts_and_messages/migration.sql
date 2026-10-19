-- AlterTable
ALTER TABLE "email_automation_rules" ADD COLUMN "senderAccountId" TEXT,
ADD COLUMN "replyTo" TEXT;

-- CreateTable
CREATE TABLE "email_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'HOSTINGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefaultSender" BOOLEAN NOT NULL DEFAULT false,
    "replyTo" TEXT,
    "department" TEXT,
    "enquiryTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 465,
    "smtpSecure" BOOLEAN DEFAULT true,
    "smtpUser" TEXT,
    "smtpPasswordEncrypted" TEXT,
    "imapHost" TEXT,
    "imapPort" INTEGER DEFAULT 993,
    "imapSecure" BOOLEAN DEFAULT true,
    "imapUser" TEXT,
    "imapPasswordEncrypted" TEXT,
    "imapMailbox" TEXT DEFAULT 'INBOX',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT DEFAULT 'NEVER_SYNCED',
    "lastSyncError" TEXT,
    "syncCursor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "folder" TEXT NOT NULL DEFAULT 'INBOX',
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "threadId" TEXT,
    "from" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "to" TEXT[],
    "cc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bcc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "replyTo" TEXT,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "snippet" TEXT,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "attachmentsMetadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "providerUid" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'DELIVERED',
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_email_key" ON "email_accounts"("email");
CREATE INDEX "email_accounts_email_idx" ON "email_accounts"("email");
CREATE INDEX "email_accounts_isActive_idx" ON "email_accounts"("isActive");
CREATE INDEX "email_accounts_isDefaultSender_idx" ON "email_accounts"("isDefaultSender");

-- CreateIndex
CREATE INDEX "email_messages_accountId_idx" ON "email_messages"("accountId");
CREATE INDEX "email_messages_folder_idx" ON "email_messages"("folder");
CREATE INDEX "email_messages_direction_idx" ON "email_messages"("direction");
CREATE INDEX "email_messages_fromEmail_idx" ON "email_messages"("fromEmail");
CREATE INDEX "email_messages_threadId_idx" ON "email_messages"("threadId");
CREATE INDEX "email_messages_leadId_idx" ON "email_messages"("leadId");
CREATE INDEX "email_messages_receivedAt_idx" ON "email_messages"("receivedAt");
CREATE INDEX "email_messages_isRead_idx" ON "email_messages"("isRead");
CREATE INDEX "email_messages_accountId_providerUid_idx" ON "email_messages"("accountId", "providerUid");

-- AddForeignKey
ALTER TABLE "email_automation_rules" ADD CONSTRAINT "email_automation_rules_senderAccountId_fkey" FOREIGN KEY ("senderAccountId") REFERENCES "email_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "email_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "contact_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
