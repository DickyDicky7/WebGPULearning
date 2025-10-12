    export interface CsvStreamWorker {
//  export interface CsvStreamWorker {
        init(headers: string[]): void;
//      init(headers: string[]): void;
        writeChunk(rows: Record<string, any>[]): void;
//      writeChunk(rows: Record<string, any>[]): void;
        end(): Promise<{ blobUrl: string; totalRows: number; }>;
//      end(): Promise<{ blobUrl: string; totalRows: number; }>;
        terminate(): void;
//      terminate(): void;
        onProgress?: (writtenRows: number) => void;
//      onProgress?: (writtenRows: number) => void;
    }
//  }
    export function createCsvStreamWorker(): CsvStreamWorker {
//  export function createCsvStreamWorker(): CsvStreamWorker {
        const worker: Worker = new Worker(new URL("./csvStreamWorker.ts", import.meta.url), { type: "module" });
//      const worker: Worker = new Worker(new URL("./csvStreamWorker.ts", import.meta.url), { type: "module" });
        let resolveEnd: ((value: { blobUrl: string; totalRows: number; }) => void) | null = null;
//      let resolveEnd: ((value: { blobUrl: string; totalRows: number; }) => void) | null = null;
        worker.onmessage = (e: MessageEvent<any>) => {
//      worker.onmessage = (e: MessageEvent<any>) => {
            const msg: any = e.data;
//          const msg: any = e.data;
            if (msg.type === "PROGRESS" && wrapper.onProgress) {
//          if (msg.type === "PROGRESS" && wrapper.onProgress) {
                wrapper.onProgress(msg.writtenRows);
//              wrapper.onProgress(msg.writtenRows);
            } else if (msg.type === "DONE" && resolveEnd) {
//          } else if (msg.type === "DONE" && resolveEnd) {
                resolveEnd({ blobUrl: msg.blobUrl, totalRows: msg.totalRows, });
//              resolveEnd({ blobUrl: msg.blobUrl, totalRows: msg.totalRows, });
            }
//          }
        };
//      };
        const wrapper: CsvStreamWorker = {
//      const wrapper: CsvStreamWorker = {
            init(headers: string[]) {
//          init(headers: string[]) {
                worker.postMessage({ type: "INIT", headers, });
//              worker.postMessage({ type: "INIT", headers, });
            },
//          },
            writeChunk(rows: Record<string, any>[]) {
//          writeChunk(rows: Record<string, any>[]) {
                worker.postMessage({ type: "CHUNK", rows, });
//              worker.postMessage({ type: "CHUNK", rows, });
            },
//          },
            end() {
//          end() {
                return new Promise((resolve) => {
//              return new Promise((resolve) => {
                    resolveEnd = resolve;
//                  resolveEnd = resolve;
                    worker.postMessage({ type: "END", });
//                  worker.postMessage({ type: "END", });
                });
//              });
            },
//          },
            terminate() {
//          terminate() {
                worker.terminate();
//              worker.terminate();
            },
//          },
            onProgress: undefined,
//          onProgress: undefined,
        };
//      };
        return wrapper;
//      return wrapper;
    }
//  }
