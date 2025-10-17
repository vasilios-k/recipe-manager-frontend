<template>
  <section>
    <h2>Recipes</h2>

    <!-- Fehleranzeige (optional, aber hilfreich) -->
    <p v-if="error" style="color:crimson; margin: 8px 0;">{{ error }}</p>

    <ul v-else>
      <li v-for="r in recipes" :key="r.id" style="margin-bottom: 8px;">
        <strong>{{ r.title }}</strong> — {{ r.prepMinutes }} min
        <ul>
          <li v-for="ing in r.ingredients" :key="ing.name">
            {{ ing.amount }} {{ ing.unit }} {{ ing.name }}
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRecipes } from '@/services/api/client'

const recipes = ref([])
const error = ref(null)

onMounted(async () => {
  try {
    recipes.value = await getRecipes()
  } catch (e) {
    error.value = String(e)
  }
})
</script>
