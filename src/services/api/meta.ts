import { http } from "@/services/api/client";

/** Liefert Enum-Strings aus dem Backend, z. B. ["G","KG","ML","L","TL","EL","CUP","STUECK","PRISE"] */
export function getUnits(): Promise<string[]> {
    return http.get<string[]>("/meta/units");
}
