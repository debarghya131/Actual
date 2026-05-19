"use client";

import { toast } from "sonner";

export function showDemoModeToast(action?: string) {
  toast.warning(
    action
      ? `Demo mode: ${action} is available after sign in.`
      : "Demo mode: this action is available after sign in."
  );
}
