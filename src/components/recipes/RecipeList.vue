<template>
  <section>
    <h2>Recipes</h2>
    <ul>
      <li v-for="r in recipes" :key="r.id">
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
const recipes = [
  { id:1, title:'Tomato Pasta', prepMinutes:15,
    ingredients:[{name:'Spaghetti',amount:200,unit:'g'}] },
  { id:2, title:'Pancakes', prepMinutes:20,
    ingredients:[{name:'Flour',amount:200,unit:'g'}] }
];
</script>
