import { createRouter, createWebHistory } from "vue-router";
import RecipeList from "@/views/RecipeList.vue";

// Lazy Views
const RecipeDetail = () => import("@/views/RecipeDetail.vue");
const RecipeCreate = () => import("@/views/RecipeCreate.vue");

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", name: "home", component: RecipeList },
        { path: "/recipes/new", name: "recipe-new", component: RecipeCreate },
        { path: "/recipes/:id", name: "recipe-detail", component: RecipeDetail, props: true }
    ],
});
