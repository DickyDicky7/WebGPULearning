    export function getDetailedTimestamp(): string {
//  export function getDetailedTimestamp(): string {
        const now: Date = new Date();
//      const now: Date = new Date();
        const year: number = now.getFullYear();
//      const year: number = now.getFullYear();
        const month: string = String(now.getMonth() + 1).padStart(2, "0");
//      const month: string = String(now.getMonth() + 1).padStart(2, "0");
        const day: string = String(now.getDate()).padStart(2, "0");
//      const day: string = String(now.getDate()).padStart(2, "0");
        const hours: string = String(now.getHours()).padStart(2, "0");
//      const hours: string = String(now.getHours()).padStart(2, "0");
        const minutes: string = String(now.getMinutes()).padStart(2, "0");
//      const minutes: string = String(now.getMinutes()).padStart(2, "0");
        const seconds: string = String(now.getSeconds()).padStart(2, "0");
//      const seconds: string = String(now.getSeconds()).padStart(2, "0");
        const milliseconds: string = String(now.getMilliseconds()).padStart(3, "0");
//      const milliseconds: string = String(now.getMilliseconds()).padStart(3, "0");
        // timezone offset (e.g. +0700)
        // timezone offset (e.g. +0700)
        const offset: number = -now.getTimezoneOffset();
//      const offset: number = -now.getTimezoneOffset();
        const sign: "+" | "-" = offset >= 0 ? "+" : "-";
//      const sign: "+" | "-" = offset >= 0 ? "+" : "-";
        const offsetHours: string = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
//      const offsetHours: string = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
        const offsetMinutes: string = String(Math.abs(offset) % 60).padStart(2, "0");
//      const offsetMinutes: string = String(Math.abs(offset) % 60).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}${offsetMinutes}`;
//      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}${offsetMinutes}`;
    }
//  }
