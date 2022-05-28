<template>
  <div>
    <h2>重置密码</h2>
    输入邮箱修改密码
    <AuthInput
      itemname="输入电子邮箱"
      type="username"
      :changedata="changedata"
      :feedbackInfo="msg.feedback"
      :checkFun="checkFun"
    />
    <div class="btns">
      <button @click="send">确定发送</button>
      <button @click="router.go(-1)">返回</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from "vue";
import { useRouter } from "vue-router";
import AuthInput from "../../components/AuthInput.vue";
const router = useRouter();
const axios = inject("axios");
const msg = reactive({
  email: "",
  feedback: "",
});

function changedata(e) {
  msg.email = e.target.value;
}
function checkFun() {
  if (msg.email === "") {
    msg.feedback = "请输入电子邮箱";
    return false;
  }
  let p = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (p.test(msg.email)) {
    msg.feedback = "";
    return true;
  } else {
    msg.feedback = "请输入正确的邮箱地址";
    return false;
  }
}
function send() {
  axios
    .post("/user/find", {
      addr: msg.email,
    })
    .then((res) => {
      if (res.data.code === 200) {
        ElMessage.alert("已发送！请打开邮箱地址查看找回信息");
      } else if (res.data.code === 300) {
        ElMessage.warning("邮箱地址信息错误！");
      }
    });
}
</script>

<style src="../../assets/css/login_signup.css" scoped></style>
<style src='../../assets/css/auth_input.css' scoped></style>