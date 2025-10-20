import { createRouter, createWebHistory } from "vue-router";
import RecipeList from "@/views/RecipeList.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/", name: "home", component: RecipeList }],
});
