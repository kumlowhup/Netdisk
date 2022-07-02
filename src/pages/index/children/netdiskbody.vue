<template>
  <div
    class="netdisk_wrap"
    v-loading="ajaxWaiting"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)"
  >
    <div style="height: 100%">
      <!-- <a href="javascript:;">首页</a> -->
      <!-- 路径导航 -->
      <a
        href="javascript:;"
        @click="navlinkRender(pathnow.length - 2)"
        v-if="pathnow.length >= 1"
        >返回上一页</a
      >
      <breadcrumb :navlinkRender="navlinkRender"></breadcrumb>
      <!-- 操作div -->
      <div class="opera_btn fileList">
        <!-- 全选按钮 -->
        <el-checkbox
          v-model="selectall"
          style="display: inline-block"
          v-show="!vacuumResult"
        />
        <!-- 上传文件夹用的input -->
        <input
          type="file"
          style="display: none !important"
          ref="uploadinput"
          @change="uploadFile"
        />
        <el-button
          type="primary"
          size="small"
          @click="toUpload"
          :style="
            'margin-left:16px;display:' + (searchMode ? 'none' : 'inline-block')
          "
          >上传<el-icon class="el-icon--right"><Upload /></el-icon
        ></el-button>
        <el-button
          type="primary"
          size="small"
          :style="'display:' + (searchMode ? 'none' : 'inline-block')"
          @click="isMKBoxShow = true"
        >
          新建文件夹
        </el-button>
        <el-button
          type="primary"
          size="small"
          :style="'display:' + (hasSelect() ? 'inline-block' : 'none')"
          @click="downloadSelected"
        >
          下载
        </el-button>
        <el-button
          type="primary"
          size="small"
          :icon="Delete"
          :style="'display:' + (hasSelect() ? 'inline-block' : 'none')"
          @click="deleteFilesAndFolders"
        ></el-button>
        <!-- 搜索框 -->
        <el-input
          class="search_input"
          type="text"
          v-model="inputSearchText"
          placeholder="搜索您的文件"
          @keydown.enter="toSearch"
        >
          <template #suffix>
            <Search class="search_btn" href="javascript:;" @click="toSearch" />
          </template>
        </el-input>
        <!-- </div> -->
      </div>
      <!-- 搜索时显示 -->
      <div
        class="opera_btn"
        :style="{
          display: searchMode ? 'flex' : 'none',
          justifyContent: 'space-around',
        }"
      >
        <span v-if="!vacuumResult()">文件/文件夹</span>
        <span v-if="!vacuumResult()">路径</span>
        <div v-if="vacuumResult() && searchMode">搜索结果为空！</div>
      </div>
      <!-- 文件展示 -->
      <el-scrollbar height="80%" max-height="400px">
        <!-- 新建文件夹 -->
        <div v-show="isMKBoxShow">
          <FolderCreator
            @cancel="() => (isMKBoxShow = false)"
            @created="afterCreateFolder"
          ></FolderCreator>
        </div>
        <!-- 空白显示信息 -->
        <div v-if="vacuumResult() && !searchMode">
          此文件夹为空，
          <a
            href="javascript:;"
            @click="isMKBoxShow = true"
            style="color: -webkit-link"
            >点此</a
          >创建文件夹
        </div>
        <template v-for="file in fileArray" :key="file.id">
          <FileItem :msg="file" :changeSelected="changeSelected" />
        </template>

        <template v-for="folder in dirArray" :key="folder.id">
          <FolderItem
            :msg="folder"
            :changeSelected="changeSelected"
            @jumpindir="jumpindir(folder.dirname)"
          />
        </template>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import FileItem from "./children/FileItem.vue";
import FolderItem from "./children/FolderItem.vue";
import breadcrumb from "./children/headcrumb.vue";
import FolderCreator from "./children/FolderCreator.vue";
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import { nanoid } from "nanoid";
import { ref, inject, onMounted, reactive, customRef } from "@vue/runtime-core";
import { useRoute, useRouter } from "vue-router";
import { computed } from "@vue/reactivity";
// import testFun from
const route = useRoute();
const router = useRouter();
const axios = inject("axios");
const uploadProgresses = inject("uploadProgresses");
const searchMode = inject("searchMode");
const uploadinput = ref(null);
const inputSearchText = ref("");
const progressHide = ref(false);
const fileArray = reactive([]);
const dirArray = reactive([]);
const ajaxWaiting = ref(false);
const searchFloat = ref(false);
const pathnow = inject("pathnow");

const pathString = computed(() => "/" + pathnow.join("/"));

