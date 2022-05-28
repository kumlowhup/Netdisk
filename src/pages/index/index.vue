<template>
  <div class="page_wrapper">
    <NetdiskBody />
    <UserHeader />
    <el-button class="progressbutton" @click="progressDrawerOpen = true"
      >显示上传</el-button
    >
    <div>
      <el-drawer title="上传进度" v-model="progressDrawerOpen">
        <Progress />
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import NetdiskBody from "./children/netdiskbody.vue";
import Progress from "../../components/progress.vue";
import UserHeader from "./userheader.vue";
import { provide, reactive, ref } from "@vue/runtime-core";
let progressDrawerOpen = ref(false);
const uploadProgresses = reactive([]);
provide("uploadProgresses", uploadProgresses);
</script>

<style>
.page_wrapper {
  width: 80%;
  min-width: 550px;
  max-width: 900px;
  margin: 100px auto;
  height: 80%;
  /* padding: 10px;*/
  background-color: rgba(255, 255, 255, 0.5);
  /* overflow: scroll; */
}
.progressbutton {
  position: absolute;
  right: 50px;
  bottom: 50px;
}
</style>