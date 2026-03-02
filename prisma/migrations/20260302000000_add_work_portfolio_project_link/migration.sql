-- AlterTable: Add optional work_project_id FK to work_portfolios
ALTER TABLE "work_portfolios" ADD COLUMN "work_project_id" TEXT;

-- AddForeignKey
ALTER TABLE "work_portfolios" ADD CONSTRAINT "work_portfolios_work_project_id_fkey" FOREIGN KEY ("work_project_id") REFERENCES "work_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "work_portfolios_work_project_id_idx" ON "work_portfolios"("work_project_id");
