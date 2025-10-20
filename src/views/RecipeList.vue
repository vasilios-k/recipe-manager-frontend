<template>
  <main class="container">
    <h1>Rezepte</h1>

    <p v-if="error" style="color:#c00">{{ error }}</p>
    <p v-else-if="loading">Lade…</p>

    <ul v-else class="list">
      <li v-for="r in recipes" :key="r.id">
        <strong>{{ r.title }}</strong>
        <small> · {{ r.totalMinutes }} min</small>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { listRecipes, type Recipe } from "@/services/api/recipes";

const loading = ref(true);
const error = ref<string | null>(null);
const recipes = ref<Recipe[]>([]);

onMounted(async () => {
  try {
    recipes.value = await listRecipes();
  } catch (e: any) {
    error.value = e?.message ?? "Fehler";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.list { padding:0; list-style:none; display:grid; gap:12px; }
li { padding:12px; border:1px solid #eee; border-radius:12px; }
small { color: #666; }
</style>
