<template>
  <main class="container">
    <p>
      <RouterLink :to="{ name: 'recipe-detail', params: { id } }">← Zurück zur Detailansicht</RouterLink>
    </p>

    <h1>Rezept bearbeiten</h1>

    <section v-if="loading" class="muted">Lade…</section>

    <section v-if="err" class="errorbox">
      <strong>Fehler:</strong> {{ err }}
    </section>

    <form v-if="!loading" @submit.prevent="onSave" class="card">
      <div class="row">
        <label>Titel *</label>
        <input v-model.trim="title" type="text" required />
        <p v-if="fe('title')" class="field-error">{{ fe('title') }}</p>
      </div>

      <div class="row">
        <label>Beschreibung</label>
        <textarea v-model.trim="description" rows="3"></textarea>
        <p v-if="fe('description')" class="field-error">{{ fe('description') }}</p>
      </div>

      <div class="row two">
        <div>
          <label>Vorbereitung (min)</label>
          <input v-model.number="prepMinutes" type="number" min="0" />
          <p v-if="fe('prepMinutes')" class="field-error">{{ fe('prepMinutes') }}</p>
        </div>
        <div>
          <label>Kochen (min)</label>
          <input v-model.number="cookMinutes" type="number" min="0" />
          <p v-if="fe('cookMinutes')" class="field-error">{{ fe('cookMinutes') }}</p>
        </div>
      </div>

      <div class="row">
        <label>Kategorien (kommagetrennt)</label>
        <input v-model.trim="categoriesInput" type="text" />
        <p v-if="fe('categories')" class="field-error">{{ fe('categories') }}</p>
      </div>

      <section class="row">
        <label>Baseline (max. 1)</label>
        <select v-model="baselineTag" class="select">
          <option value="">— keine —</option>
          <option v-for="b in BASELINE_OPTIONS" :key="b" :value="b">{{ b }}</option>
        </select>
        <p v-if="fe('dietTags')" class="field-error">{{ fe('dietTags') }}</p>
      </section>

      <section class="row">
        <label>Weitere Tags</label>
        <div class="checks">
          <label v-for="t in OTHER_OPTIONS" :key="t" class="check">
            <input type="checkbox" :value="t" v-model="otherTags" />
            <span>{{ t }}</span>
          </label>
        </div>
      </section>

      <hr />

      <!-- Zutaten -->
      <section>
        <div class="row header">
          <h2>Zutaten</h2>
          <button type="button" @click="addIngredient" :disabled="saving">+ Zutat</button>
        </div>

        <div v-for="(ing, idx) in ingredients" :key="idx" class="row three">
          <div>
            <input v-model.trim="ing.name" type="text" placeholder="Name" />
            <p v-if="fe(`ingredients[${idx}].name`)" class="field-error">{{ fe(`ingredients[${idx}].name`) }}</p>
          </div>
          <div>
            <input
                v-model.number="ing.amount"
                type="number"
                min="0.0001"
                step="0.1"
                placeholder="Menge"
                :class="{ invalid: amountError(ing) }"
            />
            <!-- Client-Fehler -->
            <p v-if="amountError(ing)" class="field-error">{{ amountError(ing) }}</p>
            <!-- Backend-Fehler -->
            <p v-if="fe(`ingredients[${idx}].amount`)" class="field-error">{{ fe(`ingredients[${idx}].amount`) }}</p>
          </div>
          <div class="unit-row">
            <select v-model="ing.unit" class="select unit">
              <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>
          <p v-if="fe(`ingredients[${idx}].unit`)" class="field-error">{{ fe(`ingredients[${idx}].unit`) }}</p>
        </div>
        <p v-if="fe('ingredients')" class="field-error">{{ fe('ingredients') }}</p>
      </section>

      <hr />

      <!-- Schritte -->
      <section>
        <div class="row header">
          <h2>Schritte</h2>
          <button type="button" @click="addStep" :disabled="saving">+ Schritt</button>
        </div>

        <div v-for="(s, idx) in steps" :key="idx" class="row">
          <div class="row two">
            <div>
              <label>Position</label>
              <input v-model.number="s.position" type="number" min="1" />
              <p v-if="fe(`steps[${idx}].position`)" class="field-error">{{ fe(`steps[${idx}].position`) }}</p>
            </div>
            <div class="stretch">
              <label>Text</label>
              <input v-model.trim="s.text" type="text" />
              <p v-if="fe(`steps[${idx}].text`)" class="field-error">{{ fe(`steps[${idx}].text`) }}</p>
            </div>
          </div>
          <button type="button" class="danger small" @click="removeStep(idx)" :disabled="saving">Entfernen</button>
        </div>
        <p v-if="fe('steps')" class="field-error">{{ fe('steps') }}</p>
      </section>

      <hr />

      <div class="actions">
        <button type="submit" :disabled="formDisabled">{{ saving ? "Speichere…" : "Speichern" }}</button>
        <button type="button" class="danger" :disabled="deleting || saving" @click="onDelete">
          {{ deleting ? "Lösche…" : "Löschen" }}
        </button>
        <RouterLink :to="{ name: 'recipe-detail', params: { id } }" class="btn">Abbrechen</RouterLink>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  getRecipe,
  deleteRecipe,
  updateRecipeBase,
  replaceIngredients,
  replaceSteps,
  type IngredientCreate,
  type StepCreate,
  type DietTag,
} from '@/services/api/recipes'
import { getUnits } from '@/services/api/meta'
import { extractFieldErrors, firstError, type FieldErrors } from '@/services/ui/formErrors'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const BASELINE_OPTIONS = ['VEGAN', 'VEGETARIAN', 'PESCETARIAN', 'OMNIVORE'] as const
const OTHER_OPTIONS = [
  'GLUTEN_FREE','LACTOSE_FREE','SOY_FREE','EGG_FREE','SHELLFISH_FREE','SESAME_FREE','PEANUT_FREE','LOW_FODMAP',
  'LOW_CARB','HIGH_PROTEIN','LOW_FAT','LOW_SUGAR','NO_ADDED_SUGAR','KETO','PALEO','HIGH_FIBER','LOW_SODIUM',
  'HALAL','KOSHER','NO_BAKE','AIR_FRYER','INSTANT_POT','ONE_POT','MEAL_PREP','SPICY','ALCOHOL_FREE'
] as const
const OTHER_OPTIONS_TYPED = OTHER_OPTIONS as readonly DietTag[]

