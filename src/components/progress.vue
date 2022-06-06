<script setup>
import { ref, inject } from "@vue/runtime-core";
const uploadProgresses = inject("uploadProgresses");
const showLast = ref(true);
</script>

<template>
  <div class="progress">
    文件上传
    <ul>
      <li v-for="i in uploadProgresses" :key="i.id">
        {{ i.name }}
        <el-progress
          :text-inside="true"
          :stroke-width="26"
          :percentage="i.percentState"
          :status="i.percentState === 100 ? 'success' : undefined"
        ></el-progress>
      </li>
    </ul>
  </div>
</template>



<style lang="less">
.progress {
  width: 40vh;
  height: 70vh;
  padding: 2vh;
}
</style>