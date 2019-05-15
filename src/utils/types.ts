// for SocketMessage use string | Buffer
export type Message = any;
export type Listener = (...args: any[]) => void;

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
};