const isMKBoxShow = ref(false);
const success = ElMessage.success;
function hasSelect() {
  return (
    fileArray.find((element) => element.selected) ||
    dirArray.find((element) => element.selected) ||
    false
  );
}
const selectall = checkSelectAll(false);
function checkSelectAll(initValue) {
  return customRef(function (track, trigger) {
    return {
      get() {
        track();
        return (
          !(
            fileArray.find((element) => !element.selected) ||
            dirArray.find((element) => !element.selected)
          ) || false
        );
      },
      set(val) {
        if (selectall.value) {
          ElMessageBox.confirm(`确定要取消全选吗?`, `全选操作`)
            .then(() => {
              fileArray.forEach((element) => {
                element.selected = false;
              });
              dirArray.forEach((element) => {
                element.selected = false;
              });
              trigger();
            })
            .catch(() => {});
        } else {
          fileArray.forEach((element) => {
            element.selected = true;
          });
          dirArray.forEach((element) => {
            element.selected = true;
          });
          trigger();
        }
      },
    };
  });
}

function vacuumResult() {
  // 空文件夹或者搜索结果为空
  return !(dirArray.length + fileArray.length);
}
function fileRender(path) {
  ajaxWaiting.value = true;
  axios
    .get(
      "/api/getDir?destination=" + encodeURIComponent(decodeURIComponent(path))
    )
    .then((res) => {
      ajaxWaiting.value = false;
      searchMode.value = false;
      if (res.data.code !== 200) {
        switch (res.data.code) {
          case 1000:
            {
              router.push("/authpage/login");
              ElMessage.error(res.data.msg);
            }
            break;
          case 300:
            {
              ElMessage.error("登录权限失败");
              console.log(res.data.msg);
              pathnow.pop();
              router.back();
            }
            break;
          case 404: {
            ElMessage.error("文件夹不存在!");
            console.warn(res.data.msg);
            if (path === "/") {
              ElMessage.error("额 埋了");
            } else navlinkRender(-1);
          }
          default: {
            ElMessage.error(res.data.msg);
            console.warn(res.data);
          }
        }
        return;
      }
      router.replace("/main?path=" + encodeURIComponent(pathString.value));
      // 清空数组
      fileArray.length = 0;
      dirArray.length = 0;
      // 重新构造数组，重新渲染画面
      res.data.data.file.forEach((element) => {
        fileArray.push({
          filename: element,
          id: "@file" + element,
          selected: false,
        });
      });
      res.data.data.dir.forEach((element) => {
        dirArray.push({
          dirname: element,
          id: "@folder" + element,
          selected: false,
        });
      });
    })
    .catch((res) => {
      pathnow.pop();
      ElMessage.error("错误信息：" + res.data || res || "网络连接错误");
      ajaxWaiting.value = false;
    });
}
function navlinkRender(i) {
  if (pathnow.length === i + 1) return;
  let path = "/" + pathnow.slice(0, i + 1).join("/");
  fileRender(path);
  pathnow.length = i + 1;
  router.replace("/main?path=/" + pathString.value);
}
function changeSelected(id) {
  dirArray.forEach((dir) => {
    if (dir.id === id) dir.selected = !dir.selected;
  });
  fileArray.forEach((file) => {
    if (file.id === id) file.selected = !file.selected;
  });
}

// 点击进入子目录
function jumpindir(dirname) {
  // 点击文件夹进入子路径
  pathnow.push(dirname);
  fileRender(pathString.value);
}
// 跳转搜索
function toSearch() {
  console.log(inputSearchText);
  inputSearchText.value = inputSearchText.value.trim();
  if (!inputSearchText.value) {
    ElMessage.warning("搜索内容不能为空！");
    return;
  }
  axios.get(`/api/searchDir?name=${inputSearchText.value}`).then((res) => {
    searchMode.value = true;
    dirArray.length = 0;
    fileArray.length = 0;
    res.data.data.file.forEach((filepath) => {
      fileArray.push({
        filename: filepath.substring(filepath.lastIndexOf("/") + 1),
        id: "@file" + pathString.value + filepath,
        path: filepath.substring(0, filepath.lastIndexOf("/")),
        selected: false,
      });
    });
    res.data.data.directory.forEach((filepath) => {
      dirArray.push({
        dirname: filepath.substring(filepath.lastIndexOf("/") + 1),
        id: "@folder" + pathString.value + filepath,
        path: filepath.substring(0, filepath("/")),
        selected: false,
      });
    });
  });
}
// 下载被选择的文件/文件夹
function downloadSelected() {
  if (!hasSelect()) return;
  // 下载多个文件夹 文件名列表
  let download_array = [];
  let firstDocName = "";
  try {
    dirArray.forEach((folder, i) => {
      if (!folder.selected) return;
      if (firstDocName === "") firstDocName = folder.dirname;
      folder.selected = false;
      download_array.push(
        searchMode.value
          ? folder.path + "/" + folder.dirname
          : pathString.value + "/" + folder.dirname
      );
    });
    fileArray.forEach((file, i) => {
      if (!file.selected) return;
      if (firstDocName === "") firstDocName = file.filename;
      file.selected = false;
      download_array.push(
        searchMode.value
          ? file.path + "/" + file.filename
          : pathnow.join("/") + "/" + file.filename
      );
    });
  } catch {
    ElMessage.error("错误");
  }
  ElMessageBox.confirm(
    `确定要下载${firstDocName}等${download_array.length}个选项吗`,
    "下载操作"
  ).then(() => {
    axios
      .post("/api/shareFile", {
        destination: "/",
        files: download_array,
      })
      .then((res) => {
        console.log(res.data.msg);
        window.location.href = res.data.data.downloadURL;
      })
      .catch((e) => {
        ElMessage.error("错误信息: " + e);
      });
  });
}
// 点击上传的input
function toUpload() {
  uploadinput.value.click();
}
// 文件上传
function uploadFile() {
  if (!uploadinput.value.files[0]) return;
  let fd = new FormData();
  fd.append("destination", pathString.value);
  fd.append("getFile", uploadinput.value.files[0]);
  let uploadProgress = {
    percentState: 0,
    name: uploadinput.value.files[0].name,
  };
  uploadProgresses.push(uploadProgress);
  progressHide.value = false;
  axios({
    method: "post",
    url: "/api/uploadFile",
    data: fd,
    onUploadProgress(e) {
      uploadProgress.percentState = parseInt((e.loaded / e.total) * 100);
    },
  }).then((res) => {
    uploadinput.value.value = "";
    console.log(res.data.msg);
    // 上传后重新渲染页面
    fileRender(pathString.value);
  });
}

