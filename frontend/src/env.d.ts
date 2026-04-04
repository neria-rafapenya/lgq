export {};

declare global {
  interface Window {
    LGQ_API_BASE?: string;
    LGQWidget?: {
      mount: (options?: { container?: string; apiBase?: string }) => void;
      unmount: () => void;
    };
  }
}
