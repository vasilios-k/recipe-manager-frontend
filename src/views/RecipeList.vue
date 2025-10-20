<!-- src/views/RecipeList.vue -->
<template>
  <main class="container">
    <header class="topbar">
      <h1>Rezepte</h1>
      <RouterLink class="btn" :to="{ name: 'recipe-create' }">+ Neues Rezept</RouterLink>
    </header>

    <section v-if="loading" class="muted">Lade…</section>

    <section v-else-if="err" class="errorbox">
      <strong>Fehler:</strong> {{ err }}
    </section>

    <section v-else>
      <ul class="grid">
        <li v-for="r in recipes" :key="r.id" class="card">
          <header class="head">
            <h2 class="title">
              <RouterLink :to="{ name: 'recipe-detail', params: { id: r.id } }">
                {{ r.title }}
              </RouterLink>
            </h2>
            <small class="muted">{{ r.totalMinutes }} min</small>
          </header>

          <p v-if="r.description" class="desc">{{ r.description }}</p>

          <div v-if="r.baselineTag || r.dietTags.length" class="tags">
            <span v-if="r.baselineTag" class="tag base">{{ r.baselineTag }}</span>
            <span v-for="t in r.dietTags" :key="t" class="tag">{{ t }}</span>
          </div>

          <div v-if="r.categories.length" class="cats">
            <span v-for="c in r.categories" :key="c" class="chip">{{ c }}</span>
          </div>

          <footer class="actions">
            <RouterLink class="btn small" :to="{ name: 'recipe-detail', params: { id: r.id } }">
              Anzeigen
            </RouterLink>
            <RouterLink class="btn small" :to="{ name: 'recipe-edit', params: { id: r.id } }">
              Bearbeiten
            </RouterLink>
          </footer>
        </li>
      </ul>

      <p v-if="!recipes.length" class="muted">Noch keine Rezepte angelegt.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listRecipes, type Recipe } from '@/services/api/recipes'

const loading = ref(true)
const err = ref<string | null>(null)
const recipes = ref<Recipe[]>([])

onMounted(async () => {
  try {
    recipes.value = await listRecipes()
  } catch (e: any) {
    err.value = e?.message ?? 'Konnte Rezepte nicht laden.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; text-decoration: none; }
.btn:hover { background: #f6f6f6; }
.btn.small { padding: 6px 10px; }

.grid { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.card { border: 1px solid #eee; border-radius: 16px; padding: 16px; background: #fff; display: flex; flex-direction: column; gap: 8px; }

.head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.title { margin: 0; font-size: 1.1rem; }
.desc { margin: 0; color: #444; }

.tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { background: #f2f2f2; border-radius: 999px; padding: 2px 8px; font-size: .85rem; }
.tag.base { background: #e8f7ff; }

.cats { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { border: 1px solid #eee; border-radius: 999px; padding: 2px 8px; font-size: .85rem; }

.actions { display: flex; gap: 8px; margin-top: 4px; }
.muted { color: #666; }

.container { max-width: 1100px; margin: 0 auto; padding: 16px; }
</style>
