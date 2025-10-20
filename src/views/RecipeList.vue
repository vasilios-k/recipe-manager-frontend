<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getRecipes } from "@/services/api/recipes";
import type { RecipeReadDto } from "@/types/recipe";

const loading = ref(true);
const error = ref<string | null>(null);
const recipes = ref<RecipeReadDto[]>([]);

onMounted(async () => {
  try {
    recipes.value = await getRecipes();
  } catch (e: any) {
    error.value = e?.message ?? "Fehler beim Laden";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="max-w-3xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-semibold">Rezepte</h1>

    <div v-if="loading">Lade…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <ul v-else class="divide-y">
      <li v-for="r in recipes" :key="r.id" class="py-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-medium">{{ r.title }}</h2>
            <p class="text-sm text-gray-600" v-if="r.description">{{ r.description }}</p>
            <p class="text-sm text-gray-600">
              Dauer: {{ r.totalMinutes }} min
              <span v-if="r.baselineTag">• {{ r.baselineTag }}</span>
            </p>
            <div class="mt-1 text-xs text-gray-500">
              <span v-for="c in r.categories" :key="c" class="mr-2">#{{ c }}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </main>
</template>