const unitOptions = ref<string[]>([]) // Enum-Werte aus Backend
type IngredientFormRow = IngredientCreate

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const err = ref<string | null>(null)
const fieldErrors = ref<FieldErrors>({})

const title = ref('')
const description = ref('')
const prepMinutes = ref(0)
const cookMinutes = ref(0)
const categoriesInput = ref('')

const baselineTag = ref<'' | DietTag>('')     // 0..1
const otherTags = ref<DietTag[]>([])          // mehrere

const ingredients = ref<IngredientFormRow[]>([])
const steps = ref<StepCreate[]>([])

onMounted(async () => {
  // Units laden
  try {
    unitOptions.value = await getUnits()
  } catch {
    unitOptions.value = ["G","KG","ML","L","TL","EL","CUP","STUECK","PRISE"]
  }

  try {
    const r = await getRecipe(id)
    title.value = r.title
    description.value = r.description ?? ''
    prepMinutes.value = r.prepMinutes ?? 0
    cookMinutes.value = r.cookMinutes ?? 0
    categoriesInput.value = (r.categories ?? []).join(',')

    baselineTag.value = (r.baselineTag ?? '') as '' | DietTag
    otherTags.value = (r.dietTags ?? []).filter(
        (t): t is DietTag => t !== r.baselineTag && OTHER_OPTIONS_TYPED.includes(t as DietTag)
    )

    // vorhandene Einheiten übernehmen
    ingredients.value = (r.ingredients ?? []).map((i) => {
      const u = String(i.unit || '')
      if (u && !unitOptions.value.includes(u)) unitOptions.value.push(u) // defensiv
      return { name: i.name, amount: Number(i.amount ?? 0), unit: u }
    })

    steps.value = (r.steps ?? [])
        .map((s) => ({ position: Math.max(1, Number(s.position ?? 1)), text: s.text ?? '' }))
        .sort((a, b) => a.position - b.position)
  } catch (e: any) {
    const { message } = extractFieldErrors(e)
    err.value = message || 'Konnte Rezept nicht laden.'
  } finally {
    loading.value = false
  }
})

function addIngredient() {
  const def = unitOptions.value[0] ?? "G"
  ingredients.value.push({ name: '', amount: 0, unit: def })
}
function removeIngredient(idx: number) { ingredients.value.splice(idx, 1) }

function addStep() {
  const last = steps.value.length ? steps.value[steps.value.length - 1] : undefined
  const next = (last?.position ?? steps.value.length) + 1
  steps.value.push({ position: next, text: '' })
}
function removeStep(idx: number) { steps.value.splice(idx, 1) }

