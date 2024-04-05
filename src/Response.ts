export interface ResponseArgs {
  statusCode?: number;
  body?: any;
  headers?: {
    [name: string]: string;
  };
}

export const defaultResponseArgs: ResponseArgs = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*', // Required for CORS
    'Access-Control-Allow-Credentials': 'true',
  },
};

export default class Response {
  statusCode: number;
  body?: string;
  headers: {
    [name: string]: string;
  };

  constructor(args: ResponseArgs = defaultResponseArgs) {
    this.statusCode =
      args.statusCode ?? (defaultResponseArgs.statusCode as number);
    this.headers = {
      ...defaultResponseArgs.headers,
      ...(args.headers ?? {}),
    };

    if (args.body !== undefined) {
      this.body = JSON.stringify(args.body);
    }
  }
}
