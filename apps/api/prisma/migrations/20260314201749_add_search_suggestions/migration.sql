-- CreateTable
CREATE TABLE "SearchSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE INDEX "SearchSuggestion_normalized_idx" ON "SearchSuggestion"("normalized");
