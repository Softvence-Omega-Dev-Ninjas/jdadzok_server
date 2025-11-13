// src/utils/api-response.ts
export class ApiResponse {
    static success(message: string, data?: any) {
        return { status: "success", message, data };
    }

    static error(message: string, error?: string) {
        return { status: "error", message, error };
    }
}
