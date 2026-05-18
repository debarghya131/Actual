import type { CSSProperties } from "react";

import { formatCurrency } from "@/lib/currency";

type BudgetAlertData = {
  percentageUsed?: number;
  budgetAmount?: number;
  totalExpenses?: number;
  accountName?: string;
};

type MonthlyStats = {
  totalIncome: number;
  totalExpenses: number;
  byCategory: Record<string, number>;
  transactionCount?: number;
};

type MonthlyReportData = {
  month?: string;
  insights?: string[];
  accountCount?: number;
  totalBalance?: number;
  stats?: MonthlyStats;
};

type EmailTemplateProps = {
  userName?: string | null;
  type?: "budget-alert" | "monthly-report";
  data?: BudgetAlertData | MonthlyReportData;
};

export const PREVIEW_DATA = {
  monthlyReport: {
    userName: "John Doe",
    type: "monthly-report",
    data: {
      month: "December",
      stats: {
        totalIncome: 5000,
        totalExpenses: 3500,
        transactionCount: 24,
        byCategory: {
          housing: 1500,
          groceries: 600,
          transportation: 400,
          entertainment: 300,
          utilities: 700,
        },
      },
      insights: [
        "Your housing expenses are a major part of your spending. Review rent, maintenance, or housing-related costs.",
        "Great job keeping entertainment expenses under control this month.",
        "Setting up automatic savings could help you protect more of your income.",
      ],
    },
  },
  budgetAlert: {
    userName: "John Doe",
    type: "budget-alert",
    data: {
      percentageUsed: 85,
      budgetAmount: 4000,
      totalExpenses: 3400,
      accountName: "Personal",
    },
  },
} satisfies {
  monthlyReport: EmailTemplateProps;
  budgetAlert: EmailTemplateProps;
};

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}: EmailTemplateProps) {
  if (type === "monthly-report") {
    return (
      <MonthlyReportEmail
        userName={userName}
        data={data as MonthlyReportData}
      />
    );
  }

  return <BudgetAlertEmail userName={userName} data={data as BudgetAlertData} />;
}

function MonthlyReportEmail({
  userName,
  data,
}: {
  userName?: string | null;
  data: MonthlyReportData;
}) {
  const stats = data.stats ?? {
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0,
    byCategory: {},
  };
  const net = stats.totalIncome - stats.totalExpenses;
  const insights = data.insights ?? [];

  return (
    <html>
      <body style={styles.body}>
        <main style={styles.container}>
          <h1 style={styles.title}>Monthly Financial Report</h1>

          <p style={styles.text}>Hello {userName || "there"},</p>
          <p style={styles.text}>
            Here&apos;s your financial summary for {data.month || "last month"}:
          </p>

          <section style={styles.statsContainer}>
            <div style={styles.stat}>
              <p style={styles.text}>Total Income</p>
              <p style={styles.heading}>{formatCurrency(stats.totalIncome)}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Total Expenses</p>
              <p style={styles.heading}>
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Net</p>
              <p style={styles.heading}>{formatCurrency(net)}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Transactions</p>
              <p style={styles.heading}>{stats.transactionCount ?? 0}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Total Balance</p>
              <p style={styles.heading}>
                {formatCurrency(Number(data.totalBalance ?? 0))}
              </p>
            </div>
          </section>

          {Object.keys(stats.byCategory).length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.heading}>Expenses by Category</h2>
              {Object.entries(stats.byCategory).map(([category, amount]) => (
                <div key={category} style={styles.row}>
                  <p style={styles.text}>{category}</p>
                  <p style={styles.text}>{formatCurrency(amount)}</p>
                </div>
              ))}
            </section>
          )}

          {insights.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.heading}>Actual Insights</h2>
              {insights.map((insight) => (
                <p key={insight} style={styles.text}>
                  - {insight}
                </p>
              ))}
            </section>
          )}

          <p style={styles.footer}>
            Thank you for using Actual. Keep tracking your finances for better
            financial health.
          </p>
        </main>
      </body>
    </html>
  );
}

function BudgetAlertEmail({
  userName,
  data,
}: {
  userName?: string | null;
  data: BudgetAlertData;
}) {
  const percentageUsed = Number(data.percentageUsed ?? 0);
  const budgetAmount = Number(data.budgetAmount ?? 0);
  const totalExpenses = Number(data.totalExpenses ?? 0);
  const remaining = Math.max(budgetAmount - totalExpenses, 0);

  return (
    <html>
      <body style={styles.body}>
        <main style={styles.container}>
          <h1 style={styles.title}>Budget Alert</h1>

          <p style={styles.text}>Hello {userName || "there"},</p>
          <p style={styles.text}>
            You&apos;ve used <strong>{percentageUsed.toFixed(1)}%</strong> of
            your{data.accountName ? ` ${data.accountName}` : ""} monthly
            budget.
          </p>

          <section style={styles.statsContainer}>
            <div style={styles.stat}>
              <p style={styles.text}>Budget Amount</p>
              <p style={styles.heading}>{formatCurrency(budgetAmount)}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Spent So Far</p>
              <p style={styles.heading}>{formatCurrency(totalExpenses)}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.text}>Remaining</p>
              <p style={styles.heading}>{formatCurrency(remaining)}</p>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  container: {
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "24px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
    lineHeight: "24px",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
} satisfies Record<string, CSSProperties>;
