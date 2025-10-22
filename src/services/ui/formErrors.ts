// src/services/ui/formErrors.ts
import { isApiError, ApiError } from "@/services/api/client";

export type FieldErrors = Record<string, string[]>;

export function extractFieldErrors(err: unknown): { message: string; fields: FieldErrors } {
    let message = "Fehler";
    const fields: FieldErrors = {};
    if (isApiError(err)) {
        message = err.message || message;
        const v = err.violations ?? [];
        for (const item of v) {
            const key = normalizePath(item.field ?? "");
            if (!key) continue;
            if (!fields[key]) fields[key] = [];
            fields[key].push(item.message || "Ungültiger Wert");
        }
    } else if (err instanceof Error) {
        message = err.message;
    }
    return { message, fields };
}

/** Macht aus "ingredients[0].name" z. B. genau den gleichen Schlüssel, den wir in der UI verwenden */
function normalizePath(p: string): string {
    // akzeptiere bereits "ingredients[0].name" oder "steps[1].position" oder "title"
    return (p || "").trim();
}

/** Hilfsfunktion um die erste Fehlermeldung eines Felds zu holen */
export function firstError(fields: FieldErrors, path: string): string | null {
    const arr = fields[path];
    return arr && arr.length ? arr[0] : null;
}
