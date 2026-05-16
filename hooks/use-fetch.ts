import { useState } from "react";

type AsyncCallback<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

const useFetch = <TArgs extends unknown[], TResult>(
  cb: AsyncCallback<TArgs, TResult>,
) => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Something went wrong");
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
