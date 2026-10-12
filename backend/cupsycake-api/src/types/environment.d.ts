declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      DB_HOST?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;
      DB_PORT?: string;
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      FRONTEND_URL?: string;
    }
  }
}

export {};
