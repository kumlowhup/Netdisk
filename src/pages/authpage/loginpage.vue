<template>
  <!-- 登录页面 -->
  <div>
    <!-- 返回键 -->

    <!-- 账号登陆页面 -->
    <h2>账号登录</h2>
    <AuthInput
      itemname="账号"
      type="username"
      :changedata="changeUsername"
      :feedbackInfo="usernameFeedback"
      @keyEnter="beforeLogin"
      :checkFun="() => true"
    />
    <AuthInput
      itemname="密码"
      type="password"
      :changedata="changePassword"
      :feedbackInfo="passwordFeedback"
      @keyEnter="beforeLogin"
      :checkFun="() => true"
    />

    <!-- 免登录 -->
    <div class="inputBox" style="text-align: center">
      <el-checkbox checked="checked" v-model="freeLogin" />
      7天免登录 |
      <router-link to="/authpage/resetPassword">找回密码</router-link>
    </div>
    <!-- 实时反馈信息盒子 -->
    <!-- <div class="fbInfo" id="loginFB"></div> -->
    <div class="btns">
      <button id="jumpRegister" @click="router.push('register')">注册</button>
      <button @click="beforeLogin">确定</button>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, ref, inject } from "@vue/runtime-core";
import { useRoute, useRouter } from "vue-router";
import AuthInput from "../../components/AuthInput.vue";
const route = useRoute();
const router = useRouter();
const axios = inject("axios");
let username = ref("");
let usernameFeedback = ref("");
let password = ref("");
let passwordFeedback = ref("");
let freeLogin = ref(true);

function changeUsername(e) {
  username.value = e.target.value;
}
function changePassword(e) {
  password.value = e.target.value;
}
function checkUsername() {
  usernameFeedback.value = "";
  if (!username.value.trim()) {
    usernameFeedback.value = "用户名不能为空！";
    return false;
  } else {
    return true;
  }
}
function checkPassword() {
  passwordFeedback.value = "";
  if (!password.value) {
    passwordFeedback.value = "密码不能为空！";
    return false;
  } else {
    return true;
  }
}
function toLogin() {
  axios
    .post("/user/login", {
      username: username.value.trim(),
      password: password.value,
      freeLogin: freeLogin.value,
    })
    .then((response) => {
      // 登录成功
      if (response.data.code === 200) {
        localStorage.setItem("Itoken", response.data.data.token);
        localStorage.setItem("nickname", response.data.data.name);
        ElMessage.success("登录成功！欢迎你，" + response.data.data.name);
        router.replace("/main");
      } else if (response.data.code === 300) {
        //账号或密码错误
        console.log(response.data.msg);
        ElMessage.error("账号或密码错误");
      }
    })
    .catch((status) => {
      console.error("错误：" + status);
    });
}
function beforeLogin() {
  let username_checked = checkUsername();
  let password_checked = checkPassword();
  if (username_checked && password_checked) {
    toLogin();
  }
}
watch(username, () => {
  checkUsername();
});
watch(password, () => {
  checkPassword();
});
onMounted(() => {
  username.value = route.query.username || "";
});
</script>

 <style src="../../assets/css/login_signup.css" scoped></style>
 <style src='../../assets/css/auth_input.css' scoped></style>