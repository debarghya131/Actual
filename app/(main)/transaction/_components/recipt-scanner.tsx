"use client";

import { useCallback, useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
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

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
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
    <LazyMotion features={domAnimation}>
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleReceiptScan(file);
            }
            e.currentTarget.value = "";
          }}
        />
        <m.div
          className="w-full"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Button
            type="button"
            variant="outline"
            className="min-h-12 w-full whitespace-normal rounded-xl border-0 bg-linear-to-r from-yellow-400 via-amber-400 to-yellow-500 px-3 py-2 text-center leading-5 text-slate-950 shadow-[0_18px_40px_-22px_rgba(245,158,11,0.56)] transition duration-300 hover:text-slate-950 hover:shadow-[0_24px_52px_-20px_rgba(234,179,8,0.62)] sm:min-h-10"
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
        </m.div>
      </div>
    </LazyMotion>
  );
}
