type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface ImportMetaEnv {
  readonly LIT_RAG_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals extends Runtime {}
}
