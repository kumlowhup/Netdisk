<template>
  <div id="app">
    <div class="all_bg"></div>
    <!-- <audio src="./img/chair.mp4" controls autoplay loop style="display: none;">Your browser can't support HTML5 Audio</audio> -->
    <router-view></router-view>
    <!-- 用于下载文件的a标签 -->
    <a
      href=""
      style="display: none"
      target="_self"
      ref="downloadA"
      name="下载文件的a标签"
    ></a>
  </div>
</template>

<script setup>
import { onMounted, provide, ref } from "vue";
onMounted(() => {
  const downloadA = ref(null);
  provide("downloadA", downloadA.value);
  Object.defineProperty(window, "毛", {
    get() {
      console.log(
        " %c                               \n%c   最 高 指 示    \n千万不要忘记阶级斗争",
        `line-height:300px;
    background:url('http://47.96.253.99:10002/Netdisk/img/cat.jpg') no-repeat 0 0;background-size: 200px`,
        `font-size:25px;`
      );
    },
  });
});
</script>

<style>
html,
body {
  width: 100%;
  height: 100vh;
  overflow-y: hidden;
  font-family: -apple-system, Helvetica, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  list-style: none;
  text-decoration: none;
  box-sizing: border-box;
}

.all_bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  z-index: -1;
  filter: blur(10px); /*虚化值，越大越模糊*/
}

.bg_img_control {
  position: fixed;
  bottom: 0;
  left: 0;
}

@media screen and (max-width: 539px) {
  html {
    font-size: 14px;
  }
  .all_bg {
    background-image: url(/Netdisk/wife/getPE);
  }
}

@media screen and (min-width: 540px) {
  html {
    font-size: 16px;
  }
  .all_bg {
    background-image: url(/Netdisk/wife/getPC);
  }
}

@media screen and (min-width: 1000px) {
  html {
    font-size: 18px;
  }
  .all_bg {
    background-image: url(/Netdisk/wife/getPC);
  }
}

#app {
  width: 100%;
  height: 100%;
}

a {
  color: #000;
}
</style>
