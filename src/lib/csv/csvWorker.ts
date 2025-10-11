/// <reference lib="webworker" />
/// <reference lib="webworker" />
// Define message types for clarity
// Define message types for clarity
    interface WorkerRequest {
//  interface WorkerRequest {
        type: 'GENERATE_CSV';
//      type: 'GENERATE_CSV';
        payload: {
//      payload: {
            rows: Record<string, any>[];
//          rows: Record<string, any>[];
            headers?: string[];
//          headers?: string[];
        };
//      };
    }
//  }
    interface WorkerResponse {
//  interface WorkerResponse {
        type: 'CSV_READY';
//      type: 'CSV_READY';
        csv: string;
//      csv: string;
    }
//  }
/** Escape field for CSV */
/** Escape field for CSV */
    function escapeField(value: string): string {
//  function escapeField(value: string): string {
        if (value == null) {
//      if (value == null) {
            return '';
//          return '';
        }
//      }
        const s: string = String(value);
//      const s: string = String(value);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
//      if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            return `"${s.replace(/"/g, '""')}"`;
//          return `"${s.replace(/"/g, '""')}"`;
        }
//      }
        return s;
//      return s;
    }
//  }
    function objectsToCsv(rows: Record<string, any>[], headers?: string[]): string {
//  function objectsToCsv(rows: Record<string, any>[], headers?: string[]): string {
        if (!rows || rows.length === 0) {
//      if (!rows || rows.length === 0) {
            return '';
//          return '';
        }
//      }
        const keys: string[] = headers ?? Object.keys(rows[0]);
//      const keys: string[] = headers ?? Object.keys(rows[0]);
        const headerLine: string = keys.map(escapeField).join(',');
//      const headerLine: string = keys.map(escapeField).join(',');
        const lines: string[] = rows.map((row) => keys.map((k) => escapeField(row[k])).join(','));
//      const lines: string[] = rows.map((row) => keys.map((k) => escapeField(row[k])).join(','));
        return '\uFEFF' + [headerLine, ...lines].join('\r\n');
//      return '\uFEFF' + [headerLine, ...lines].join('\r\n');
    }
//  }
// Main worker message handler
// Main worker message handler
    self.onmessage = (e: MessageEvent<WorkerRequest>) => {
//  self.onmessage = (e: MessageEvent<WorkerRequest>) => {
        const { type, payload, }: WorkerRequest = e.data;
//      const { type, payload, }: WorkerRequest = e.data;
        if (type === 'GENERATE_CSV') {
//      if (type === 'GENERATE_CSV') {
            const csv: string = objectsToCsv(payload.rows, payload.headers);
//          const csv: string = objectsToCsv(payload.rows, payload.headers);
            const response: WorkerResponse = { type: 'CSV_READY', csv };
//          const response: WorkerResponse = { type: 'CSV_READY', csv };
            self.postMessage(response);
//          self.postMessage(response);
        }
//      }
    };
//  };
