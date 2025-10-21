import type { DietTag } from "@/services/api/recipes";

export const DIET_TAG_LABEL: Record<DietTag, string> = {
    VEGAN: "Vegan",
    VEGETARIAN: "Vegetarisch",
    PESCETARIAN: "Pescetarisch",
    OMNIVORE: "Omnivor",

    GLUTEN_FREE: "Glutenfrei",
    LACTOSE_FREE: "Laktosefrei",
    SOY_FREE: "Sojafrei",
    EGG_FREE: "Eifrei",
    SHELLFISH_FREE: "Schalentierfrei",
    SESAME_FREE: "Sesamfrei",
    PEANUT_FREE: "Erdnussfrei",
    LOW_FODMAP: "Low-FODMAP",

    LOW_CARB: "Low-Carb",
    HIGH_PROTEIN: "Proteinreich",
    LOW_FAT: "Fettarm",
    LOW_SUGAR: "Zuckerarm",
    NO_ADDED_SUGAR: "Ohne zugesetzten Zucker",
    KETO: "Keto",
    PALEO: "Paleo",
    HIGH_FIBER: "Ballaststoffreich",
    LOW_SODIUM: "Natriumarm",

    HALAL: "Halal",
    KOSHER: "Koscher",
    NO_BAKE: "Ohne Backen",
    AIR_FRYER: "Airfryer",
    INSTANT_POT: "Schnellkochtopf",
    ONE_POT: "One-Pot",
    MEAL_PREP: "Meal Prep",
    SPICY: "Scharf",
    ALCOHOL_FREE: "Alkoholfrei",
};

export function tagLabel(tag: DietTag): string {
    return DIET_TAG_LABEL[tag] ?? tag;
}
