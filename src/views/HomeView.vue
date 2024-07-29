<script setup>
import TheWelcome from '../components/TheWelcome.vue';
import apis from '@/server/apis';

const handleClickGet = () => {
  apis.getTestApi().then(res => {
    console.log('res', res);
  })
};

const handleClickPost = () => {
  apis.postTestApi().then(res => {
    console.log('res', res);
  })
};
</script>

<template>
  <main>
    <TheWelcome />
    <el-button type="primary" @click="handleClickGet">get测试</el-button>
    <el-button type="primary" @click="handleClickPost">post测试</el-button>
    <i-ep-edit />
  </main>
</template>
