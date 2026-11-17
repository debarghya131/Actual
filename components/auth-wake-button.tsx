"use client";

import { LoaderCircle, Server, X } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const WARM_UP_ESTIMATE_SECONDS = 60;

type AuthWakeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  href: "/sign-in" | "/sign-up";
  children: ReactNode;
  onWakeStart?: () => void;
};

export default function AuthWakeButton({
  href,
  children,
  onWakeStart,
  ...buttonProps
}: AuthWakeButtonProps) {
  const [isWaking, setIsWaking] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    WARM_UP_ESTIMATE_SECONDS,
  );
  const [requestFailed, setRequestFailed] = useState(false);
  const startedAtRef = useRef(0);
  const attemptRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);

  const cancelWakeUp = () => {
    attemptRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setIsWaking(false);
    setRequestFailed(false);
    setSecondsRemaining(WARM_UP_ESTIMATE_SECONDS);
  };

  const startWakeUp = () => {
    const attempt = attemptRef.current + 1;
    const controller = new AbortController();

    attemptRef.current = attempt;
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    startedAtRef.current = Date.now();
    setSecondsRemaining(WARM_UP_ESTIMATE_SECONDS);
    setRequestFailed(false);
    setIsWaking(true);
    onWakeStart?.();

    void fetch(`/api/health?wake=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("The service is not ready yet.");
        }

        if (attempt === attemptRef.current) {
          // Clear the overlay before navigating. Browsers can restore this page
          // from the Back/Forward Cache, including its React component state.
          setIsWaking(false);
          setRequestFailed(false);
          window.location.assign(href);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (attempt === attemptRef.current) {
          setRequestFailed(true);
        }
      });
  };

  useEffect(() => {
    if (!isWaking || requestFailed) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const remaining = Math.max(
        0,
        Math.ceil((WARM_UP_ESTIMATE_SECONDS * 1000 - elapsed) / 1000),
      );

      setSecondsRemaining(remaining);
    }, 250);

    return () => window.clearInterval(interval);
  }, [isWaking, requestFailed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isWaking) {
        cancelWakeUp();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isWaking]);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    const resetWakeUpAfterHistoryNavigation = () => {
      attemptRef.current += 1;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      setIsWaking(false);
      setRequestFailed(false);
      setSecondsRemaining(WARM_UP_ESTIMATE_SECONDS);
    };

    window.addEventListener("pageshow", resetWakeUpAfterHistoryNavigation);

    return () => {
      window.removeEventListener("pageshow", resetWakeUpAfterHistoryNavigation);
    };
  }, []);

  useEffect(() => {
    if (!isWaking) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isWaking]);

  const destinationLabel = href === "/sign-in" ? "sign in" : "sign up";
  const countdownFinished = secondsRemaining === 0;
  const portalTarget = typeof document === "undefined" ? null : document.body;

  return (
    <>
      <button
        {...buttonProps}
        type="button"
        aria-busy={isWaking}
        disabled={isWaking || buttonProps.disabled}
        onClick={startWakeUp}
      >
        {children}
      </button>

      {isWaking && portalTarget
        ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wake-up-title"
          aria-describedby="wake-up-description"
        >
          <div className="my-auto w-full max-w-sm rounded-2xl border border-violet-100 bg-white p-4 text-center shadow-[0_30px_90px_-35px_rgba(15,23,42,0.62)] sm:rounded-3xl sm:p-7 lg:max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:h-14 sm:w-14 sm:rounded-2xl">
              <Server className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </div>

            <h2 id="wake-up-title" className="mt-4 text-lg font-semibold text-slate-950 sm:mt-5 sm:text-xl">
              {requestFailed ? "Unable to reach Actual" : "Waking up Actual"}
            </h2>
            <p id="wake-up-description" className="mt-2 text-sm leading-5 text-slate-600 sm:leading-6">
              {requestFailed
                ? "Please check your connection and try again."
                : countdownFinished
                  ? "The free server is taking a little longer than usual. Please keep this page open."
                  : `The free demo server can take up to a minute to start. We'll take you to ${destinationLabel} as soon as it is ready.`}
            </p>

            {!requestFailed ? (
              <div className="mt-5 sm:mt-6" aria-live="polite">
                <div className="text-3xl font-semibold tabular-nums text-violet-700 sm:text-4xl">
                  {secondsRemaining}
                  <span className="ml-1 text-sm font-medium text-violet-500 sm:text-base">sec</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100 sm:mt-4">
                  <div
                    className="h-full rounded-full bg-violet-700 transition-[width] duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        ((WARM_UP_ESTIMATE_SECONDS - secondsRemaining) /
                          WARM_UP_ESTIMATE_SECONDS) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}

            {!requestFailed ? (
              <a
                href="/demo/dashboard"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-800 transition hover:border-violet-300 hover:bg-violet-100 sm:mt-5 sm:w-auto"
              >
                Try Demo instead — no login needed
              </a>
            ) : null}
            {!requestFailed ? (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Explore the read-only sample workspace while you wait.
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
              {requestFailed ? (
                <button
                  type="button"
                  onClick={startWakeUp}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 sm:h-10 sm:min-h-0"
                >
                  <LoaderCircle className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              ) : null}
              <button
                type="button"
                onClick={cancelWakeUp}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 sm:h-10 sm:min-h-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </div>
        </div>,
        portalTarget,
      )
        : null}
    </>
  );
}
