    export interface CsvWorkerRequest {
//  export interface CsvWorkerRequest {
        rows: Record<string, any>[];
//      rows: Record<string, any>[];
        headers?: string[];
//      headers?: string[];
    }
//  }
    export function generateCsvInWorker(request: CsvWorkerRequest): Promise<string> {
//  export function generateCsvInWorker(request: CsvWorkerRequest): Promise<string> {
        return new Promise((resolve, reject) => {
//      return new Promise((resolve, reject) => {
            // Create worker (Vite will handle bundling)
            // Create worker (Vite will handle bundling)
            const worker: Worker = new Worker(new URL("./csvWorker.ts", import.meta.url), { type: "module" });
//          const worker: Worker = new Worker(new URL("./csvWorker.ts", import.meta.url), { type: "module" });
            worker.onmessage = (e: MessageEvent<any>) => {
//          worker.onmessage = (e: MessageEvent<any>) => {
                if (e.data.type === "CSV_READY") {
//              if (e.data.type === "CSV_READY") {
                    resolve(e.data.csv);
//                  resolve(e.data.csv);
                    worker.terminate();
//                  worker.terminate();
                }
//              }
            };
//          };
            worker.onerror = (err: ErrorEvent) => {
//          worker.onerror = (err: ErrorEvent) => {
                reject(err);
//              reject(err);
                worker.terminate();
//              worker.terminate();
            };
//          };
            worker.postMessage({ type: "GENERATE_CSV", payload: request });
//          worker.postMessage({ type: "GENERATE_CSV", payload: request });
        });
//      });
    }
//  }
    export function downloadBlob(filename: string, content: string, mime = "text/csv;charset=utf-8;"): void {
//  export function downloadBlob(filename: string, content: string, mime = "text/csv;charset=utf-8;"): void {
        const blob: Blob = new Blob([content], { type: mime });
//      const blob: Blob = new Blob([content], { type: mime });
        const url: string = URL.createObjectURL(blob);
//      const url: string = URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement("a");
//      const a: HTMLAnchorElement = document.createElement("a");
        a.href = url;
//      a.href = url;
        a.download = filename;
//      a.download = filename;
        a.click();
//      a.click();
        URL.revokeObjectURL(url);
//      URL.revokeObjectURL(url);
    }
//  }
