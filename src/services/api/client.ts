
export const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8080").replace(/\/+$/, "");

// Strukturiertes Fehlerobjekt für UI-Handling
export class ApiError extends Error {
    status: number;
    violations?: Array<{ field: string; message: string }>;
    raw?: unknown;

    constructor(message: string, status: number, violations?: Array<{ field: string; message: string }>, raw?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.violations = violations;
        this.raw = raw;
    }
}
export function isApiError(e: unknown): e is ApiError {
    return e instanceof ApiError;
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        // Versuche, eine JSON-Fehlerantwort zu lesen
        let message = `${res.status} ${res.statusText}`;
        let violations: Array<{ field: string; message: string }> | undefined;
        let raw: unknown;

        try {
            raw = await res.json();
            // Erwartetes Backend-Format (GlobalExceptionHandler)
            const m = (raw as any)?.message;
            if (typeof m === "string" && m.trim()) message = m;
            const v = (raw as any)?.violations;
            if (Array.isArray(v)) {
                violations = v
                    .map(x => (x && typeof x === "object" ? { field: String((x as any).field ?? ""), message: String((x as any).message ?? "") } : null))
                    .filter(Boolean) as Array<{ field: string; message: string }>;
            }
        } catch {
            // kein JSON, versuche Text
            try {
                const t = await res.text();
                if (t && t.trim()) message = t.trim();
            } catch {
                /* ignore */
            }
        }
        throw new ApiError(message, res.status, violations, raw);
    }

    if (res.status === 204) {
        // @ts-expect-error: call sites erwarten ggf. null/void
        return null;
    }
    // Safeguard: leere Antwort
    const text = await res.text();
    if (!text) {
        // @ts-expect-error: call sites erwarten ggf. null/void
        return null;
    }
    return JSON.parse(text) as T;
}

export async function api<T>(path: string, init?: RequestInit & { query?: Record<string, any> }): Promise<T> {
    const url = buildUrl(path, init?.query);
    const headers: HeadersInit = new Headers(init?.headers ?? {});
    // Content-Type nur setzen, wenn noch nicht gesetzt und body kein FormData ist
    const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
    if (!isForm && !headersHas(headers, "Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const res = await fetch(url, { ...init, headers });
    return handleResponse<T>(res);
}

function headersHas(h: HeadersInit, key: string): boolean {
    const k = key.toLowerCase();
    if (h instanceof Headers) return h.has(key);
    if (Array.isArray(h)) return h.some(([kk]) => String(kk).toLowerCase() === k);
    if (h && typeof h === "object") return Object.keys(h).some(kk => kk.toLowerCase() === k);
    return false;
}

// Bequeme Shortcuts
export const http = {
    get:  <T>(path: string, query?: Record<string, any>, init?: RequestInit) =>
        api<T>(path, { ...init, method: "GET", query }),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
        api<T>(path, { ...init, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
    put:  <T>(path: string, body?: unknown, init?: RequestInit) =>
        api<T>(path, { ...init, method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
    del:  <T>(path: string, init?: RequestInit) =>
        api<T>(path, { ...init, method: "DELETE" }),
};
