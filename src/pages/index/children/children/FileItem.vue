<template>
  <div
    class="fileList"
    :class="{ file_selected: msg.selected }"
    @click="changeSelected(msg.id)"
  >
    <el-checkbox @click="(e) => e.stopPropagation()" v-model="msg.selected" />
    <img :src="iconExtension(msg.filename)" v-once />
    <a class="file_name" href="javascript:;">{{ msg.filename }}</a>
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

function iconExtension(filename) {
  // 切割获取文件后缀名
  let exten = filename.substring(filename.lastIndexOf(".") + 1);
  // 判断图标类型函数，返回值为字符串
  if (
    exten === "png" ||
    exten === "jpg" ||
    exten === "jpeg" ||
    exten === "gif"
  ) {
    //图片
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAXVBMVEUAAAD/d0P/o4D/d0P/d0P/o4D/d0P/d0P/////o4D//Pv/iVv/yrb/fkz/+PX/6N//zrv/x7H/vKP/n3r/kWb/hFT/9PD/8u3/7OX/4NT/zrz/tJj/qon/nXj/jmNpBOBWAAAAB3RSTlMA54JJ4YHpIHF8ZgAAAIFJREFUKM+9y0sWgjAQRNHGoFWJBBDBv+5/mYKG05Jk4Ig36EHfUyJmh0VbCRVYZmdBDHaTh2OQBIZZkOsPuNdtHs7kkIWWzXhvXQLoPfCi28dgp8+BrCLonevga4aJwpVkMw6+E4UHQ5+Jgj9Rq37g6ahdFKLWhAJp5QQmldKIvAGfwA8gkWyZZQAAAABJRU5ErkJggg==";
  } else if (exten === "pdf") {
    // pdf文档
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAbFBMVEUAAAD/l5f/Wlr/Wlr/Wlr/Wlr/Wlr/l5f/4eH/9/f/6Oj/29v/2Nj/0tL/nJz/fn7/X1//XV3/7u7/7Oz/y8v/qKj/oaH/kZH/ior/hIT/a2v/YmL//Pz/8fH/4+P/w8P/vb3/r6//dHT/cnIngkLYAAAABnRSTlMAgkno5d/RCLogAAAAiElEQVQoz63QyQ7CMAwEUJMW19nTlS7s/P8/AiqVSOPeOhdL8+TLAIgMoxzglxzjFIvgGmZJ4TRLCuMiyOUfSt3w8FJUshBkzQNaQh46vQGN7FmYZK9GDpzxtjKmXUOgMz065aoQw1Bf/ec8Wx9/OLoM7CS6uCELdzttjrgD5Ex//ILI0l4AvAFHNg5JLK2WGwAAAABJRU5ErkJggg==";
  } else if (exten === "zip" || exten === "rar") {
    // 压缩文件
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAKlBMVEUAAABVx/d+zztVx/eI00qI00p+zztVx/f5X11+zzv9r0KI00r////xalyA481eAAAAB3RSTlMA5uZJ50pK5MP+KwAAAFtJREFUGNNjIBYYlpeXr1oFJISBHHEYpxDIKYdxyonndADBqlUgEsLpOXPmBIKzahU+Dqaeu0CwahWIBHJ2A8GqVSASyJkJBKtWAYnZeDmaMM4UICcJxlHFExwAL1NtZ9NgqI8AAAAASUVORK5CYII=";
  } else if (exten === "doc" || exten === "docx") {
    // word文档
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAdVBMVEUAAACl0v9Nl/9Nl/9Nl/+l0v9Nl/9Nl/9Nl/////+l0v/z+P/3+//a6v/G3v+qzv+dxv9Ynv/8/f/M4f+v0f+Lu/+Btv92r/9wrP/f7P++2f+nzP+czP9kpv9UnP/7/f/u9f/l8P+71/+iyf+Uwf98s/9rqf/gBAVhAAAACHRSTlMAgknm4YHp5xhLqDUAAACbSURBVCjPtc3ZDoJAEETREbcqBmZhRwR3//8T1UQSeuDJxPvYJ51SKtpBtFXf1pDFoyCEeLUMx1FC6EfBUr/D4QLAnUrAn60ANkBKA1TsplDSwTPRgGU9BU+DipYN0kSOpxpF4umGzEjo+GxzpPmDdwk1b3TvJ8teArRmg4q6RQCGGhgyFiGUvALIs1qA6B+wxrzNB6L9/B4p9QK5uBLO0pzGKQAAAABJRU5ErkJggg==";
  } else if (exten === "xls" || exten === "xlsx") {
    // excel文档
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAflBMVEUAAABjxCKg3Hig3HhjxCJjxCJjxCJjxCJjxCL///+g3Hj4/fXu+eea2nBvyTJqxyv7/fno9t7S7r/E6auG0VOD0E54zEB0yztmxif0++/y+uzl9drh9NXd8s/Y8Mi/56W85qG35Jq245el3YCg23mg23iW12qR1mSO1F98zUaGgUwKAAAACHRSTlMA54KBSuLfSflxeroAAACKSURBVCjPtdC5EoMwDARQk5BEi4zNDbnv6/9/MM5MKGKLimGLLfbNqJBScUR/matfvJ2SXsiHZCZD6kSEtheSMgZqTl2ftPXBrLmlF/bhqQcKo7kJgUrkuJMAVqMgCd4ZcitAt0OJowAXnOmAZwAVth01vDE+XLl2fcuqwZdMApGwL78Qh7JYKfUBmDUSFtVf4tgAAAAASUVORK5CYII=";
  } else if (exten === "apk" || exten === "abb") {
    // 安卓文档
    return "https://pannss.bdstatic.com/m-static/file-widget-1/sysIcon/img/Android_24_8d7683b.png";
  } else if (exten === "ppt" || exten === "pptx") {
    // ppt文档
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAV1BMVEUAAAD/l0P/v4v/v4v/l0P/l0P/l0P/l0P/l0P/////v4v/38X/vIX/17f/xJT/9ez/6tn/uH7/q2b/nEv/mkj/8eX/7d//5dD/z6j/y6H/yZ3/pl7/oliWE6OyAAAACHRSTlMA54KBSuLfSflxeroAAABtSURBVCjPtc25EoAgDEXRuCeKuIC7//+doiOFJI3jeIsUOcUDSCN8lMBd8MfSC4ZQxjIoJyLsXlDqEzTkahYONGq9tqQ4VO4YqmWwErRdpyrSHK5qy2Hq+80gyhv4BoaZge9HiJCXn5ByyQqAAxggEIR9sMPCAAAAAElFTkSuQmCC";
  } else if (
    exten === "css" ||
    exten === "js" ||
    exten === "html" ||
    exten === "java" ||
    exten === "c" ||
    exten === "cpp" ||
    exten === "php" ||
    exten === "py" ||
    exten === "bat" ||
    exten === "md"
  ) {
    // 代码文档
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAP1BMVEUAAABHzKuY77FHzKtHzKuY77FHzKv+//9628OY77Fq1rvh9/HP8unF7+W87OCO4Mxi1Lju+veQ7LBQzq9e1q07NPftAAAABnRSTlMA54JJ4YERk6W6AAAAZklEQVQoz83O2wqAIAyA4ZW1mXnM3v9ZK1JKJ3gV9N8IfowNQAxYNEOq+sclC9awjG3YkjDYs2Crj8BLlJ6D1GTQkJYluJWsOl9laXUviBQU3qlAsTvBd/SvevoNDMibLhBcJgFwAM6eDLeC3MmNAAAAAElFTkSuQmCC";
  } else if (exten === "txt") {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAJ1BMVEUAAABNl/+l0v9Nl/+l0v9Nl/9Nl/9Nl/////+l0v/X6P+czP9mqP9fgW6zAAAAB3RSTlMA54LhgUpJHqErwQAAAElJREFUGNNjYBUvB4MSBiBgLIeASgcghx3GmYTEqZ6pgODU7JwE4sABAc6Kjo6OLmwcIOgAYhpxVqE4hzQOI5xdzAAKKigwYwAA3flu9vOIrTEAAAAASUVORK5CYII=";
  } else {
    // 其他文件
    return "https://pannss.bdstatic.com/m-static/file-widget-1/sysIcon/img/Misc_24_af08942.png";
  }
}
function downloadFile() {
  axios
    .post("/api/shareFile", {
      destination: searchMode.value ? props.msg.path : pathnow.join("/"),
      files: [props.msg.filename],
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
  vertical-align: middle;
  width: 95%;
  min-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  transition: background-color 0.25s;
}

.fileList img {
  margin: 8px 20px;
  vertical-align: middle;
}

.fileList input {
  margin-left: 16px;
}

.file_name,
.fileList img {
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}

.file_selected {
  background-color: rgba(64, 158, 255, 0.4);
}

.fileList .download_button {
  display: none;
}
.fileList:hover .download_button {
  display: block;
  position: absolute;
  right: 0;
  top: 0.25rem;
}
</style>