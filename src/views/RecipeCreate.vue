<!-- src/views/RecipeCreate.vue -->
<template>
  <main class="container">
    <p>
      <RouterLink :to="{ name: 'home' }">← Zurück</RouterLink>
    </p>

    <h1>Neues Rezept anlegen</h1>

    <section v-if="err" class="errorbox">
      <strong>Fehler:</strong> {{ err }}
    </section>

    <form @submit.prevent="onSubmit" class="card">
      <div class="row">
        <label>Titel *</label>
        <input v-model.trim="title" type="text" required placeholder="z. B. Vegane Bowl" />
      </div>

      <div class="row">
        <label>Beschreibung</label>
        <textarea v-model.trim="description" rows="3" placeholder="Kurzbeschreibung"></textarea>
      </div>

      <div class="row two">
        <div>
          <label>Vorbereitung (min)</label>
          <input v-model.number="prepMinutes" type="number" min="0" />
        </div>
        <div>
          <label>Kochen (min)</label>
          <input v-model.number="cookMinutes" type="number" min="0" />
        </div>
      </div>

      <div class="row">
        <label>Kategorien (kommagetrennt)</label>
        <input v-model.trim="categoriesInput" type="text" placeholder="z. B. vegan,bowl,quick" />
      </div>

      <!-- Diet Tags -->
      <section class="row">
        <label>Baseline (max. 1)</label>
        <select v-model="baselineTag" class="select">
          <option value="">— keine —</option>
          <option v-for="b in BASELINE_OPTIONS" :key="b" :value="b">{{ b }}</option>
        </select>
        <small class="muted">Erlaubt ist höchstens eine Baseline.</small>
      </section>

      <section class="row">
        <label>Weitere Tags</label>
        <div class="checks">
          <label v-for="t in OTHER_OPTIONS" :key="t" class="check">
            <input type="checkbox" :value="t" v-model="otherTags" />
            <span>{{ t }}</span>
          </label>
        </div>
        <small class="muted">Wähle beliebig viele zusätzliche Tags.</small>
      </section>

      <hr />

      <!-- Zutaten -->
      <section>
        <div class="row header">
          <h2>Zutaten</h2>
          <button type="button" @click="addIngredient">+ Zutat</button>
        </div>

        <div v-if="ingredients.length === 0" class="muted">Noch keine Zutaten.</div>

        <div v-for="(ing, idx) in ingredients" :key="idx" class="row three">
          <input v-model.trim="ing.name" type="text" placeholder="Name (z. B. Tomate)" />
          <input v-model.number="ing.amount" type="number" min="0" step="0.1" placeholder="Menge" />

          <div class="unit-row">
            <select v-model="ing.unit" class="select unit">
              <option v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</option>
              <option value="__OTHER__">Andere…</option>
            </select>
            <input
                v-if="ing.unit === '__OTHER__'"
                v-model.trim="ing.customUnit"
                type="text"
                class="custom-unit"
                placeholder="z. B. Bund / Dose / Prise"
            />
            <button type="button" class="danger" @click="removeIngredient(idx)">Entfernen</button>
          </div>
        </div>
      </section>

      <hr />

      <!-- Schritte -->
      <section>
        <div class="row header">
          <h2>Schritte</h2>
          <button type="button" @click="addStep">+ Schritt</button>
        </div>

        <div v-if="steps.length === 0" class="muted">Noch keine Schritte.</div>

        <div v-for="(s, idx) in steps" :key="idx" class="row">
          <div class="row two">
            <div>
              <label>Position</label>
              <input v-model.number="s.position" type="number" min="1" />
            </div>
            <div class="stretch">
              <label>Text</label>
              <input v-model.trim="s.text" type="text" placeholder="z. B. Tomaten schneiden" />
            </div>
          </div>
          <button type="button" class="danger small" @click="removeStep(idx)">Entfernen</button>
        </div>
      </section>

      <hr />

      <div class="actions">
        <button type="submit" :disabled="submitting">
          {{ submitting ? "Speichere…" : "Anlegen" }}
        </button>
        <RouterLink :to="{ name: 'home' }" class="btn">Abbrechen</RouterLink>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  createRecipe,
  emptyRecipeCreate,
  type IngredientCreate,
  type StepCreate,
  type RecipeCreatePayload,
} from "@/services/api/recipes";

const router = useRouter();

