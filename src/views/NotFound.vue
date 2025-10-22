<!-- src/views/NotFound.vue -->
<template>
  <main class="container">
    <h1>Seite nicht gefunden</h1>
    <p class="muted">Die angeforderte Seite existiert nicht.</p>
    <RouterLink :to="{ name: 'home' }" class="btn">Zur Startseite</RouterLink>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.container { max-width: 760px; margin: 0 auto; padding: 16px; }
.muted { color: #666; margin: 8px 0 16px; }
.btn { border: 1px solid #ddd; background: #fff; border-radius: 10px; padding: 8px 12px; text-decoration: none; }
.btn:hover { background: #f6f6f6; }
</style>
