"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { createTransaction, updateTransaction } from "@/app/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

type TransactionFormValues = z.input<typeof transactionSchema>;

type AccountOption = {
  id: string;
  name: string;
  balance: number | string;
  isDefault?: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type InitialTransaction = {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string | null;
  accountId: string;
  category: string;
  date: Date | string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
};

type ScannedReceipt = {
  amount: number;
  date: Date | string;
  description?: string;
  category?: string;
};

type AddTransactionFormProps = {
  accounts: AccountOption[];
  categories: CategoryOption[];
  editMode?: boolean;
  initialData?: InitialTransaction | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  demoMode?: boolean;
};

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
  onCancel,
  onSuccess,
  demoMode = false,
}: AddTransactionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description ?? "",
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: createTransactionLoading,
    fn: createTransactionFn,
    data: createTransactionResult,
  } = useFetch(createTransaction);

  const {
    loading: updateTransactionLoading,
    fn: updateTransactionFn,
    data: updateTransactionResult,
  } = useFetch(updateTransaction);

  const transactionLoading = editMode
    ? updateTransactionLoading
    : createTransactionLoading;
  const transactionResult = editMode
    ? updateTransactionResult
    : createTransactionResult;

  const onSubmit = (data: TransactionFormValues) => {
    if (demoMode) {
      toast.info("Demo mode is read-only");
      return;
    }

    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      isRecurring: Boolean(data.isRecurring),
    };

    if (editMode) {
      if (!editId) {
        toast.error("Missing transaction id");
        return;
      }
      updateTransactionFn(editId, formData);
    } else {
      createTransactionFn(formData);
    }
  };

  const handleScanComplete = useCallback(
    (scannedData: ScannedReceipt) => {
      if (scannedData) {
        setValue("amount", scannedData.amount.toString());
        setValue("date", new Date(scannedData.date));
        if (scannedData.description) {
          setValue("description", scannedData.description);
        }
        if (scannedData.category) {
          const scannedCategory = normalizeScannedCategory(
            scannedData.category,
            categories
          );
          setValue("category", scannedCategory);
        }
        toast.success("Receipt scanned successfully");
      }
    },
    [categories, setValue]
  );

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.refresh();
      onSuccess?.();
      if (editMode) {
        router.push("/dashboard/transaction/create");
      }
    }
  }, [editMode, onSuccess, reset, router, transactionLoading, transactionResult]);

  const type = useWatch({ control, name: "type" });
  const accountId = useWatch({ control, name: "accountId" });
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const date = useWatch({ control, name: "date" });
  const category = useWatch({ control, name: "category" });
  const recurringInterval = useWatch({ control, name: "recurringInterval" });

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (
      category &&
      !filteredCategories.some((option) => option.id === category)
    ) {
      setValue("category", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [category, filteredCategories, setValue]);

  useEffect(() => {
    if (isRecurring && !recurringInterval) {
      setValue("recurringInterval", "DAILY", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [isRecurring, recurringInterval, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && !demoMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => {
            setValue("type", value as TransactionFormValues["type"], {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          value={type}
          disabled={demoMode}
        >
          <SelectTrigger className="w-full rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
            disabled={demoMode}
            className="rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]"
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) =>
              setValue("accountId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            value={accountId}
            disabled={demoMode}
          >
            <SelectTrigger className="w-full rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance)})
                </SelectItem>
              ))}
              {!demoMode ? (
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    Create Account
                  </Button>
                </CreateAccountDrawer>
              ) : null}
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) =>
            setValue("category", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          value={category}
          disabled={demoMode}
        >
          <SelectTrigger className="w-full rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full rounded-xl border-violet-100 pl-3 text-left font-normal transition duration-300 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]",
                !date && "text-muted-foreground"
              )}
              disabled={demoMode}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setValue("date", date, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          placeholder="Enter description"
          {...register("description")}
          disabled={demoMode}
          className="rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-2xl border border-violet-100 p-4 transition duration-300 hover:shadow-[0_14px_30px_-22px_rgba(109,40,217,0.16)]">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => {
            setValue("isRecurring", checked, {
              shouldDirty: true,
              shouldValidate: true,
            });
            if (!checked) {
              setValue("recurringInterval", undefined, {
                shouldDirty: true,
                shouldValidate: true,
              });
            } else if (!getValues("recurringInterval")) {
              setValue("recurringInterval", "DAILY", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
          disabled={demoMode}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) =>
              setValue(
                "recurringInterval",
                value as TransactionFormValues["recurringInterval"],
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              )
            }
            value={recurringInterval}
            disabled={demoMode}
          >
            <SelectTrigger className="w-full rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:shadow-[0_12px_28px_-20px_rgba(109,40,217,0.18)]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-violet-100 transition duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-[0_14px_30px_-20px_rgba(109,40,217,0.18)]"
          onClick={onCancel ?? (() => router.back())}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full rounded-xl bg-slate-950 shadow-[0_16px_34px_-18px_rgba(15,23,42,0.75)] transition duration-300 hover:bg-slate-900 hover:shadow-[0_20px_42px_-18px_rgba(109,40,217,0.55)]"
          disabled={transactionLoading || demoMode}
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : demoMode ? (
            "Read-Only Demo"
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}

function normalizeScannedCategory(
  category: string,
  categories: CategoryOption[]
) {
  const normalized = category.trim().toLowerCase();
  const match = categories.find((option) => {
    const id = option.id.toLowerCase();
    const name = option.name.toLowerCase();

    return (
      id === normalized ||
      name === normalized ||
      id.replace(/-/g, " ") === normalized
    );
  });

  return match?.id ?? "other-expense";
}
