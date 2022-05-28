<template>
  <div>
    <div>
      <span class="chat_user">{{ data.user }}</span>
      <span>{{ data.time }}</span>
    </div>

    <div>{{ data.content }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {},
});
</script>

<style>
.chat_user {
  font-size: 1.17em;
  font-weight: bold;
}
</style>