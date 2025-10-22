<!-- src/views/RecipeList.vue -->
<template>
  <main class="container">
    <header class="list-header">
      <h1>Rezepte</h1>
      <RouterLink :to="{ name: 'recipe-create' }" class="btn">+ Neues Rezept</RouterLink>
    </header>

    <section class="toolbar">
      <input
          v-model.trim="qInput"
          type="text"
          placeholder="Suche (Titel/Beschreibung/Kategorien)"
          :disabled="loading"
      />
      <button @click="applySearch" :disabled="loading">Suchen</button>
      <button v-if="qInput" @click="resetSearch" :disabled="loading" class="ghost">Zurücksetzen</button>
    </section>

    <section v-if="loading" class="muted">Lade…</section>

    <section v-else-if="err" class="errorbox">
      <strong>Fehler:</strong> {{ err }}
    </section>

    <section v-else>
      <div class="muted" v-if="recipes.length === 0">
        <template v-if="debouncedQ">Keine Treffer für „{{ debouncedQ }}“.</template>
        <template v-else>Keine Rezepte gefunden.</template>
      </div>

      <ul class="cards" v-else>
        <li v-for="r in recipes" :key="r.id" class="card">
          <header class="card-head">
            <RouterLink :to="{ name: 'recipe-detail', params: { id: r.id } }" class="title-link">
              <h2 class="title">{{ r.title }}</h2>
            </RouterLink>
            <div class="total">{{ r.totalMinutes }} min</div>
          </header>

          <p class="desc" v-if="r.description">{{ r.description }}</p>

          <div v-if="r.categories?.length" class="chips">
            <span class="chip chip--category" v-for="c in r.categories" :key="c">{{ c }}</span>
          </div>

          <div v-if="r.baselineTag" class="chips">
            <span class="chip chip--baseline">{{ tagLabel(r.baselineTag) }}</span>
          </div>
          <div class="chips">
            <span
                class="chip"
                v-for="t in r.dietTags.filter(t => t !== r.baselineTag)"
                :key="t"
            >{{ tagLabel(t) }}</span>
          </div>
        </li>
      </ul>

      <div class="pager" v-if="hasPaging">
        <button :disabled="page === 0 || loading" @click="prevPage">← Zurück</button>
        <span>Seite {{ page + 1 }} / {{ totalPages ?? 1 }}</span>
        <span v-if="totalElements != null" class="muted">({{ totalElements }} Treffer)</span>
        <button :disabled="last || loading" @click="nextPage">Weiter →</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { listRecipes, type Recipe } from '@/services/api/recipes'
import { tagLabel } from '@/services/ui/dietTagLabels'

const router = useRouter()
const route = useRoute()

// Query-State
const qInput = ref<string>((route.query.q as string) ?? '')
const debouncedQ = ref<string>(qInput.value)
const page = ref<number>(Number(route.query.page ?? 0))
const size = ref<number>(Number(route.query.size ?? 10))
const sort = ref<string>((route.query.sort as string) ?? 'id,desc') // default: neueste zuerst

// Data
const loading = ref(true)
const err = ref<string | null>(null)
const recipes = ref<Recipe[]>([])
const totalElements = ref<number | null>(null)
const totalPages = ref<number | null>(null)
const last = ref<boolean>(false)

const hasPaging = computed(() => totalPages.value != null)

// Debounce der Suche (350 ms)
let t: number | undefined
watch(qInput, (val) => {
  window.clearTimeout(t)
  t = window.setTimeout(() => {
    debouncedQ.value = val || ''
    // bei neuer Suche zurück auf Seite 0
    page.value = 0
    reload()
  }, 350)
})

// manuelles Anwenden (Enter/Click)
function applySearch() {
  window.clearTimeout(t)
  debouncedQ.value = qInput.value || ''
  page.value = 0
  reload()
}

// Reset-Button
function resetSearch() {
  qInput.value = ''
  applySearch()
}

async function reload() {
  loading.value = true
  err.value = null
  try {
    const res = await listRecipes({
      q: debouncedQ.value || undefined,
      page: Number.isFinite(page.value) ? page.value : undefined,
      size: Number.isFinite(size.value) ? size.value : undefined,
      sort: sort.value || undefined,
    })
    recipes.value = (res as any).content ?? (res as unknown as Recipe[])
    totalElements.value = (res as any).totalElements ?? null
    totalPages.value = (res as any).totalPages ?? null
    last.value = (res as any).last ?? false

    // Query-Sync
    const qp: Record<string, any> = {}
    if (debouncedQ.value) qp.q = debouncedQ.value
    if (totalPages.value != null) {
      qp.page = page.value
      qp.size = size.value
      qp.sort = sort.value
    }
    router.replace({ query: qp })
  } catch (e: any) {
    err.value = e?.message ?? 'Konnte Rezepte nicht laden.'
  } finally {
    loading.value = false
  }
}
function nextPage() { if (!last.value && !loading.value) { page.value += 1; reload() } }
function prevPage() { if (page.value > 0 && !loading.value) { page.value -= 1; reload() } }

onMounted(reload)
</script>

<style scoped>
.container { max-width: 980px; margin: 0 auto; padding: 16px; }
.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.btn { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; text-decoration: none; }
.btn:hover { background: #f6f6f6; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.toolbar input { flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 8px; font: inherit; }
.toolbar button { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.toolbar button:hover { background: #f6f6f6; }
.toolbar .ghost { background: transparent; border-style: dashed; }
.cards { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.card { border: 1px solid #eee; border-radius: 16px; padding: 16px; background: #fff; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title { margin: 0; font-size: 18px; }
.title-link { text-decoration: none; color: inherit; }
.title-link:hover { text-decoration: underline; }
.total { color: #333; font-weight: 600; }
.desc { color: #555; margin: 6px 0 8px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0; }
.chip { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 12px; border: 1px solid #e2e2e2; background: #fafafa; }
.chip--baseline { border-color: #c2e7c5; background: #f3fff4; }
.chip--category { border-color: #dbe3ff; background: #f5f8ff; }
.pager { display: flex; gap: 12px; align-items: center; justify-content: center; margin: 16px 0 8px; }
.pager button { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 6px 10px; cursor: pointer; }
.pager button:hover { background: #f6f6f6; }
.muted { color: #666; }
.errorbox { border: 1px solid #f2c5c5; background: #fff5f5; color: #7a1f1f; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
</style>
