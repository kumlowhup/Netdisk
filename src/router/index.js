import { createRouter, createWebHistory } from "vue-router";
import MainBody from '../pages/index/index.vue'
import authpage from '../pages/authpage/index.vue'
import loginpage from '../pages/authpage/loginpage.vue'
import register from '../pages/authpage/register.vue'
import ResetPassword from '../pages/authpage/ResetPassword.vue'
import NewPassword from "../components/NewPassword.vue"
import NotFound from "../pages/notFound/index.vue"
import wschat from "../pages/wschat.vue"
// 解决vue-router在3.0版本以上重复点菜单报错问题
// 必须如此声明否则栈溢出
export default createRouter({
    history: createWebHistory(process.env.NODE_ENV === 'production' ? '/Netdisk/' : '/dev/'),
    routes: [
        {
            path: '/',
            name: "main",
            redirect: "/main",
        },
        {
            name: "MainBody",
            path: '/main',
            component: MainBody,
        },
        {
            name: "wschat",
            path: '/wschat',
            component: wschat,
        },
        {
            path: '/authpage',
            name: "authpage",
            redirect: '/authpage/login',
            component: authpage,
            children: [{
                path: 'login',
                component: loginpage,

            }, {
                path: 'register',
                component: register
            }, {
                path: 'resetPassword',
                component: ResetPassword
            }, {
                path: "NewPassword",
                component: NewPassword
            }]
        },
        {
            path: '/login',
            redirect: "/authpage/login"
        },
        {
            path: '/register',
            redirect: "/authpage/register"
        }, {
            path: "/*",
            component: NotFound
        }
    ]
})