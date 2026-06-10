CREATE TABLE "site_metrics" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_metrics_pkey" PRIMARY KEY ("key")
);
