// for SocketMessage use string | Buffer
export type Message = any;
export type Listener = (...args: any[]) => void;

export enum LogLevel {
  ALL = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

export type Options = {
  url: string;
  autoConnect: boolean;
  autoReconnect: boolean;
  autoResubscribe: boolean;
  autoReconnectOptions: {
    attempts: number;
    minInterval: number;
    maxInterval: number;
  }
  // TODO: make logger proper type
  logger: any;
};

export type Configurations = {
  url: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  autoResubscribe?: boolean;
  autoReconnectOptions?: {
    attempts?: number;
    minInterval?: number;
    maxInterval?: number;
  }
  loggerOptions?: {
    level?: LogLevel;
    // TODO: make logger proper type
    logger?: any;
  }
};