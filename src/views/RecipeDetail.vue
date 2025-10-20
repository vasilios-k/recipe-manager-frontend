<!-- src/views/RecipeDetail.vue -->
<template>
  <main class="container">
    <p>
      <RouterLink :to="{ name: 'home' }">← Zurück</RouterLink>
    </p>

    <section v-if="loading" class="muted">Lade…</section>
    <section v-else-if="err" class="errorbox"><strong>Fehler:</strong> {{ err }}</section>

    <article v-else class="card">
      <header class="head">
        <h1>{{ recipe.title }}</h1>
        <div class="actions">
          <RouterLink class="btn" :to="{ name: 'recipe-edit', params: { id: recipe.id } }">Bearbeiten</RouterLink>
        </div>
      </header>

      <p class="muted" v-if="recipe.description">{{ recipe.description }}</p>

      <ul class="meta">
        <li><strong>Vorbereitung:</strong> {{ recipe.prepMinutes }} min</li>
        <li><strong>Kochen:</strong> {{ recipe.cookMinutes }} min</li>
        <li><strong>Gesamt:</strong> {{ recipe.totalMinutes }} min</li>
      </ul>

      <div v-if="recipe.baselineTag || recipe.dietTags.length" class="tags">
        <span v-if="recipe.baselineTag" class="tag base">{{ recipe.baselineTag }}</span>
        <span v-for="t in recipe.dietTags" :key="t" class="tag">{{ t }}</span>
      </div>

      <div v-if="recipe.categories.length" class="cats">
        <span v-for="c in recipe.categories" :key="c" class="chip">{{ c }}</span>
      </div>

      <hr />

      <section>
        <h2>Zutaten</h2>
        <ul>
          <li v-for="i in recipe.ingredients" :key="i.id">
            {{ i.amount }} {{ i.unit }} {{ i.name }}
          </li>
        </ul>
      </section>

      <section>
        <h2>Schritte</h2>
        <ol>
          <li v-for="s in sortedSteps" :key="s.id">
            {{ s.text }}
          </li>
        </ol>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipe, type Recipe } from '@/services/api/recipes'

const route = useRoute()
const id = Number(route.params.id)

const loading = ref(true)
const err = ref<string | null>(null)
const recipe = ref<Recipe | null>(null)

const sortedSteps = computed(() =>
    (recipe.value?.steps ?? []).slice().sort((a, b) => a.position - b.position),
)

onMounted(async () => {
  try {
    recipe.value = await getRecipe(id)
  } catch (e: any) {
    err.value = e?.message ?? 'Konnte Rezept nicht laden.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card { border: 1px solid #eee; border-radius: 16px; padding: 20px; background: #fff; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.actions { display: flex; gap: 8px; }
.btn { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; text-decoration: none; }
.btn:hover { background: #f6f6f6; }

.meta { display: flex; gap: 16px; padding: 0; list-style: none; }
.tags { display: flex; gap: 8px; margin: 8px 0; }
.tag { background: #f2f2f2; border-radius: 999px; padding: 4px 10px; }
.tag.base { background: #e8f7ff; }

.cats { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 12px; }
.chip { border: 1px solid #eee; border-radius: 999px; padding: 4px 10px; }

h2 { margin-top: 16px; }
.muted { color: #666; }
.errorbox { border: 1px solid #f2c5c5; background: #fff5f5; color: #7a1f1f; border-radius: 12px; padding: 12px; }
</style>
