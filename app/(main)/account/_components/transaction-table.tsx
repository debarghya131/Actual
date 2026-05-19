"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/app/actions/account";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { showDemoModeToast } from "@/lib/demo-mode";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
} as const;

type RecurringInterval = keyof typeof RECURRING_INTERVALS;
type TransactionType = "INCOME" | "EXPENSE";
type SortField = "date" | "amount" | "category";

type TransactionTableItem = {
  id: string;
  accountId?: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  date: Date | string;
  category: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  nextRecurringDate?: Date | string | null;
};

type TransactionTableAccount = {
  id: string;
  name: string;
};

type TransactionTableProps = {
  transactions: TransactionTableItem[];
  accounts?: TransactionTableAccount[];
  demoMode?: boolean;
  basePath?: string;
};

export function TransactionTable({
  transactions,
  accounts = [],
  demoMode = false,
  basePath = "/dashboard",
}: TransactionTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date" as SortField,
    direction: "desc" as "asc" | "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower),
      );
    }

    if (accountFilter) {
      result = result.filter((transaction) => transaction.accountId === accountFilter);
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    transactions,
    searchTerm,
    accountFilter,
    typeFilter,
    recurringFilter,
    sortConfig,
  ]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    if (demoMode) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSelectAll = () => {
    if (demoMode) {
      return;
    }

    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((transaction) => transaction.id),
    );
  };

  const { loading: deleteLoading, fn: deleteFn } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (demoMode) {
      showDemoModeToast("deleting transactions");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`,
      )
    ) {
      return;
    }

    const result = await deleteFn(selectedIds);

    if (result.success) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (demoMode) {
      showDemoModeToast("deleting transactions");
      return;
    }

    const result = await deleteFn([id]);

    if (result.success) {
      toast.success("Transaction deleted successfully");
      setSelectedIds((current) => current.filter((item) => item !== id));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setAccountFilter("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {deleteLoading && !demoMode ? (
          <div className="overflow-hidden rounded-full border border-violet-100 bg-violet-50/70 p-1">
            <BarLoader className="mt-0" width={"100%"} color="#9333ea" />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-2xl border-violet-100 bg-white/90 pl-10 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)] focus-visible:shadow-[0_16px_34px_-22px_rgba(109,40,217,0.22)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {accounts.length > 1 ? (
              <Select
                value={accountFilter || "all"}
                onValueChange={(value) => {
                  setAccountFilter(value === "all" ? "" : value);
                  setSelectedIds([]);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-[160px] rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-[130px] rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={recurringFilter}
              onValueChange={(value) => {
                setRecurringFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-[130px] rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring Only</SelectItem>
                <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
              </SelectContent>
            </Select>

            {selectedIds.length > 0 && !demoMode ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-11 rounded-2xl px-4 shadow-[0_14px_30px_-22px_rgba(239,68,68,0.35)] transition duration-300 hover:shadow-[0_18px_38px_-20px_rgba(239,68,68,0.46)]"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            ) : null}

            {searchTerm || accountFilter || typeFilter || recurringFilter ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
                className="h-11 w-11 rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.18)]"
              >
                <X className="h-4 w-5" />
              </Button>
            ) : null}
          </div>
        </div>

        <m.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden rounded-[22px] border border-violet-100 bg-white/95 shadow-[0_22px_50px_-36px_rgba(109,40,217,0.22)] transition duration-300 hover:shadow-[0_28px_62px_-32px_rgba(109,40,217,0.3)]"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-violet-50/35">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedTransactions.length &&
                      paginatedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={demoMode}
                  />
                </TableHead>
                <SortableHead
                  label="Date"
                  active={sortConfig.field === "date"}
                  direction={sortConfig.direction}
                  onClick={() => handleSort("date")}
                />
                <TableHead>Description</TableHead>
                <SortableHead
                  label="Category"
                  active={sortConfig.field === "category"}
                  direction={sortConfig.direction}
                  onClick={() => handleSort("category")}
                />
                <SortableHead
                  label="Amount"
                  active={sortConfig.field === "amount"}
                  direction={sortConfig.direction}
                  align="right"
                  onClick={() => handleSort("amount")}
                />
                <TableHead>Recurring</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="transition duration-300 hover:bg-violet-50/45"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={() => handleSelect(transaction.id)}
                        disabled={demoMode}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="capitalize">
                      <span
                        style={{
                          background: categoryColors[transaction.category],
                        }}
                        className="rounded-lg px-2.5 py-1 text-sm text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)]"
                      >
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500",
                      )}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {transaction.isRecurring ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="gap-1 rounded-full border border-violet-200 bg-violet-100/80 text-violet-700 shadow-[0_10px_22px_-16px_rgba(109,40,217,0.4)] hover:bg-violet-200"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {transaction.recurringInterval
                                  ? RECURRING_INTERVALS[transaction.recurringInterval]
                                  : "Recurring"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium">Next Date:</div>
                                <div>
                                  {transaction.nextRecurringDate
                                    ? format(new Date(transaction.nextRecurringDate), "PPP")
                                    : "Not scheduled"}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="outline" className="gap-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          One-time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-full p-0 transition duration-300 hover:bg-violet-50 hover:shadow-[0_12px_24px_-16px_rgba(109,40,217,0.26)]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              demoMode
                                ? showDemoModeToast("editing transactions")
                                : router.push(
                                    `${basePath}/transaction/create?edit=${transaction.id}`,
                                  )
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </m.div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-2xl border-violet-100 bg-white/90 transition duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </m.div>
    </LazyMotion>
  );
}

function SortableHead({
  label,
  active,
  direction,
  align = "left",
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <TableHead
      className={cn("cursor-pointer", align === "right" ? "text-right" : undefined)}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex items-center",
          align === "right" ? "justify-end" : "justify-start",
        )}
      >
        {label}
        {active
          ? direction === "asc"
            ? <ChevronUp className="ml-1 h-4 w-4" />
            : <ChevronDown className="ml-1 h-4 w-4" />
          : null}
      </div>
    </TableHead>
  );
}