// Optionen
const BASELINE_OPTIONS = ["VEGAN", "VEGETARIAN", "PESCETARIAN", "OMNIVORE"];
const OTHER_OPTIONS = [
  "GLUTEN_FREE",
  "LACTOSE_FREE", // ggf. zu DAIRY_FREE ändern, wenn dein Enum so heißt
  "NUT_FREE",
  "HALAL",
  "KOSHER",
  "LOW_CARB",
  "HIGH_PROTEIN",
  "LOW_FAT",
  "LOW_SUGAR",
  "NO_BAKE",
];
const UNIT_OPTIONS = ["g", "kg", "ml", "l", "Stueck", "EL", "TL", "Prise"];

type IngredientFormRow = IngredientCreate & { customUnit?: string };

const base = emptyRecipeCreate();

// States
const title = ref(base.title);
const description = ref(base.description ?? "");
const prepMinutes = ref(base.prepMinutes);
const cookMinutes = ref(base.cookMinutes);
const categoriesInput = ref("");

const baselineTag = ref<string>("");
const otherTags = ref<string[]>([]);

const ingredients = ref<IngredientFormRow[]>([]);
const steps = ref<StepCreate[]>([]);

const submitting = ref(false);
const err = ref<string | null>(null);

// Zutaten
function addIngredient() {
  ingredients.value.push({ name: "", amount: 0, unit: UNIT_OPTIONS[0] });
}
function removeIngredient(idx: number) {
  ingredients.value.splice(idx, 1);
}

// Schritte
function addStep() {
  const next = steps.value.length + 1;
  steps.value.push({ position: next, text: "" });
}
function removeStep(idx: number) {
  steps.value.splice(idx, 1);
}

async function onSubmit() {
  err.value = null;

  if (!title.value.trim()) {
    err.value = "Titel ist erforderlich.";
    return;
  }

  const dietTags: string[] = [];
  if (baselineTag.value) dietTags.push(baselineTag.value.toUpperCase());
  for (const t of otherTags.value) dietTags.push(t.toUpperCase());

  const baselineCount = dietTags.filter((t) => BASELINE_OPTIONS.includes(t)).length;
  if (baselineCount > 1) {
    err.value = "Maximal ein BASELINE-Tag erlaubt.";
    return;
  }

  const normalizedIngredients: IngredientCreate[] = ingredients.value
      .filter((i) => i.name.trim())
      .map((i) => {
        const unit =
            i.unit === "__OTHER__"
                ? (i.customUnit?.trim() || "")
                : (i.unit?.trim() || "");
        return {
          name: i.name.trim(),
          amount: Number(i.amount) || 0,
          unit,
        };
      });

  const payload: RecipeCreatePayload = {
    title: title.value.trim(),
    description: description.value?.trim() ?? "",
    prepMinutes: Number(prepMinutes.value) || 0,
    cookMinutes: Number(cookMinutes.value) || 0,
    dietTags,
    categories: categoriesInput.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ingredients: normalizedIngredients,
    steps: steps.value
        .filter((s) => s.text.trim())
        .map((s) => ({ position: Number(s.position) || 1, text: s.text.trim() })),
  };

  submitting.value = true;
  try {
    const res = await createRecipe(payload);
    await router.push({ name: "recipe-detail", params: { id: res.id } });
  } catch (e: any) {
    err.value = e?.message ?? "Unbekannter Fehler beim Anlegen.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.card {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
}
h1 { margin: 0 0 12px; }

.row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.row.two { flex-direction: row; gap: 12px; }
.row.two > * { flex: 1; }
.row.three { display: grid; grid-template-columns: 1fr 140px 1fr; gap: 8px; align-items: center; }
.header { align-items: center; justify-content: space-between; flex-direction: row; }

label { font-weight: 600; }
input, textarea, select {
  border: 1px solid #ddd; border-radius: 10px; padding: 8px; font: inherit;
}
.select { max-width: 260px; }
.unit-row { display: flex; gap: 8px; align-items: center; }
.unit { width: 140px; }
.custom-unit { width: 180px; }

.checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px 12px; }
.check { display: flex; gap: 8px; align-items: center; }

.muted { color: #666; }
hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }

.actions { display: flex; gap: 12px; align-items: center; }
button, .btn {
  border: 1px solid #ddd; background: #fff; border-radius: 10px;
  padding: 8px 12px; cursor: pointer; text-decoration: none;
}
button:hover, .btn:hover { background: #f6f6f6; }
button.danger { border-color: #f0bcbc; color: #8a1e1e; }
.small { padding: 6px 10px; }

.errorbox {
  border: 1px solid #f2c5c5;
  background: #fff5f5;
  color: #7a1f1f;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}
</style>
