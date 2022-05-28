<template>
  <header class="header">
    <div class="header_inner">
      <div class="header_selection" @click="userLogOut">退出登录</div>
      <div class="header_selection" @click="router.push({ name: 'wschat' })">
        点击聊天
      </div>
      <div class="header_selection" id="user_name" v-once @click="clearConsole">
        {{ username() }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { inject } from "@vue/runtime-core";
import { useRouter } from "vue-router";
const axios = inject("axios");
const router = useRouter();

function username() {
  return localStorage.getItem("nickname");
}

function userLogOut() {
  axios.post("/user/logout").then(() => {
    router.push({
      path: "/authpage/login",
    });
  });
}
function clearConsole() {
  window.console.clear();
}
</script>

<style scoped>
header {
  width: 100vw;
  min-width: 300px;
  height: 2.7rem;
  position: fixed;
  top: 0;
  left: 0;
  background-color: skyblue;
}

.header_inner {
  width: 80%;
  margin: auto;
}

.header_selection {
  cursor: pointer;
  display: inline-block;
  min-width: 5rem;
  height: 2.7rem;
  line-height: 2.7rem;
  text-align: center;
  color: #080808;
  font-weight: 600;
}

#user_name {
  float: right;
}

.header_selection:hover {
  background-color: aquamarine;
}
</style>