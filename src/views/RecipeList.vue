<!-- src/views/RecipeList.vue -->
<template>
  <main class="container">
    <header class="topbar">
      <h1>Rezepte</h1>
      <RouterLink class="btn" :to="{ name: 'recipe-new' }">+ Neues Rezept</RouterLink>
    </header>

    <p v-if="error" class="err">{{ error }}</p>
    <p v-else-if="loading">Lade…</p>

    <ul v-else class="list">
      <li v-for="r in recipes" :key="r.id">
        <RouterLink :to="`/recipes/${r.id}`">
          <strong>{{ r.title }}</strong>
          <small> · {{ r.totalMinutes }} min</small>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { listRecipes, type Recipe } from "@/services/api/recipes";

const recipes = ref<Recipe[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    recipes.value = await listRecipes();
  } catch (e: any) {
    error.value = e?.message ?? "Fehler beim Laden der Rezepte.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.btn {
  border: 1px solid #ddd; background: #fff; border-radius: 10px;
  padding: 8px 12px; text-decoration: none; cursor: pointer;
}
.btn:hover { background: #f6f6f6; }

.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.list a {
  display: block; padding: 12px 14px; border: 1px solid #eee; border-radius: 12px;
  background: #fff;
}
.list a:hover { background: #f9f9f9; }

.err { color: #c00; }
</style>
