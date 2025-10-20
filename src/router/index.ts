import { createRouter, createWebHistory } from "vue-router";
import RecipeList from "@/views/RecipeList.vue";

const routes = [{ path: "/", name: "home", component: RecipeList }];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
