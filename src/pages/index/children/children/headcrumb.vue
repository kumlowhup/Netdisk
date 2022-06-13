<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item>
      <a href="javascript:;" @click="navlinkRender(-1)">全部文件</a>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="(dir, i) in pathnow" :key="`${dir}-${i}`">
      <a href="javascript:;" @click="navlinkRender(i)">{{ dir }}</a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { inject } from "@vue/runtime-core";
defineProps(["navlinkRender"]);
const pathnow = inject("pathnow");
</script>