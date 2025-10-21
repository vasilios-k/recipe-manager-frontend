// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const RecipeList   = () => import('@/views/RecipeList.vue')
const RecipeDetail = () => import('@/views/RecipeDetail.vue')
const RecipeCreate = () => import('@/views/RecipeCreate.vue')
const RecipeEdit   = () => import('@/views/RecipeEdit.vue')

const router = createRouter({
    // nutzt die korrekte Basis-URL (gut für Deploy auf Render/Unterpfade)
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: RecipeList,
            alias: ['/recipes'], // optionaler Alias
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
            // sorgt dafür, dass die Komponente eine numerische id-Prop bekommt
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
        // SPA-Fallback
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition          // Zurück-Button etc.
        if (to.hash) return { el: to.hash, behavior: 'smooth' } // Anker-Links
        return { top: 0 }                                // Standard: nach oben
    },
})

// kleine Title-Verbesserung
const BASE_TITLE = 'Recipe Manager'
router.afterEach((to) => {
    const t = (to.meta?.title as string | undefined) ?? 'App'
    document.title = `${t} · ${BASE_TITLE}`
})

export default router
