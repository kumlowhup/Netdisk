<template>
  <div class="formInfo chatPage">
    <span @click="$router.go(-1)"><i class="el-icon-arrow-left"></i>返回</span>
    <el-button size="small" @click="reconnect" v-if="!connecting"
      >重连</el-button
    >
    <br />
    <div v-show="connecting">
      <el-button size="small" @click="close">关闭</el-button>
      <br />
      <el-input type="text" v-model="inputmsg" @keydown.enter="send" />
      <el-button size="small" @click="send">发送</el-button>
      <el-scrollbar max-height="400px">
        <ChatMsg
          :data="i"
          v-for="i in msg"
          :key="nanoid() + encodeURIComponent(i.content) + i.time"
        />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { ref, onMounted } from "@vue/runtime-core";
import { nanoid } from "nanoid";
import ChatMsg from "../components/ChatMsg.vue";

const url = "ws://47.96.253.99:10002/Netdisk/webSocket";
let ws = ref(
  new WebSocket(
    "ws://47.96.253.99:10002/Netdisk/webSocket",
    localStorage.getItem("Itoken")
  )
);

const msg = reactive([]);
const connecting = ref(false);
const inputmsg = ref("");
function send() {
  if (inputmsg.value.trim() === "") {
    ElMessage.warning("请勿发送空白信息！");
    inputmsg.value = "";
    return;
  }
  ws.value.send(inputmsg.value);
  inputmsg.value = "";
}
function close() {
  ws.value.close();
  msg.length = 0;
}

function initConfig() {
  console.log("连接中。。。");
  ws.value.onopen = () => {
    console.log("连接成功！");
    ElMessage.success("连接成功！");
    connecting.value = true;
  };
  ws.value.onmessage = (e) => {
    try {
      msg.push(JSON.parse(e.data));
    } catch {
      console.log(e.data);
      msg.push({
        time: new Date(),
        user: "错误格式用户名",
        content: e.data,
      });
    }
    if (msg.length > 10) {
      msg.shift();
    }
  };
  ws.value.onclose = () => {
    connecting.value = false;
    console.log("连接关闭");
  };
}

function reconnect() {
  ws.value = new WebSocket(url, localStorage.getItem("Itoken"));
  initConfig();
}

onMounted(() => {
  initConfig();
});
</script>

<style>
.chatPage {
  display: block;
  padding: 50px;
  max-height: 550px;
}
</style>