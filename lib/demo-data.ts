import { format } from "date-fns";

import { defaultCategories } from "@/data/categories";

type DemoAccount = {
  id: string;
  name: string;
  type: "CURRENT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type DemoTransaction = {
  id: string;
  accountId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string;
  category: string;
  isRecurring: boolean;
  recurringInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  nextRecurringDate: string | null;
};

function toIsoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).toISOString();
}

const today = new Date();
const currentYear = today.getUTCFullYear();
const currentMonth = today.getUTCMonth() + 1;
const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 2, 12, 12, 0, 0));
const previousMonth = previousMonthDate.getUTCMonth() + 1;
const previousMonthYear = previousMonthDate.getUTCFullYear();

export const demoAccounts: DemoAccount[] = [
  {
    id: "demo-main",
    name: "Main",
    type: "CURRENT",
    balance: 58210.32,
    isDefault: true,
  },
  {
    id: "demo-savings",
    name: "Savings Vault",
    type: "SAVINGS",
    balance: 128400,
    isDefault: false,
  },
];

export const demoTransactions: DemoTransaction[] = [
  {
    id: "demo-tx-01",
    accountId: "demo-main",
    type: "INCOME",
    amount: 34219.05,
    description: "Monthly salary",
    date: toIsoDate(currentYear, currentMonth, 2),
    category: "salary",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth + 1, 2),
  },
  {
    id: "demo-tx-02",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 4626.97,
    description: "Paid for housing",
    date: toIsoDate(currentYear, currentMonth, 17),
    category: "housing",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth + 1, 17),
  },
  {
    id: "demo-tx-03",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 3205.02,
    description: "Paid for education",
    date: toIsoDate(currentYear, currentMonth, 15),
    category: "education",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-04",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 1598.11,
    description: "Travel booking",
    date: toIsoDate(currentYear, currentMonth, 12),
    category: "travel",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-05",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 1064.74,
    description: "Groceries restock",
    date: toIsoDate(currentYear, currentMonth, 9),
    category: "groceries",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-06",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 1061.18,
    description: "Paid for utilities",
    date: toIsoDate(currentYear, currentMonth, 18),
    category: "utilities",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth + 1, 18),
  },
  {
    id: "demo-tx-07",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 770.17,
    description: "Paid for transport",
    date: toIsoDate(currentYear, currentMonth, 14),
    category: "transportation",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-08",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 451.68,
    description: "ABCD",
    date: toIsoDate(currentYear, currentMonth, 19),
    category: "shopping",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-09",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 287.66,
    description: "Coffee and snacks",
    date: toIsoDate(currentYear, currentMonth, 18),
    category: "food",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-10",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 542.66,
    description: "Medical store",
    date: toIsoDate(currentYear, currentMonth, 10),
    category: "healthcare",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-11",
    accountId: "demo-savings",
    type: "INCOME",
    amount: 1899.15,
    description: "Received freelance",
    date: toIsoDate(currentYear, currentMonth, 15),
    category: "freelance",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-12",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 194.0,
    description: "Streaming renewal",
    date: toIsoDate(currentYear, currentMonth, 5),
    category: "entertainment",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth + 1, 5),
  },
  {
    id: "demo-tx-13",
    accountId: "demo-main",
    type: "INCOME",
    amount: 33800,
    description: "Monthly salary",
    date: toIsoDate(previousMonthYear, previousMonth, 2),
    category: "salary",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth, 2),
  },
  {
    id: "demo-tx-14",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 3980,
    description: "Paid for housing",
    date: toIsoDate(previousMonthYear, previousMonth, 16),
    category: "housing",
    isRecurring: true,
    recurringInterval: "MONTHLY",
    nextRecurringDate: toIsoDate(currentYear, currentMonth, 16),
  },
  {
    id: "demo-tx-15",
    accountId: "demo-main",
    type: "EXPENSE",
    amount: 1240.5,
    description: "Groceries restock",
    date: toIsoDate(previousMonthYear, previousMonth, 11),
    category: "groceries",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
  {
    id: "demo-tx-16",
    accountId: "demo-savings",
    type: "INCOME",
    amount: 2450,
    description: "Side project payment",
    date: toIsoDate(previousMonthYear, previousMonth, 21),
    category: "freelance",
    isRecurring: false,
    recurringInterval: null,
    nextRecurringDate: null,
  },
];

export const demoBudget = {
  id: "demo-budget",
  amount: 5501,
};

const currentMonthKey = format(today, "yyyy-MM");
const previousMonthKey = format(previousMonthDate, "yyyy-MM");

export const demoDashboardPreferences: {
  monthlyBudgetTargets: Record<string, string>;
  savingsGoalTargets: Record<string, string>;
  categoryTargetsByMonth: Record<string, Record<string, string>>;
  visibleCategoryIdsByMonth: Record<string, string[]>;
} = {
  monthlyBudgetTargets: {
    [currentMonthKey]: "5501",
    [previousMonthKey]: "5200",
  },
  savingsGoalTargets: {
    [currentMonthKey]: "6839",
    [previousMonthKey]: "6400",
  },
  categoryTargetsByMonth: {
    [currentMonthKey]: {
      Housing: "3627",
      Education: "3206",
      Travel: "1599",
      Groceries: "1065",
      Utilities: "1062",
      Transportation: "900",
      Food: "400",
      Shopping: "650",
      Healthcare: "600",
      Entertainment: "250",
    },
    [previousMonthKey]: {
      Housing: "3600",
      Groceries: "1300",
    },
  },
  visibleCategoryIdsByMonth: {
    [currentMonthKey]: [
      "housing",
      "education",
      "travel",
      "groceries",
      "utilities",
      "transportation",
    ],
  },
};

export const demoCategories = defaultCategories.map((category) => ({
  id: category.id,
  name: category.name,
  type: category.type as "INCOME" | "EXPENSE",
  color: category.color,
}));
