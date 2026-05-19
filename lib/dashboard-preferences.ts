import { db } from "@/lib/prisma";

export type DashboardPreferences = {
  monthlyBudgetTargets: Record<string, string>;
  savingsGoalTargets: Record<string, string>;
  categoryTargetsByMonth: Record<string, Record<string, string>>;
  visibleCategoryIdsByMonth: Record<string, string[]>;
};

type DashboardPreferencesDelegate = {
  findUnique: (args: { where: { userId: string } }) => Promise<{
    monthlyBudgetTargets: unknown;
    savingsGoalTargets: unknown;
    categoryTargetsByMonth: unknown;
    visibleCategoryIdsByMonth: unknown;
  } | null>;
  upsert: (args: {
    where: { userId: string };
    update: {
      monthlyBudgetTargets: Record<string, string>;
      savingsGoalTargets: Record<string, string>;
      categoryTargetsByMonth: Record<string, Record<string, string>>;
      visibleCategoryIdsByMonth: Record<string, string[]>;
    };
    create: {
      userId: string;
      monthlyBudgetTargets: Record<string, string>;
      savingsGoalTargets: Record<string, string>;
      categoryTargetsByMonth: Record<string, Record<string, string>>;
      visibleCategoryIdsByMonth: Record<string, string[]>;
    };
  }) => Promise<unknown>;
};

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => {
      return typeof entry[0] === "string" && typeof entry[1] === "string";
    }),
  );
}

function asNestedStringRecord(value: unknown): Record<string, Record<string, string>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([month, targets]) => [month, asStringRecord(targets)]),
  );
}

function asStringArrayByMonth(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([month, ids]) => {
      if (!Array.isArray(ids)) {
        return [month, []];
      }

      return [month, ids.filter((id): id is string => typeof id === "string")];
    }),
  );
}

function getDashboardPreferencesDelegate() {
  return (db as typeof db & { dashboardPreferences?: DashboardPreferencesDelegate })
    .dashboardPreferences;
}

async function getDashboardPreferencesLegacy(userId: string) {
  const rows = await db.$queryRawUnsafe<
    Array<{
      monthly_budget_targets: unknown;
      savings_goal_targets: unknown;
      category_targets_by_month: unknown;
      visible_category_ids_by_month: unknown;
    }>
  >(
    `
      SELECT
        monthly_budget_targets,
        savings_goal_targets,
        category_targets_by_month,
        visible_category_ids_by_month
      FROM dashboard_preferences
      WHERE user_id = $1
      LIMIT 1
    `,
    userId,
  );

  return rows[0] ?? null;
}

export async function getDashboardPreferences(
  userId: string,
): Promise<DashboardPreferences> {
  const delegate = getDashboardPreferencesDelegate();
  const row = delegate
    ? await delegate.findUnique({
        where: { userId },
      })
    : await getDashboardPreferencesLegacy(userId);

  if (!row) {
    return {
      monthlyBudgetTargets: {},
      savingsGoalTargets: {},
      categoryTargetsByMonth: {},
      visibleCategoryIdsByMonth: {},
    };
  }

  return {
    monthlyBudgetTargets: asStringRecord(
      "monthlyBudgetTargets" in row
        ? row.monthlyBudgetTargets
        : row.monthly_budget_targets
    ),
    savingsGoalTargets: asStringRecord(
      "savingsGoalTargets" in row
        ? row.savingsGoalTargets
        : row.savings_goal_targets
    ),
    categoryTargetsByMonth: asNestedStringRecord(
      "categoryTargetsByMonth" in row
        ? row.categoryTargetsByMonth
        : row.category_targets_by_month
    ),
    visibleCategoryIdsByMonth: asStringArrayByMonth(
      "visibleCategoryIdsByMonth" in row
        ? row.visibleCategoryIdsByMonth
        : row.visible_category_ids_by_month
    ),
  };
}

export async function saveDashboardPreferences(
  userId: string,
  preferences: DashboardPreferences,
) {
  const delegate = getDashboardPreferencesDelegate();

  if (delegate) {
    await delegate.upsert({
      where: { userId },
      update: {
        monthlyBudgetTargets: preferences.monthlyBudgetTargets,
        savingsGoalTargets: preferences.savingsGoalTargets,
        categoryTargetsByMonth: preferences.categoryTargetsByMonth,
        visibleCategoryIdsByMonth: preferences.visibleCategoryIdsByMonth,
      },
      create: {
        userId,
        monthlyBudgetTargets: preferences.monthlyBudgetTargets,
        savingsGoalTargets: preferences.savingsGoalTargets,
        categoryTargetsByMonth: preferences.categoryTargetsByMonth,
        visibleCategoryIdsByMonth: preferences.visibleCategoryIdsByMonth,
      },
    });

    return;
  }

  await db.$executeRawUnsafe(
    `
      INSERT INTO dashboard_preferences (
        user_id,
        monthly_budget_targets,
        savings_goal_targets,
        category_targets_by_month,
        visible_category_ids_by_month
      )
      VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        monthly_budget_targets = EXCLUDED.monthly_budget_targets,
        savings_goal_targets = EXCLUDED.savings_goal_targets,
        category_targets_by_month = EXCLUDED.category_targets_by_month,
        visible_category_ids_by_month = EXCLUDED.visible_category_ids_by_month,
        updated_at = now()
    `,
    userId,
    JSON.stringify(preferences.monthlyBudgetTargets),
    JSON.stringify(preferences.savingsGoalTargets),
    JSON.stringify(preferences.categoryTargetsByMonth),
    JSON.stringify(preferences.visibleCategoryIdsByMonth),
  );
}
