import { useState } from "react";
import useEffectOnce from "react-use/lib/useEffectOnce";
import { handleAsync, request } from "../util";

export function useFetch(
  path: string,
  init: RequestInit,
  callback: (res: Response) => Promise<void> | void
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffectOnce(() => {
    const controller = new AbortController();

    handleAsync(
      async () => {
        setIsLoading(true);
        const res = await request(path, { ...init, signal: controller.signal });
        if (!res.ok) setIsFailed(true);
        await callback(res);
      },
      null,
      (error) => {
        if (controller.signal.aborted) return;
        setIsError(true);
        setError(error);
      },
      () => setIsLoading(false)
    );

    return () => {
      controller.abort();
    };
  });

  return {
    isLoading,
    isFailed,
    isError,
    error,
  };
}
