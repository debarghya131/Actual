import type { CSSProperties } from "react";

type BudgetAlertData = {
  percentageUsed?: number;
  budgetAmount?: number;
  totalExpenses?: number;
  accountName?: string;
};

type EmailTemplateProps = {
  userName?: string | null;
  data?: BudgetAlertData;
};

export const dummyBudgetAlertData: Required<EmailTemplateProps> = {
  userName: "John Doe",
  data: {
    accountName: "Personal",
    percentageUsed: 85,
    budgetAmount: 4000,
    totalExpenses: 3400,
  },
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function EmailTemplate({
  userName = dummyBudgetAlertData.userName,
  data = dummyBudgetAlertData.data,
}: EmailTemplateProps) {
  const budgetAmount = Number(data.budgetAmount ?? 0);
  const totalExpenses = Number(data.totalExpenses ?? 0);
  const remaining = Math.max(budgetAmount - totalExpenses, 0);
  const percentageUsed = Number(data.percentageUsed ?? 0);

  return (
    <html>
      <body style={styles.body}>
        <main style={styles.container}>
          <h1 style={styles.title}>Budget Alert</h1>
          <p style={styles.text}>Hello {userName || "there"},</p>
          <p style={styles.text}>
            You have used <strong>{percentageUsed.toFixed(1)}%</strong> of your
            {data.accountName ? ` ${data.accountName}` : ""} monthly budget.
          </p>

          <section style={styles.panel}>
            <p style={styles.label}>Budget Amount</p>
            <p style={styles.value}>{currencyFormatter.format(budgetAmount)}</p>

            <p style={styles.label}>Spent So Far</p>
            <p style={styles.value}>{currencyFormatter.format(totalExpenses)}</p>

            <p style={styles.label}>Remaining</p>
            <p style={styles.value}>{currencyFormatter.format(remaining)}</p>
          </section>

          <p style={styles.footer}>
            Please review your recent transactions to stay on track.
          </p>
        </main>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    backgroundColor: "#f6f7fb",
    color: "#111827",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px 24px",
    backgroundColor: "#ffffff",
  },
  title: {
    margin: "0 0 16px",
    color: "#4f46e5",
    fontSize: "28px",
    lineHeight: "36px",
  },
  text: {
    margin: "0 0 16px",
    color: "#374151",
    fontSize: "16px",
    lineHeight: "24px",
  },
  panel: {
    margin: "24px 0",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
  },
  label: {
    margin: "0 0 4px",
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "18px",
  },
  value: {
    margin: "0 0 16px",
    color: "#111827",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "28px",
  },
  footer: {
    margin: "24px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "20px",
  },
} satisfies Record<string, CSSProperties>;
