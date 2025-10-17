// Fällt zurück auf lokales Backend, wenn VITE_API_BASE nicht gesetzt ist
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function getRecipes() {
    const res = await fetch(`${API_BASE}/recipes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
