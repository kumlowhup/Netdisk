<template>
  <!-- 注册页面 -->
  <!-- label即为导引，p标签全是对应的信息反馈盒子 -->
  <div>
    <h2>欢迎注册</h2>
    <AuthInput
      itemname="用户名"
      type="username"
      :changedata="changeUsername"
      :feedbackInfo="data.usernameFeedback"
      :checkFun="checkUsername"
    />
    <AuthInput
      itemname="密码"
      type="password"
      :changedata="changePassword"
      :feedbackInfo="data.passwordFeedback"
      :checkFun="checkPassword"
    />
    <!-- 密码强度条 -->
    <div id="pwd_strengthBox" v-show="getStrength">
      <div
        id="pwd_strength"
        ref="strength"
        :style="{
          width: `${getStrength * 60}px`,
        }"
      ></div>
    </div>
    <AuthInput
      itemname="请再次输入密码"
      type="password"
      :changedata="changePasswordConfirm"
      :feedbackInfo="data.passwordConfirmFeedback"
      :checkFun="checkPasswordConfirm"
    />
    <AuthInput
      itemname="昵称"
      type="text"
      :changedata="changeNickName"
      :feedbackInfo="data.nicknameFeedback"
      :checkFun="checkNickname"
    />
    <AuthInput
      itemname="电子邮箱"
      type="text"
      :changedata="changeEmail"
      :feedbackInfo="data.emailFeedback"
      :checkFun="checkEmail"
    />

    <!-- 实时反馈信息盒子 -->
    <!-- <p class="fbInfo" id="signupFB"></p> -->
    <div class="btns">
      <button id="signup" @click="beforeRegister">确定注册</button>
      <button id="jumpLogin" @click="router.push('login')">直接登录</button>
    </div>
  </div>
</template>

<script setup>
import AuthInput from "../../components/AuthInput.vue";
import { reactive, ref } from "@vue/reactivity";
import { computed, inject, watch } from "@vue/runtime-core";
import { useRouter } from "vue-router";
const axios = inject("axios");
const strength = ref(null);
const router = useRouter();
const data = reactive({
  // 用户名
  username: "",
  usernameFeedback: "",
  // 密码
  password: "",
  passwordFeedback: "",
  // 再次输入密码
  passwordConfirm: "",
  passwordConfirmFeedback: "",
  // 昵称
  nickname: "",
  nicknameFeedback: "",
  // 电子邮箱
  email: "",
  emailFeedback: "",
});

