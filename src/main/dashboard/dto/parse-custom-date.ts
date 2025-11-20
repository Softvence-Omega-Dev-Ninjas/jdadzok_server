import { DateTime } from "luxon";

export function parseCustomDate(input: string): Date | null {
    // Expected format: "DD-MM-h.mm AM/PM"
    const dt = DateTime.fromFormat(input, "dd-MM-h.mm a", { zone: "Asia/Dhaka" });
    return dt.isValid ? dt.toJSDate() : null;
}

export function formatCustomDate(date: Date): string {
    return DateTime.fromJSDate(date).toFormat("dd-MM-h.mm a");
}
