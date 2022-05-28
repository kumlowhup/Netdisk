<template>
  <div>
    <h2>重置密码</h2>
    <AuthInput
      itemname="密码"
      type="password"
      :changedata="changePassword"
      :feedbackInfo="passwordFeedback"
      :checkFun="checkPassword"
    />
    <!-- 密码强度条 -->
    <div id="pwd_strengthBox" v-show="strength">
      <div
        id="pwd_strength"
        ref="strength"
        :style="{
          width: `${strength * 60}px`,
        }"
      ></div>
    </div>
    <AuthInput
      itemname="请再次输入密码"
      type="password"
      :changedata="changePasswordConfirm"
      :feedbackInfo="passwordConfirmFeedback"
      :checkFun="checkPasswordConfirm"
    />
    <div class="btns">
      <button @click="beforeReset">确定重置</button>
      <button @click="$router.push('login')">返回登录</button>
    </div>
  </div>
</template>

<script setup>
import { watch } from "@vue/runtime-core";
import { useRoute, useRouter } from "vue-router";

const axios = inject("axios");

const password = ref("");
const passwordFeedback = ref("");
const passwordConfirm = ref("");
const passwordConfirmFeedback = ref("");
const router = useRouter();
const route = useRoute();

// 密码强度
function strength() {
  if (
    this.password.length < 6 ||
    this.password.length > 14 ||
    /[^A-za-z0-9~!@#$%^&*]/.test(this.password)
  )
    return 0;
  //大写字母
  let majuscule = /[A-Z]/;
  //小写字母
  let lowercase = /[a-z]/;
  //英文字母
  let hasNumber = /[0-9]/;
  //特殊符号
  let specials = /[~!@#$%^&*]/;
  let count = 0;
  //累次判断正则，条件累次添加密码强度
  if (majuscule.test(this.password)) count++;
  if (lowercase.test(this.password)) count++;
  if (hasNumber.test(this.password)) count++;
  if (specials.test(this.password)) count++;
  return count;
}

watch(password, () => {
  checkPassword();
});
watch(passwordConfirm, () => {
  checkPasswordConfirm();
});
watch(strength, () => {
  this.passwordFeedback = "";
  //根据密码强度设置“密码强度”小边框的动画
  switch (this.strength) {
    case 1:
      {
        this.passwordFeedback = "密码强度：低";
        this.$refs.strength.style.backgroundColor = "#ff0000";
      }
      break;
    case 2:
      {
        this.passwordFeedback = "密码强度：中";
        this.$refs.strength.style.backgroundColor = "#FF7F50";
      }
      break;
    case 3:
      {
        this.passwordFeedback = "密码强度：高";
        this.$refs.strength.style.backgroundColor = "#ffff00";
      }
      break;
    case 4:
      {
        this.passwordFeedback = "密码强度：极高";
        this.$refs.strength.style.backgroundColor = "#008000";
      }
      break;
  }
});

function changePassword(e) {
  password.value = e.target.value;
}
function changePasswordConfirm(e) {
  passwordConfirm.value = e.target.value;
}
function checkPassword() {
  //基础正则
  let pPattern = /[^A-za-z0-9~!@#$%^&*]/;
  passwordFeedback.value = "";
  if (!password.value) {
    passwordFeedback.value = "密码不能为空！";
  } else if (pPattern.test(password.value)) {
    passwordFeedback.value =
      "请输入正确的密码\n只能包含大小写英文、数字和特殊符号";
  } else if (password.value.length > 16 || password.value.length < 6) {
    passwordFeedback.value = "密码长度应为6-16位！";
  } else {
    return true;
  }
  return false;
}
function checkPasswordConfirm() {
  passwordConfirmFeedback.value = "";
  if (passwordConfirm.value === "") {
    passwordConfirmFeedback.value = "请再次输入密码！";
    return false;
  } else if (password.value === passwordConfirm.value) {
    return true;
  }
  passwordConfirmFeedback.value = "两次输入的密码不一致!";
  return false;
}
function beforeReset() {
  let checkall = checkPassword() && checkPasswordConfirm();
  if (checkall) {
    axios
      .post("/user/resetPassword", {
        token: route.query.Itoken,
        password: password.value,
      })
      .then((res) => {
        if (res.data.code === 200) {
          ElMessage.success("密码修改成功！请牢记您的新密码");
          router.push("/authpage/login");
        } else {
          window.alert("错误：", res);
          console.log(res);
        }
      })
      .catch((res) => {
        console.log("错误信息：");
        console.log(res);
      });
  }
}

onMounted(() => {
  console.log("拿到参数 Itoken=", this.$route.query.Itoken);
});
</script>
<style src="../assets/css/login_signup.css" scoped></style>
<style src='../assets/css/auth_input.css' scoped></style>