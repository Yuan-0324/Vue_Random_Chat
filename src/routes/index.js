
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes:[{
        path: '/',
        component: () => import('../components/LoginPage.vue'),
    },{
        path: '/sign_up',
        component: () => import('../components/SignUpPage.vue'),
    },{
        path: '/chat_page',
        component: () => import('../components/ChatPage.vue')
    }]
});

export default router;