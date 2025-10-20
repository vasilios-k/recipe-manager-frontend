// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import RecipeList from '@/views/RecipeList.vue'
const RecipeDetail = () => import('@/views/RecipeDetail.vue')
const RecipeCreate = () => import('@/views/RecipeCreate.vue')
const RecipeEdit = () => import('@/views/RecipeEdit.vue')

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: RecipeList },
        { path: '/recipes/new', name: 'recipe-create', component: RecipeCreate },
        { path: '/recipes/:id', name: 'recipe-detail', component: RecipeDetail, props: true },
        { path: '/recipes/:id/edit', name: 'recipe-edit', component: RecipeEdit, props: true },
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
})