// 密码强度
const getStrength = computed(() => {
  if (
    data.password.length < 6 ||
    data.password.length > 16 ||
    /[^A-za-z0-9~!@#$%^&*]/.test(data.password)
  )
    return 0;
  //大写字母
  const majuscule = /[A-Z]/;
  //小写字母
  const lowercase = /[a-z]/;
  //英文字母
  const hasNumber = /[0-9]/;
  //特殊符号
  const specials = /[~!@#$%^&*]/;
  let count = 0;
  //累次判断正则，条件累次添加密码强度
  if (majuscule.test(data.password)) count++;
  if (lowercase.test(data.password)) count++;
  if (hasNumber.test(data.password)) count++;
  if (specials.test(data.password)) count++;
  return count;
});

watch(
  () => data.username,
  () => checkUsername()
);
watch(
  () => data.password,
  () => checkPassword()
);
watch(
  () => data.passwordConfirm,
  () => checkPasswordConfirm()
);
watch(
  () => data.nickname,
  () => checkNickname()
);
watch(
  () => data.email,
  () => checkEmail()
);

watch(getStrength, () => {
  console.log(getStrength.value);
  data.passwordFeedback = "";
  //根据密码强度设置“密码强度”小边框的动画
  switch (getStrength.value) {
    case 1:
      {
        data.passwordFeedback = "密码强度：低";
        strength.value.style.backgroundColor = "#ff0000";
      }
      break;
    case 2:
      {
        data.passwordFeedback = "密码强度：中";
        strength.value.style.backgroundColor = "#FF7F50";
      }
      break;
    case 3:
      {
        data.passwordFeedback = "密码强度：高";
        strength.value.style.backgroundColor = "#ffff00";
      }
      break;
    case 4:
      {
        data.passwordFeedback = "密码强度：极高";
        strength.value.style.backgroundColor = "#008000";
      }
      break;
  }
});

// 子组件给父组件传数据的回调
function changeUsername(e) {
  data.username = e.target.value;
}
function changePassword(e) {
  data.password = e.target.value;
}
function changePasswordConfirm(e) {
  data.passwordConfirm = e.target.value;
}
function changeEmail(e) {
  data.email = e.target.value;
}
function changeNickName(e) {
  data.nickname = e.target.value;
}
// 各项的正则和判空
function checkUsername() {
  data.usernameFeedback = "";
  if (!data.username.trim()) {
    data.usernameFeedback = "用户名不能为空！";
    return false;
  }
  let uPattern = /[^A-za-z0-9_-]/;
  let letter1st = /^[a-z]/i;
  if (uPattern.test(data.username)) {
    data.usernameFeedback =
      "请输入正确的用户名<br />只可包含字母，数字，下划线和短连接号";
  } else if (!letter1st.test(data.username)) {
    data.usernameFeedback = "请输入正确的用户名\n必须以字母开头";
  } else if (data.username.length > 16 || data.username.length < 4) {
    data.usernameFeedback = "用户名长度应为4-16位！";
    data;
  } else {
    data.usernameFeedback = "";
    return true;
  }
  return false;
}
function checkPassword() {
  //基础正则
  let pPattern = /[^A-za-z0-9~!@#$%^&*]/;

  if (!data.password) {
    data.passwordFeedback = "密码不能为空！";
  } else if (pPattern.test(data.password)) {
    data.passwordFeedback =
      "请输入正确的密码\n只能包含大小写英文、数字和特殊符号";
  } else if (data.password.length > 16 || data.password.length < 6) {
    data.passwordFeedback = "密码长度应为6-16位！";
  } else {
    if (getStrength.value === 0) data.passwordFeedback = "";
    return true;
  }
  return false;
}
function checkPasswordConfirm() {
  data.passwordConfirmFeedback = "";
  if (data.passwordConfirm === "") {
    data.passwordConfirmFeedback = "请再次输入密码！";
    return false;
  } else if (data.password === data.passwordConfirm) {
    return true;
  }
  data.passwordConfirmFeedback = "两次输入的密码不一致!";
  return false;
}
function checkNickname() {
  if (data.nickname === "") {
    data.nicknameFeedback = "请输入昵称！";
    return false;
  }
  // 只能输入纯中文或纯英文，包含少数民族和外文名连接号“·”
  let nPattern = /^[A-z ]+$|^[\u4E00-\u9FA5·]+$/;
  if (nPattern.test(data.nickname)) {
    data.nicknameFeedback = "";
    return true;
  } else {
    data.nicknameFeedback = "只能输入纯中文或纯英文";
    return false;
  }
}
function checkEmail() {
  if (data.email === "") {
    data.emailFeedback = "请输入电子邮箱";
    return false;
  }
  let p = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (p.test(data.email)) {
    data.emailFeedback = "";
    return true;
  } else {
    data.emailFeedback = "请输入正确的邮箱";
    return false;
  }
}
function beforeRegister() {
  let checkall =
    data.checkUsername() &&
    data.checkPassword() &&
    data.checkPasswordConfirm() &&
    data.checkNickname() &&
    data.checkEmail();
  if (checkall) {
    data.toRegister();
  } else {
    ElMessage.warning("注册信息填写不正确，请检查相关信息");
  }
}
function toRegister() {
  axios
    .post("/user/register", {
      username: data.username,
      password: data.password,
      name: data.nickname,
      email: data.email,
    })
    .then((res) => {
      if (res.data.code === 200) {
        console.log(res.data.msg);
        ElMessage.success("注册成功！欢迎你，" + data.username);
        router.push("/authpage/login?username=" + data.username);
      } else if (res.data.code === 300) {
        ElMessage.warning(res.data.msg);
        console.log(res.data.msg);
        data.checkUsername();
      } else {
        console.error("注册请求出错：信息为：", res);
      }
    })
    .catch((res) => {
      console.log(res);
    });
}
</script>

<style src="../../assets/css/login_signup.css" scoped></style>
<style src='../../assets/css/auth_input.css' scoped></style>