/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_II_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
