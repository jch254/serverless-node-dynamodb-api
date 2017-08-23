export interface ResponseArgs {
  statusCode: number;
  body?: any;
}

export const defaultResponseArgs: ResponseArgs = {
  statusCode: 200,
};

export default class Response {
  statusCode: number;
  body?: string;
  headers: {
    'Access-Control-Allow-Origin': '*', // Required for CORS
  };

  constructor(args: ResponseArgs = defaultResponseArgs) {
    this.statusCode = args.statusCode;

    if (args.body !== undefined) {
      this.body = JSON.stringify(args.body);
    }
  }
}

