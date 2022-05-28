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
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item
          ><a href="javascript:;" @click="navlinkRender(-1)"
            >全部文件</a
          ></el-breadcrumb-item
        >
        <el-breadcrumb-item v-for="(dir, i) in pathnow" :key="`${dir}-${i}`">
          <a href="javascript:;" @click="navlinkRender(i)">{{
            dir
          }}</a></el-breadcrumb-item
        >
      </el-breadcrumb>
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
          :style="'display:' + (searchMode.value ? 'none' : 'inline-block')"
          >上传<el-icon class="el-icon--right"><Upload /></el-icon
        ></el-button>
        <el-button
          type="primary"
          size="small"
          :style="'display:' + (searchMode.value ? 'none' : 'inline-block')"
          @click="showmk"
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
        <div class="searchList" :class="searchFloat ? 'searchFloat' : ''">
          <input
            class="search_input"
            type="text"
            ref="inputSearch"
            @focus="searchInputFocus = true"
            @blur="searchInputFocus = false"
            :placeholder="searchInputFocus ? '' : '搜索您的文件'"
            @keyup.enter="tosearch"
          />
          <Search class="search_btn" href="javascript:;" @click="tosearch" />
        </div>
      </div>
      <!-- 搜索时显示 -->
      <div
        class="opera_btn"
        :style="{
          display: searchMode.value ? 'flex' : 'none',
          justifyContent: 'space-around',
        }"
      >
        <span v-if="!vacuumResult()">文件/文件夹</span>
        <span v-if="!vacuumResult()">路径</span>
        <div v-if="vacuumResult() && searchMode.value">搜索结果为空！</div>
      </div>
      <!-- 文件展示 -->
      <el-scrollbar height="80%" max-height="400px">
        <!-- 新建文件夹 -->
        <div class="mkdirbox" ref="mkdirbox" style="display: none">
          <!-- <span class="input_place"></span> -->
          <img src="../../../assets/img/folder_icon.png" />
          <input
            type="text"
            class="mkdir"
            ref="newfoldername"
            @keyup.enter="createnewfolder"
          />
          <a href="javascript:;" @click="createnewfolder"> √ </a>
          <a href="javascript:;" @click="mkcancal"> x </a>
        </div>
        <div v-if="vacuumResult() && !searchMode.value">
          此文件夹为空，
          <a href="javascript:;" @click="showmk" style="color: -webkit-link"
            >点此</a
          >创建文件夹
        </div>
        <div v-for="file in fileArray" :key="file.id">
          <FileItem :msg="file" :changeSelected="changeSelected" />
        </div>

        <div v-for="folder in dirArray" :key="folder.id">
          <FolderItem
            :msg="folder"
            :changeSelected="changeSelected"
            @jumpindir="jumpindir(folder.dirname)"
          />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import FileItem from "./children/FileItem.vue";
