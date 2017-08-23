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
    [name: string] : string,
  };

  constructor(args: ResponseArgs = defaultResponseArgs) {
    this.statusCode = args.statusCode;
    this.headers = {
      'Access-Control-Allow-Origin': '*', // Required for CORS
    };

    if (args.body !== undefined) {
      this.body = JSON.stringify(args.body);
    }
  }
}

