declare module "mammoth" {
  interface ExtractResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  interface ExtractOptions {
    buffer?: Buffer;
    path?: string;
    arrayBuffer?: ArrayBuffer;
  }

  export function extractRawText(options: ExtractOptions): Promise<ExtractResult>;
  export function extractText(options: ExtractOptions): Promise<ExtractResult>;
}