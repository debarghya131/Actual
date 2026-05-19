"use client";

import type { MouseEvent } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateDefaultAccount } from "@/app/actions/account";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

type AccountCardProps = {
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    isDefault: boolean;
  };
};

export function AccountCard({ account }: AccountCardProps) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    try {
      await updateDefaultFn(id);
    } catch {
      toast.error("Failed to update default account");
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent className="px-4 pb-2">
          <div className="text-lg font-bold">
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between px-4 pb-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-3.5 w-3.5 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AccountCard;