function fe(path: string) { return firstError(fieldErrors.value, path) }

// Client-Validierung: amount > 0 in ALLEN Zutaten
function amountError(i: IngredientFormRow): string | null {
  const a = Number(i?.amount)
  return a > 0 ? null : 'Menge muss > 0 sein'
}
const hasInvalidAmounts = computed(() => ingredients.value.some(i => !!amountError(i)))
const titleBlank = computed(() => !title.value.trim())
const formDisabled = computed(() => saving.value || deleting.value || titleBlank.value || hasInvalidAmounts.value)

async function onSave() {
  err.value = null
  fieldErrors.value = {}

  if (titleBlank.value) { err.value = 'Titel ist erforderlich.'; return }
  if (hasInvalidAmounts.value) { err.value = 'Bitte alle Mengen > 0 angeben.'; return }

  const dietTags: DietTag[] = []
  if (baselineTag.value) dietTags.push(baselineTag.value as DietTag)
  const cleanedOthers = Array.from(new Set(otherTags.value)).filter(t => OTHER_OPTIONS_TYPED.includes(t))
  dietTags.push(...cleanedOthers)
  const baselineCount = dietTags.filter((t) => (BASELINE_OPTIONS as readonly string[]).includes(t as any)).length
  if (baselineCount > 1) { err.value = 'Maximal ein BASELINE-Tag erlaubt.'; return }

  const categories = Array.from(new Set(
      categoriesInput.value.split(',').map(s => s.trim()).filter(Boolean)
  ))

  const normalizedIngredients: IngredientCreate[] = ingredients.value
      .filter(i => i.name && i.name.trim())
      .map(i => ({
        name: i.name.trim(),
        amount: Number(i.amount) || 0,
        unit: (i.unit || '').trim()
      }))

  const normalizedSteps: StepCreate[] = steps.value
      .filter(s => s.text && s.text.trim())
      .map(s => ({ position: Math.max(1, Number(s.position) || 1), text: s.text.trim() }))
      .sort((a, b) => a.position - b.position)

  saving.value = true
  try {
    await updateRecipeBase(id, {
      title: title.value.trim(),
      description: description.value?.trim() ?? '',
      prepMinutes: Number(prepMinutes.value) || 0,
      cookMinutes: Number(cookMinutes.value) || 0,
      dietTags,
      categories
    })
    await replaceIngredients(id, normalizedIngredients)
    await replaceSteps(id, normalizedSteps)
    await router.push({ name: 'recipe-detail', params: { id } })
  } catch (e: any) {
    const { message, fields } = extractFieldErrors(e)
    err.value = message || 'Speichern fehlgeschlagen.'
    fieldErrors.value = fields
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!confirm('Dieses Rezept wirklich löschen?')) return
  deleting.value = true
  err.value = null
  try {
    await deleteRecipe(id)
    await router.push({ name: 'home' })
  } catch (e: any) {
    const { message } = extractFieldErrors(e)
    err.value = message || 'Löschen fehlgeschlagen.'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.card { border: 1px solid #eee; border-radius: 16px; padding: 20px; background: #fff; }
h1 { margin: 0 0 12px; }
.row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.row.two { flex-direction: row; gap: 12px; }
.row.two > * { flex: 1; }
.row.three { display: grid; grid-template-columns: 1fr 140px 1fr; gap: 8px; align-items: center; }
.header { align-items: center; justify-content: space-between; flex-direction: row; }
label { font-weight: 600; }
input, textarea, select { border: 1px solid #ddd; border-radius: 10px; padding: 8px; font: inherit; }
input.invalid { border-color: #e08a8a; background: #fff7f7; }
.select { max-width: 260px; }
.unit-row { display: flex; gap: 8px; align-items: center; }
.unit { width: 140px; }
.checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px 12px; }
.check { display: flex; gap: 8px; align-items: center; }
.muted { color: #666; }
hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
.actions { display: flex; gap: 12px; align-items: center; }
button, .btn { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; text-decoration: none; }
button[disabled] { opacity: .6; cursor: not-allowed; }
button:hover:not([disabled]), .btn:hover { background: #f6f6f6; }
button.danger { border-color: #f0bcbc; color: #8a1e1e; }
.small { padding: 6px 10px; }
.errorbox { border: 1px solid #f2c5c5; background: #fff5f5; color: #7a1e1f; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.field-error { color: #8a1e1e; font-size: 12px; margin: 2px 0 0; }
</style>
