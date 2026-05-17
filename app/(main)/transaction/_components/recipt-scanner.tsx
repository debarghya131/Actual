"use client";

import { useCallback, useEffect, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/app/actions/transaction";

type ScannedReceipt = {
  amount: number;
  date: Date | string;
  description?: string;
  category?: string;
  merchantName?: string;
};

type ReceiptScannerProps = {
  onScanComplete: (data: ScannedReceipt) => void;
};

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    error: scanReceiptError,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      await scanReceiptFn(file);
    } catch {
      // useFetch exposes the normalized error for the toast below.
    }
  };

  const handleScanComplete = useCallback(
    (data: ScannedReceipt) => {
      onScanComplete(data);
      toast.success("Receipt scanned successfully");
    },
    [onScanComplete]
  );

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      handleScanComplete(scannedData);
    }
  }, [handleScanComplete, scanReceiptLoading, scannedData]);

  useEffect(() => {
    if (scanReceiptError) {
      toast.error(scanReceiptError.message);
    }
  }, [scanReceiptError]);

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
