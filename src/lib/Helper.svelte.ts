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

    export async function loadPublicFileAsFile(path: string, name?: string): Promise<File> {
//  export async function loadPublicFileAsFile(path: string, name?: string): Promise<File> {
        const response: Response = await fetch(path);
//      const response: Response = await fetch(path);
        const blob: Blob = await response.blob();
//      const blob: Blob = await response.blob();
        const filename: string = name ?? path.split("/").pop() ?? "file.bin"; // Use the provided name or infer from the URL
//      const filename: string = name ?? path.split("/").pop() ?? "file.bin"; // Use the provided name or infer from the URL
        return new File([blob], filename, { type: blob.type || "application/octet-stream", });
//      return new File([blob], filename, { type: blob.type || "application/octet-stream", });
    }
//  }

//  // Example usage:
//  // Example usage:
//  const file: File = await loadPublicFileAsFile("/weights/model.bin");
//  const file: File = await loadPublicFileAsFile("/weights/model.bin");
//  console.log(file.name, file.size, file.type);
//  console.log(file.name, file.size, file.type);