function afterCreateFolder(newfoldername) {
  dirArray.push({
    dirname: newfoldername,
    id: "@folder" + pathString.value + newfoldername,
    selected: false,
  });
}

// 删除文件和文件夹
function deleteFilesAndFolders() {
  if (!hasSelect()) return;
  // confirm弹窗请求用户确认删除
  ElMessageBox.confirm("确定要删除所选内容吗？", "删除操作").then(() => {
    dirArray.forEach((dir) => {
      if (!dir.selected) return;
      axios
        .get(
          "/api/deleteFile?destination=" +
            (searchMode.value ? dir.path : pathString.value) +
            "/" +
            encodeURIComponent(dir.dirname)
        )
        .then((res) => {
          success(`删除成功`);
          console.log(res.data.msg, " @ ", dir.dirname);
          fileRender(pathString.value);
        });
    });
    fileArray.forEach((file) => {
      if (!file.selected) return;
      axios
        .get(
          "/api/deleteFile?destination=" +
            (searchMode.value ? file.path : pathString.value) +
            "/" +
            encodeURIComponent(file.filename)
        )
        .then((res) => {
          console.log(res.data.msg, " @ ", file.filename);
          // fileArray.splice(index, 1);
          fileRender(pathString.value);
        });
    });
  });
}
// 未登录跳转
function nosignin() {
  ElMessage.error("权限校验失败，请重新登录");
  router.push("/authpage/login");
}
onMounted(() => {
  // 免登录
  if (!localStorage.getItem("Itoken")) {
    nosignin();
  }
  axios.defaults.headers.common["Authorization"] =
    localStorage.getItem("Itoken");
  route.query.path = route.query.path || "";
  pathnow.length = 0;
  for (const path of route.query.path.split("/")) {
    pathnow.push(path);
  }
  while (pathnow[0] === "") pathnow.shift();
  let path = pathString.value;

  fileRender(path);
  window.onresize = () => {
    searchFloat.value = document.documentElement.clientWidth <= 620;
  };
  window.onresize();
  // setInterval(()=>{
  //   // eslint-disable-next-line no-debugger
  //   debugger;
  // },1000)
});
</script>

<style>
/* 外套 */
.netdisk_wrap {
  float: left;
  height: 100%;
  width: 100vw;
  max-width: 100%;
}

@media screen and (max-width: 539px) {
  .netdisk_wrap {
    padding: 20px 0;
  }
  h1 {
    text-align: center;
  }
}

@media screen and (min-width: 540px) {
  .netdisk_wrap {
    padding: 40px 18px 40px 40px;
  }
}

@media screen and (min-width: 900px) {
  .netdisk_wrap {
    padding: 50px 25px 50px 50px;
  }
}

/* .files_display {
  overflow-y: scroll;
  max-height: 400px;
  height: 80%;
} */

.el-breadcrumb {
  margin: 1rem 0 0.5rem;
}

.opera_btn {
  margin-left: 16px;
  height: 30px;
  vertical-align: top;
  min-width: 340px;
  display: flex;
}

.search_btn {
  font-size: 18px;
  font-weight: 600;
  line-height: 30px;
  height: 20px;
  width: 20px;
  transform: translateX(-8px);
}

.el-button:nth-last-child(2) {
  margin-right: 12px;
}

.search_input {
  margin-left: auto;
  margin-right: 40px;
  flex-shrink: 0.5;
  border-radius: 15px;
  background: #f1f2f4;
  width: 180px;
  height: 30px;
  line-height: 30px;
}

.searchFloat.value {
  position: fixed;
  top: 50px;
  left: 50px;
}

.mkdir {
  /* display: inline-block; */
  height: 1.5rem;
  line-height: 1.5rem;
  width: 28%;
  max-width: 522.114px;
  /*超出部分隐藏*/
  overflow: hidden;
  /*强制在一行*/
  white-space: nowrap;
  /*文本超出部分省略*/
  text-overflow: ellipsis;
}
</style>