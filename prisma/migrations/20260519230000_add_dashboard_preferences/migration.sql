CREATE TABLE IF NOT EXISTS "dashboard_preferences" (
    "user_id" TEXT NOT NULL,
    "monthly_budget_targets" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "savings_goal_targets" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "category_targets_by_month" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "visible_category_ids_by_month" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_preferences_pkey" PRIMARY KEY ("user_id")
);

ALTER TABLE "dashboard_preferences"
    ADD COLUMN IF NOT EXISTS "monthly_budget_targets" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "savings_goal_targets" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "category_targets_by_month" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "visible_category_ids_by_month" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'dashboard_preferences_user_id_fkey'
    ) THEN
        ALTER TABLE "dashboard_preferences"
            ADD CONSTRAINT "dashboard_preferences_user_id_fkey"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;
