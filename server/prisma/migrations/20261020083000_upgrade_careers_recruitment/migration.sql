-- AlterTable: Add enterprise recruitment fields to job_postings
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "workplaceType" TEXT DEFAULT 'On-site';
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "salaryRange" TEXT;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "showSalary" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "openings" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "perks" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "hiringSteps" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "badge" TEXT DEFAULT 'Actively Hiring';
ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "deadline" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_postings' AND column_name = 'deadline' AND data_type LIKE '%timestamp%'
  ) THEN
    ALTER TABLE "job_postings" ALTER COLUMN "deadline" TYPE TEXT USING "deadline"::TEXT;
  END IF;
END $$;

-- AlterTable: Add candidate profile and evaluation fields to job_applications
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "experience" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "currentCtc" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "expectedCtc" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "noticePeriod" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "resumeFileName" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "resumeFileType" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "resumeFileSize" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "resumeData" TEXT;