import FolderItem from "./children/FolderItem.vue";
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import { nanoid } from "nanoid";
import { ref, inject, onMounted, reactive, customRef } from "@vue/runtime-core";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const axios = inject("axios");
const uploadProgresses = inject("uploadProgresses");
const searchMode = inject("searchMode");
const uploadinput = ref(null);
const inputSearch = ref(null);
const mkdirbox = ref(null);
const progressHide = ref(false);
let fileArray = reactive([]);
let dirArray = reactive([]);
let ajaxWaiting = ref(false);
let searchFloat = ref(false);
let searchInputFocus = ref(false);
const pathnow = inject("pathnow");
const newfoldername = ref(null);
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
        if (res.data.code === 1000) {
          router.push("/authpage/login");
          ElMessage.error(res.data.msg);
        } else if (res.data.code === 300) {
          ElMessage.error("登录权限失败");
          console.log(res.data.msg);
          pathnow.pop();
          router.back();
        } else {
          console.log(res.data);
        }
        return;
      }
      router.replace("/main?path=%2F" + encodeURIComponent(pathnow.join("/")));
      // 清空数组
      fileArray.length = 0;
      dirArray.length = 0;
      // 重新构造数组，重新渲染画面
      res.data.data.file.forEach((element) => {
        fileArray.push({
          filename: element,
          id: nanoid(),
          selected: false,
        });
      });
      res.data.data.dir.forEach((element) => {
        dirArray.push({
          dirname: element,
          id: nanoid(),
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
  router.replace("/main?path=/" + pathnow.join("/"));
}
function changeSelected(id) {
  dirArray.forEach((dir) => {
    if (dir.id === id) dir.selected = !dir.selected;
  });
  fileArray.forEach((file) => {
    if (file.id === id) file.selected = !file.selected;
  });
}
function showmk() {
  // 展示mkdir盒子
  mkdirbox.value.style.display = "block";
}
function mkcancal() {
  mkdirbox.value.style.display = "none";
  newfoldername.value = "";
}
function createnewfolder() {
  if (newfoldername.value.value.trim() === "") {
    ElMessage.warning("文件夹名不能为空！");
    return;
  }
  ElMessageBox.confirm(
    "确定要创建文件夹" + newfoldername.value.value + "?",
    "创建文件夹"
  ).then(() => {
    axios
      .post("/api/mkdir", {
        destination: "/" + pathnow.join("/") + "/" + newfoldername.value.value,
      })
      .then(() => {
        dirArray.push({
          dirname: newfoldername.value.value,
          id: nanoid(),
          selected: false,
        });
        // 最后重新点击“取消键”
        mkcancal();
      });
  });
}
// 点击进入子目录
function jumpindir(dirname) {
  // 点击文件夹进入子路径
  pathnow.push(dirname);
  fileRender("/" + pathnow.join("/"));
}
// 跳转搜索
function tosearch() {
  console.log(inputSearch);
  inputSearch.value = inputSearch.value.value.trim();
  if (!inputSearch.value) {
    ElMessage.warning("搜索内容不能为空！");
    return;
  }
  axios.get(`/api/searchDir?name=${inputSearch.value}`).then((res) => {
    searchMode.value = true;
    dirArray.length = 0;
    fileArray.length = 0;
    res.data.data.file.forEach((filepath) => {
      fileArray.push({
        filename: filepath.substring(filepath.lastIndexOf("/") + 1),
        id: nanoid(),
        path: filepath.substring(0, filepath.lastIndexOf("/")),
        selected: false,
      });
    });
    res.data.data.directory.forEach((filepath) => {
      dirArray.push({
        dirname: filepath.substring(filepath.lastIndexOf("/") + 1),
        id: nanoid(),
        path: filepath.substring(0, filepath("/")),
        selected: false,
      });
    });
    if (vacuumResult()) {
      searchMode.value = false;
    }
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
          : pathnow.join("/") + "/" + folder.dirname
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
  fd.append("destination", "/" + pathnow.join("/"));
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
    fileRender("/" + pathnow.join("/"));
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
            (searchMode.value ? dir.path : "/" + pathnow.join("/")) +
            "/" +
            encodeURIComponent(dir.dirname)
        )
        .then((res) => {
          console.log(res.data.msg, " @ ", dir.dirname);
          fileRender("/" + pathnow.join("/"));
        });
    });
    fileArray.forEach((file) => {
      if (!file.selected) return;
      axios
        .get(
          "/api/deleteFile?destination=" +
            (searchMode.value ? file.path : "/" + pathnow.join("/")) +
            "/" +
            encodeURIComponent(file.filename)
        )
        .then((res) => {
          console.log(res.data.msg, " @ ", file.filename);
          // fileArray.splice(index, 1);
          fileRender("/" + pathnow.join("/"));
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
  let path = "/" + pathnow.join("/");

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

<style scoped>
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
}

.search_btn {
  display: inline-block;
  font-size: 18px;
  font-weight: 600;
  line-height: 30px;
  height: 30px;
  width: 38px;
  transform: translateX(-10px);
}

.search_btn:hover {
  border: #666 2px;
  border-radius: 10px;
}

.search_input {
  border: 0;
  outline: 0;
  height: 30px;
  width: 100px;
  padding-left: 15px;
  line-height: 30px;
  font-size: 12px;
  background-color: transparent;
  margin-right: 35px;
  vertical-align: top;
}

.searchList {
  margin-right: 40px;
  float: right;
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
  display: inline-block;
  width: 28%;
  max-width: 522.114px;
  /*超出部分隐藏*/
  overflow: hidden;
  /*强制在一行*/
  white-space: nowrap;
  /*文本超出部分省略*/
  text-overflow: ellipsis;
}

/* 新建文件夹 */
.mkdirbox.value {
  margin-left: 16px;
  height: 40px;
  line-height: 40px;
  border-bottom: #000 1px solid;
  vertical-align: top;
}

.mkdirbox img {
  margin: 8px 20px;
  vertical-align: top;
}

.mkdirbox::before {
  content: "";
  height: 40px;
  margin-left: 28px;
}

.mkdirbox a {
  width: 16px;
  margin-left: 10px;
  border: 1px solid #000;
}
</style>