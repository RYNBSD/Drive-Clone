type Fn<T> = (() => Promise<T> | T) | Promise<T>;

type OnThen<T> = (arg: T) => Promise<void> | void;

type OnError = (error: unknown) => void;

type OnFinally = () => void;

export async function handleAsync<T>(
  fn: Fn<T>,
  onThen?: OnThen<T> | null,
  onError?: OnError | null,
  onFinally?: OnFinally | null
) {
  try {
    const rtn = typeof fn === "function" ? await fn() : await fn;
    await onThen?.(rtn);
  } catch (error) {
    if (__DEV__) console.error(error);
    onError?.(error);
  } finally {
    onFinally?.();
  }
}
