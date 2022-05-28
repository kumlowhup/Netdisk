<template>
  <div class="inputBox">
    <label
      class="userlabel"
      @click="input.focus()"
      :class="{ labelFocus, labelFocusColor, labelWarning }"
    >
      {{ itemname }} </label
    ><input
      :type="type"
      ref="input"
      @keyup="changedata"
      @keyup.enter="keyEnter"
      @focus="inputfocus"
      @blur="inputblur"
      :class="{ inputWarning }"
    />
    <p class="fbInfo" v-html="feedbackInfo"></p>
  </div>
</template>
<script setup>
import { ref } from "@vue/runtime-core";
// input 聚焦时label飘起
const labelFocus = ref(false);
// input 聚焦时label颜色
const labelFocusColor = ref(false);
// 出错时报红
const labelWarning = ref(false);
const inputWarning = ref(false);

const emit = defineEmits(["keyEnter"]);
const props = defineProps({
  itemname: String,
  type: String,
  changedata: Function,
  feedbackInfo: String,
  checkFun: Function,
});
const input = ref(null);
function inputfocus() {
  labelFocusColor.value = true;
  labelFocus.value = true;
  inputWarning.value = false;
  labelWarning.value = false;
}
function inputblur() {
  labelFocusColor.value = false;
  labelFocus.value = input.value.value !== "";
  inputWarning.value = false;
  labelWarning.value = false;
  // 正则函数
  if (!props.checkFun()) {
    inputWarning.value = true;
    labelWarning.value = true;
  }
}
function keyEnter() {
  emit("keyEnter");
}
</script>
<style scoped>
/* 设置提示信息的相关属性 */
label {
  font-size: 15px;
  line-height: 40px;
  position: absolute;
  left: 20px;
  transition-duration: 0.3s;
  color: #828282;
}
/* 输入框 */
input {
  width: 347px;
  height: 40px;
  padding: 0 20px;
  outline: 0;
  border: 2px solid rgb(148, 148, 148);
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* 选中时变化 */
input:focus {
  background-color: #e8f0fe;
  border-color: #399af2;
  border-radius: 10px;
}

/* 反馈信息框 */
.fbInfo {
  color: #f00;
  position: absolute;
  left: 10px;
  top: 42px;
}

/* label聚焦样式 */
.labelFocus {
  transform: translateY(-34px) scale(0.86, 0.86);
}

/* label聚焦颜色 */
.labelFocusColor {
  color: #399af2;
}

/* 空input样式 */
.inputWarning {
  border-color: #f00;
  background-color: #ff00001a;
}

/* 空input时的label样式 */
.labelWarning {
  color: #f00;
}
</style>