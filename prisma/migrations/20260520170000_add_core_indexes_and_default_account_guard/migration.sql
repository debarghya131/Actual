CREATE INDEX IF NOT EXISTS "accounts_userId_isDefault_idx"
ON "accounts"("userId", "isDefault");

CREATE INDEX IF NOT EXISTS "transactions_userId_status_date_idx"
ON "transactions"("userId", "status", "date");

CREATE INDEX IF NOT EXISTS "transactions_isRecurring_status_nextRecurringDate_idx"
ON "transactions"("isRecurring", "status", "nextRecurringDate");

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_single_default_per_user_idx"
ON "accounts"("userId")
WHERE "isDefault" = true;
