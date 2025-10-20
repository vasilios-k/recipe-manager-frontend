const BASE = import.meta.env.VITE_API_BASE as string;

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    // 204: kein Body
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
