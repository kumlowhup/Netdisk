<template>
  <div
    class="fileList"
    :class="{ file_selected: msg.selected }"
    @click="changeSelected(msg.id)"
  >
    <el-checkbox @click="(e) => e.stopPropagation()" v-model="msg.selected" />
    <img src="../../../../assets/img/folder_icon.png" v-once />
    <a class="folder_name" href="javascript:;" @click.stop="jumpindir">{{
      msg.dirname
    }}</a>
    <el-button
      size="small"
      type="primary"
      class="download_button"
      @click.stop="downloadFile"
      >下载</el-button
    >
    <span v-if="searchMode.value" style="float: right">{{ msg.path }}</span>
  </div>
</template>

<script setup>
import { inject } from "@vue/runtime-core";
const axios = inject("axios");
const searchMode = inject("searchMode");
const pathnow = inject("pathnow");
const props = defineProps({
  msg: {},
  changeSelected: Function,
});
const emit = defineEmits(["jumpindir"]);
function jumpindir() {
  if (searchMode.value) {
    if (props.msg.path.length >= 2) {
      for (const path of props.msg.path.substring(2).split("/"))
        pathnow.push(path);
    } else pathnow.length = 0;
  }
  emit("jumpindir", props.msg.dirname);
  searchMode.value = false;
}
function downloadFile() {
  axios
    .post("/api/shareFile", {
      destination: searchMode.value ? props.msg.path : pathnow.join("/"),
      files: [props.msg.dirname],
    })
    .then((res) => {
      console.log(res.data.msg);
      window.location.href = res.data.data.downloadURL;
    });
}
</script>

<style scoped>
/* filelist 组件 */
.fileList {
  margin-left: 16px;
  height: 40px;
  line-height: 40px;
  border-bottom: #000 1px solid;
  vertical-align: top;
}

.fileList img {
  margin: 8px 20px;
  vertical-align: top;
}

.fileList input {
  margin-left: 16px;
}

.folder_name,
img {
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}

.folder_name:hover {
  font-weight: 600;
  color: #409eff;
}
.file_selected {
  background-color: rgba(64, 158, 255, 0.4);
}

.fileList .download_button {
  display: none;
}
.fileList:hover .download_button {
  display: block;
  float: right;
}
</style>