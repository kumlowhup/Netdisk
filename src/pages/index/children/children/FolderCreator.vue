<template>
  <div class="mkdirbox fileList" ref="mkdirbox">
    <!-- <span class="input_place"></span> -->
    <img src="@/assets/img/folder_icon.png" />
    <el-input
      class="mkdir"
      ref="mkdirinput"
      v-model="newfoldername"
      @keyup.enter="createNewFolder"
    />
    <a href="javascript:;">
      <el-icon><Check @click="createNewFolder" /></el-icon>
    </a>
    <a href="javascript:;">
      <el-icon><Close @click="mkdircancel" /></el-icon>
    </a>
  </div>
</template>

<script setup>
import { Check, Close } from "@element-plus/icons-vue";
import { ref, inject, nextTick } from "vue";
import { cancelName, createdFolderEmit } from "./emits";
import axios from "axios";
import { computed } from "@vue/reactivity";
const pathnow = inject("pathnow");
const pathString = computed(() => "/" + pathnow.join("/"));
const emits = defineEmits([cancelName, createdFolderEmit]);

const mkdirinput = ref();

const newfoldername = ref("");
function mkdircancel() {
  newfoldername.value = "";
  emits(cancelName);
}

function createNewFolder() {
  mkdirinput.value.blur();
  newfoldername.value = newfoldername.value.trim();
  if (newfoldername.value === "") {
    ElMessage.warning({ message: "文件夹名不能为空！", grouping: true });
    return;
  }
  const legal = !/.*(\<|\>|\||\*|\/|\\|\?).*/.test(newfoldername.value);
  console.log(legal);
  if (!legal) {
    ElMessage.error({
      message: "文件名不能包含以下字符：<,>,|,*,?,\\,/",
      grouping: true,
    });
    return;
  }
  ElMessageBox.confirm(
    "确定要创建文件夹" + newfoldername.value + "?",
    "创建文件夹"
  )
    .then(() => {
      axios
        .post("/api/mkdir", {
          destination: pathString.value + "/" + newfoldername.value,
        })
        .then((res) => {
          if (res.data.code === 300) {
            ElMessage.warning(res.data.msg);
            newfoldername.value = "";
            mkdirinput.value.focus();
          } else {
            emits(createdFolderEmit, newfoldername.value);
            ElMessage.success(`创建文件夹${newfoldername.value}成功`);
            // 最后重新点击“取消键”
            mkdircancel();
          }
        });
    })
    .catch(() => {
      mkdirinput.value.focus();
    });
}
</script>

<style scoped>
/* 新建文件夹 */
.mkdirbox {
  margin-left: 16px;
  padding-left: 14px;
  height: 40px;
  line-height: 40px;
  border-bottom: #000 1px solid;
  vertical-align: top;
}

.mkdirbox img {
  margin: 8px 20px;
  vertical-align: top;
}

.mkdirbox a {
  width: 16px;
  margin-left: 10px;
  border: 1px solid #000;
}
</style>