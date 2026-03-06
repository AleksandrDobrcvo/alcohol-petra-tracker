export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function assertNever(x: never, message = "Unexpected value"): never {
  throw new ApiError(500, "INTERNAL_ERROR", `${message}: ${String(x)}`);
}

