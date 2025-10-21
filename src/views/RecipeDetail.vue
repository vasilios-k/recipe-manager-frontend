<!-- src/views/RecipeDetail.vue -->
<template>
  <main class="container">
    <p>
      <RouterLink :to="{ name: 'home' }">← Zurück zur Liste</RouterLink>
    </p>

    <section v-if="loading" class="muted">Lade…</section>

    <section v-else-if="err" class="errorbox">
      <strong>Fehler:</strong> {{ err }}
    </section>

    <section v-else class="card">
      <header class="header">
        <h1 class="title">{{ recipe.title }}</h1>
        <div class="actions">
          <RouterLink
              :to="{ name: 'recipe-edit', params: { id: recipe.id } }"
              class="btn"
          >
            Bearbeiten
          </RouterLink>
        </div>
      </header>

      <p v-if="recipe.description">{{ recipe.description }}</p>

      <div class="meta">
        <span>Vorbereitung: {{ recipe.prepMinutes }} min</span>
        <span>Kochen: {{ recipe.cookMinutes }} min</span>
        <span><strong>Gesamt: {{ recipe.totalMinutes }} min</strong></span>
      </div>

      <div v-if="recipe.categories?.length" class="chips">
        <span class="chip chip--category" v-for="c in recipe.categories" :key="c">{{ c }}</span>
      </div>

      <!-- Diet Tags -->
      <div v-if="recipe.baselineTag" class="chips">
        <span class="chip chip--baseline">{{ tagLabel(recipe.baselineTag) }}</span>
      </div>
      <div class="chips" v-if="otherTags.length">
        <span class="chip" v-for="t in otherTags" :key="t">
          {{ tagLabel(t) }}
        </span>
      </div>

      <hr />

      <section>
        <h2>Zutaten</h2>
        <ul class="bullets">
          <li v-for="i in recipe.ingredients" :key="i.id">
            <span class="ing-name">{{ i.name }}</span>
            <span class="ing-amt" v-if="i.amount != null"> — {{ i.amount }}</span>
            <span class="ing-unit" v-if="i.unit">&nbsp;{{ i.unit }}</span>
          </li>
        </ul>
      </section>

      <hr />

      <section>
        <h2>Schritte</h2>
        <ol class="steps">
          <li v-for="s in recipe.steps" :key="s.id">
            <span class="step-pos">{{ s.position }}.</span>
            <span class="step-text">{{ s.text }}</span>
          </li>
        </ol>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getRecipe, type Recipe, type DietTag } from '@/services/api/recipes'
import { tagLabel } from '@/services/ui/dietTagLabels'

const route = useRoute()
const id = Number(route.params.id)

const loading = ref(true)
const err = ref<string | null>(null)
const recipe = ref<Recipe>({
  id,
  title: '',
  description: '',
  prepMinutes: 0,
  cookMinutes: 0,
  totalMinutes: 0,
  dietTags: [],
  baselineTag: null,
  categories: [],
  ingredients: [],
  steps: [],
})

const otherTags = computed<DietTag[]>(() =>
    (recipe.value.dietTags ?? []).filter(t => t !== recipe.value.baselineTag)
)

onMounted(async () => {
  try {
    const r = await getRecipe(id)
    // Schritte defensiv sortieren (falls Backend schon sortiert, harmless)
    r.steps = [...(r.steps ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    recipe.value = r
  } catch (e: any) {
    err.value = e?.message ?? 'Konnte Rezept nicht laden.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container { max-width: 860px; margin: 0 auto; padding: 16px; }
.card { border: 1px solid #eee; border-radius: 16px; padding: 20px; background: #fff; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title { margin: 0; }
.meta { display: flex; gap: 16px; flex-wrap: wrap; color: #555; margin: 8px 0 12px; }
.bullets { margin: 0; padding-left: 18px; }
.steps { margin: 0; padding-left: 20px; }
.step-pos { font-weight: 600; margin-right: 6px; }
.ing-name { font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.chip {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px; font-size: 12px;
  border: 1px solid #e2e2e2; background: #fafafa;
}
.chip--baseline { border-color: #c2e7c5; background: #f3fff4; }
.chip--category { border-color: #dbe3ff; background: #f5f8ff; }
.actions .btn {
  border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; text-decoration: none;
}
.actions .btn:hover { background: #f6f6f6; }
.muted { color: #666; }
.errorbox {
  border: 1px solid #f2c5c5; background: #fff5f5; color: #7a1f1f;
  border-radius: 12px; padding: 12px; margin-bottom: 12px;
}
hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
</style>
