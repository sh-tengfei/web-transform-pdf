<template>
  <main>
    <header class="title-text">在线PPT转PDF永久保存</header>
    <div class="center-box">
      <router-link to="/make">
        <p class="title">生成PDF</p>
        <el-icon :size="200"><IceCreamRound /></el-icon>
      </router-link>
      <router-link to="/analysis">
        <p class="title">解析PDF</p>
        <el-icon :size="200"><ElemeFilled /></el-icon>
      </router-link>
    </div>
    <footer class="footer">技术支持@sh_tengda@163.com</footer>
  </main>
</template>

<script>
export default {
  name: 'EnterView',
  setup() {
    
  }
}
</script>
<style lang="less" scoped>
main{
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: flex;
}
.center-box{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
}
.title-text{
  text-align: center;
  font-size: 40px;
  color: #79bbff;
  margin: 0;
  margin-top: 80px;
  margin-bottom: 20px;
  font-weight: 700;
}
main a {
  font-weight: bold;
  color: #2c3e50;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all .3;
  color: #67C23A;
  height: 100%;
  background-color: #fff;
  &:hover{
    color: #409eff;
    background-color: #E6E8EB;
    border-radius: 8px;
  }
}
.title{
  margin: 0;
  margin-bottom: 20px;
  font-size: 50px;
}
.footer{
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}
</style>
