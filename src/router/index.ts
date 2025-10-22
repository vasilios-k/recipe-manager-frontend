// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const RecipeList   = () => import('@/views/RecipeList.vue')
const RecipeDetail = () => import('@/views/RecipeDetail.vue')
const RecipeCreate = () => import('@/views/RecipeCreate.vue')
const RecipeEdit   = () => import('@/views/RecipeEdit.vue')
const NotFound     = () => import('@/views/NotFound.vue')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: RecipeList,
            alias: ['/recipes'],
            meta: { title: 'Rezepte' },
        },
        {
            path: '/recipes/new',
            name: 'recipe-create',
            component: RecipeCreate,
            meta: { title: 'Rezept anlegen' },
        },
        {
            path: '/recipes/:id',
            name: 'recipe-detail',
            component: RecipeDetail,
            props: route => ({ id: Number(route.params.id) }),
            meta: { title: 'Rezept – Detail' },
        },
        {
            path: '/recipes/:id/edit',
            name: 'recipe-edit',
            component: RecipeEdit,
            props: route => ({ id: Number(route.params.id) }),
            meta: { title: 'Rezept bearbeiten' },
        },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound, meta: { title: '404' } },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        return { top: 0 }
    },
})

const BASE_TITLE = 'Recipe Manager'
router.afterEach((to) => {
    const t = (to.meta?.title as string | undefined) ?? 'App'
    document.title = `${t} · ${BASE_TITLE}`
})

export default router
