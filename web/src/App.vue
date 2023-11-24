<template>
  <div class="main">
    <div class="tool">
      <el-button type="primary" @click="drawer = true">设置</el-button>
      <el-drawer v-model="drawer" title="I am the title" :with-header="false">
        <el-form :model="formInline" class="form-inline">
          <el-form-item label="Approved by">
            <el-input
              v-model="formInline.user"
              placeholder="Approved by"
              clearable
            />
          </el-form-item>
          <el-form-item label="Activity zone">
            <el-select
              v-model="formInline.region"
              placeholder="Activity zone"
              clearable
            >
              <el-option label="Zone one" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="Activity time">
            <el-date-picker
              v-model="formInline.date"
              type="date"
              placeholder="Pick a date"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">开始</el-button>
          </el-form-item>
        </el-form>
      </el-drawer>
    </div>
    <iframe :src="webUrl" class="iframe"></iframe>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const formInline = reactive({
  user: "",
  region: "",
  date: "",
});

const onSubmit = () => {
  console.log("submit!");
};
const drawer = ref(false);
const webUrl = ref('https://www.baidu.com')
</script>

<style>
html,body{
  width: 100%;
  height: 100%;
}
#app{
  width: 100%;
  height: 100%;
}
.main{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.tool{
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  background-color: #f5f5ff;
}
.iframe{
  border: 0;
  padding: 0;
  margin: 0;
  flex: 1;
}
</style>
