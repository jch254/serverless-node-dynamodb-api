export interface ResponseErrorArgs {
  statusCode?: number;
  message?: string;
}

export const defaultResponseErrorArgs: ResponseErrorArgs = {
  statusCode: 500,
  message: 'Internal server error',
};

export default class ResponseError extends Error {
  statusCode: number;
  message: string;

  constructor(args: ResponseErrorArgs = defaultResponseErrorArgs) {
    super(args.message ?? defaultResponseErrorArgs.message);
    this.statusCode =
      args.statusCode ?? (defaultResponseErrorArgs.statusCode as number);
    this.message = args.message ?? (defaultResponseErrorArgs.message as string);
  }
}
