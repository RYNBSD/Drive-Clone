export default class FetchError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  static isFetchError(obj: unknown): obj is FetchError {
    return (
      obj instanceof FetchError ||
      (typeof obj === "object" &&
        obj !== null &&
        "message" in obj &&
        typeof obj.message === "string" &&
        "status" in obj &&
        typeof obj.status === "number" &&
        "name" in obj &&
        obj.name === FetchError.name)
    );
  }
}
