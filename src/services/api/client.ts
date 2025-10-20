export const API_BASE =
    import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function api(path: string, init?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || res.statusText);
    }
    return res.json();
}
