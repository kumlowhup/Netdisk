<template>
  <div class="formInfo">
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style>
/* 登录/注册盒子 */
.formInfo {
  position: absolute;
  left: 50%;
  margin-left: -240px;
  margin-top: 100px;
  width: 480px;
  height: 659px;
  background-color: #eeffffe6;
  border-radius: 10px;
  display: flex;
  display: -webkit-flex;
  display: -moz-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>