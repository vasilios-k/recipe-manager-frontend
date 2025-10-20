<!-- src/views/RecipeDetail.vue -->
<template>
  <main class="container">
    <p><RouterLink :to="{ name: 'home' }">← Zurück</RouterLink></p>

    <section v-if="error" class="errorbox">
      <h2>🤷‍♂️ Ups!</h2>
      <p>{{ error }}</p>
      <p class="actions">
        <button type="button" @click="reload">Erneut versuchen</button>
        <RouterLink :to="{ name: 'home' }" class="btn">Zur Übersicht</RouterLink>
      </p>
    </section>

    <p v-else-if="loading">Lade…</p>

    <article v-else class="card">
      <h1 class="title">{{ r.title }}</h1>
      <p class="muted">
        Gesamt: {{ r.totalMinutes }} min
        <span v-if="r.baselineTag"> · {{ r.baselineTag }}</span>
      </p>

      <p v-if="r.description">{{ r.description }}</p>

      <section v-if="r.categories?.length">
        <h2>Kategorien</h2>
        <ul class="chips">
          <li v-for="c in r.categories" :key="c" class="chip">{{ c }}</li>
        </ul>
      </section>

      <section v-if="r.dietTags?.length">
        <h2>Diet Tags</h2>
        <ul class="chips">
          <li v-for="t in r.dietTags" :key="t" class="chip">{{ t }}</li>
        </ul>
      </section>

      <section v-if="r.ingredients?.length">
        <h2>Zutaten</h2>
        <ul>
          <li v-for="ing in r.ingredients" :key="ing.id">
            {{ ing.amount }} {{ ing.unit }} · {{ ing.name }}
          </li>
        </ul>
      </section>

      <section v-if="r.steps?.length">
        <h2>Schritte</h2>
        <ol>
          <li v-for="s in r.steps" :key="s.id">{{ s.text }}</li>
        </ol>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getRecipe, type Recipe } from "@/services/api/recipes";

const route = useRoute();
const id = Number(route.params.id);

const loading = ref(true);
const error = ref<string | null>(null);
const r = ref<Recipe | null>(null);

async function load() {
  try {
    r.value = await getRecipe(id);
  } catch (e: any) {
    error.value = e?.message ?? "Fehler";
  } finally {
    loading.value = false;
  }
}

function reload() {
  loading.value = true;
  error.value = null;
  load();
}

onMounted(load);
</script>

<style scoped>
.card {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  /* optional sichtprüfung:
  box-shadow: 0 2px 16px rgba(0,0,0,.06);
  */
}
.title { margin: 0 0 8px; }
.muted { color: #666; margin: 0 0 16px; }

section { margin-top: 20px; }
h2 { font-size: 1.1rem; margin: 0 0 8px; }

ul, ol { margin: 0; padding-left: 1.2rem; }
ul { list-style: disc; }
ol { list-style: decimal; }

.chips {
  list-style: none; padding: 0;
  display: flex; flex-wrap: wrap; gap: 8px;
}
.chip {
  background: #f5f5f5; border: 1px solid #eee;
  border-radius: 999px; padding: 4px 10px; font-size: .9rem;
}

.errorbox {
  border: 1px solid #f2c5c5;
  background: #fff5f5;
  color: #7a1f1f;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
}
.actions { display: flex; gap: 12px; align-items: center; }
button, .btn {
  border: 1px solid #ddd; background: #fff; border-radius: 10px;
  padding: 6px 10px; cursor: pointer; text-decoration: none;
}
button:hover, .btn:hover { background: #f6f6f6; }
</style>
