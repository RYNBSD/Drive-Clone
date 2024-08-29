import { useCallback, useState } from "react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetch = useCallback(
    async (controller?: AbortController) => {
      const res = await request(path, { ...init, signal: controller?.signal });
      switch (res.ok) {
        case true:
          setIsSuccess(true);
          break;
        default:
          setIsFailed(true);
      }
      await callback(res);
    },
    [callback, init, path]
  );

  useEffectOnce(() => {
    const controller = new AbortController();

    handleAsync(
      async () => {
        setIsLoading(true);
        await fetch(controller);
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
    isSuccess,
    isFailed,
    isError,
    error,
    refetch: fetch,
  };
}
