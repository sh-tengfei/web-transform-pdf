<template>
  <div class="app">
    <header class="header">
      <el-button @click="back" type="warning">返回主页</el-button>
    </header>
    <div class="dashed" />
    <el-form :model="formInline" :rules="rules" ref="ruleFormRef" class="form-inline">
      <el-form-item label="开始抓取" prop="site">
        <el-input
          v-model="formInline.site"
          placeholder="https?://"
          clearable>
      </el-input>
      </el-form-item>
      <el-form-item label="抓取类型" prop="type">
        <el-select
          v-model="formInline.type"
          placeholder="请选择抓取类型"
          clearable
        >
          <el-option v-for="(type, index) in types" :key="type.label" :label="type.label" :value="type.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="抓取大小" prop="size">
        <el-select
          v-model="formInline.size"
          placeholder="请选择抓取大小"
          clearable
        >
          <el-option v-for="(size, index) in sizes" :key="size.label" :label="size.label" :value="size.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSendConfig" :disabled="disableStart">发送配置</el-button>
        <el-button type="warning" @click="onOpenBrower" :disabled="disableOpenBrower">打开浏览器</el-button>
        <el-button type="info" @click="onSavePdf" :disabled="disableSave">生成PDF</el-button>
        <el-button type="success" @click="showSaveName = true" :disabled="disableCreatedPdf">保存PDF</el-button>
        <!-- <el-button type="warning" @click="onCloseBrowser" :disabled="disableClose">关闭浏览器</el-button> -->
      </el-form-item>
    </el-form>
    <el-form-item class="save-number" label="">
      <p v-if="pdfNumber > 0">已生成PDF数：<el-tag type="success">{{pdfNumber}}页</el-tag></p>&nbsp;
      <p v-if="browserPages > 0">浏览器页数：<el-tag type="warning">{{browserPages}}页</el-tag></p>
    </el-form-item>
    <el-form-item class="save-number" label="文件名称" v-if="fileName">
      <el-tag type="info">{{fileName}}</el-tag>
    </el-form-item>
    <el-dialog v-model="showSaveName" title="保存文件名称" :close-on-click-modal="false">
      <el-form :model="saveNameForm" @submit.native.prevent>
        <el-form-item label="文件名称">
          <el-input v-model="saveNameForm.saveName" placeholder="请输入保存文件名称" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="onCreatedPdf">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  setup() {
    const router = useRouter()
    const types = ref([{
      value: 'pdf',
      label: 'PDF'
    }])
    const sizes = ref([
      {
        value: 'defalut',
        label: '默认'
      }, {
        value: 'Letter',
        label: 'Letter'
      }, {
        value: 'Legal',
        label: 'Legal'
      }, {
        value: 'Tabloid',
        label: 'Tabloid'
      }, {
        value: 'Ledger',
        label: 'Ledger'
      }, {
        value: 'A0',
        label: 'A0'
      }, {
        value: 'A1',
        label: 'A1'
      }, {
        value: 'A2',
        label: 'A2'
      }, {
        value: 'A3',
        label: 'A3'
      }, {
        value: 'A4',
        label: 'A4'
      }, {
        value: 'A5',
        label: 'A5'
      }, {
        value: 'A6',
        label: 'A6'
    }])
    const rules = ref({
      site: [
        { required: true, message: '请输入登录网址', trigger: 'blur' },
        {
          validator: (rule, value) => {
            return /https?:\/\//ig.test(value)
          },
          message: '格式不正确', trigger: 'blur'
        }
      ],
      type: [
        { required: true, message: '请选择抓取类型', trigger: 'blur' },
      ],
      size: [
        { required: true, message: '请选择页面大小', trigger: 'blur' },
      ],
    })
    const formInline = ref({
      site: "",
      type: "pdf",
      size: "defalut"
    })
    const existConfig = ref(false)
    const pdfNumber = ref(0) //pdf现在一共多少页
    const isExistBrowser = ref(false) // 是否存在浏览器
    const operateIng = ref(false) // 操作中
    const browserPages = ref(0) // 浏览器页数
    const fileName = ref(null) // 文件名称
    const showSaveName = ref(false)
    const saveNameForm = ref({
      saveName: null,
    })
    const pdfPath = ref(null)
    const ruleFormRef = ref(null)
    let canClose = false

    const onSendConfig = () => {
      if(pdfNumber.value) {
        pdfNumber.value = 0
      }
      if(fileName.value) {
        fileName.value = null
      }
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          window.electronAPI.send('config', JSON.stringify(formInline.value))
          operateIng.value = true
        }
      })
    }
    const onOpenBrower = () => {
      window.electronAPI.send('openBrowser')
      operateIng.value = true
    }
    const onSavePdf = () => {
      operateIng.value = true
      window.electronAPI.send('save')
    }
    const onCreatedPdf = (e) => {
      if (!saveNameForm.value.saveName) {
        return ElMessageBox.alert('请输入文件名称')
      }
      canClose = true
      showSaveName.value = false
      operateIng.value = true
      window.electronAPI.send('create', saveNameForm.value.saveName)
      saveNameForm.value.saveName = null
    }
    const onCloseBrowser = () => {
      ElMessageBox.confirm('确认关闭浏览器？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(()=>{
        window.electronAPI.send('close')
      }).catch((e)=>{
        console.log(e)
      })
    }
    const disableStart = computed(() => {
      return existConfig.value || operateIng.value
    })
    const disableOpenBrower = computed(() => {
      return isExistBrowser.value || !existConfig.value || operateIng.value
    })
    const disableSave = computed(() => {
      return operateIng.value || !isExistBrowser.value || !existConfig.value || pdfNumber.value > 0
    })
    const disableCreatedPdf = computed(() => {
      return !pdfNumber.value || operateIng.value || !existConfig.value || !isExistBrowser.value
    })
    const disableClose = computed(() => {
      return !isExistBrowser.value || operateIng.value
    })

    watch(()=>pdfPath.value, (val) => {
      if (val) {
        const a = document.createElement('a')
        a.href = val
        a.download = fileName.value
        document.body.appendChild(a)
        a.click()
      }
    })

    onMounted(()=>{
      window.electronAPI?.ready((name, e) => {
        pdfNumber.value = e.pdfNumber
        isExistBrowser.value = e.existBrowser
        browserPages.value = e.browserPages
        existConfig.value = e.existConfig
        operateIng.value = false
        if (e.path) {
          pdfPath.value = e.path
          fileName.value = e.fileName
        } else {
          pdfPath.value = null
          fileName.value = null
        }
      })
      window.electronAPI?.send('ready')
    })

    function back() {
      router.push('/')
    }

    const beforeClose = (done) => {
      if (canClose) {
        done()
      }
    }
  
    return {
      back,
      beforeClose,

      types,
      sizes,
      rules,
      formInline,
      existConfig,
      pdfNumber,
      isExistBrowser,
      operateIng,
      browserPages,
      fileName,
      showSaveName,
      saveNameForm,
      pdfPath,
      ruleFormRef,

      disableStart,
      disableOpenBrower,
      disableSave,
      disableCreatedPdf,
      disableClose,

      onSendConfig,
      onOpenBrower,
      onSavePdf,
      onCreatedPdf,
      onCloseBrowser
    }
  }
}
</script>
<style lang="less" scoped>
.app{
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.header{
  padding-top: 10px;
  padding-left: 10px;
  padding-bottom: 10px;
}
.title{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  font-size: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #f5f5ff;
  box-sizing: border-box;
}
.form-inline{
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
}
.title-value{
  font-size: 16px;
  color: #333;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.tips{
  font-size: 14px;
  margin-left: 10px;
}
.tips>span{
  font-size: 12px;
  margin-left: 3px;
  color: #333;
}
.save-number{
  margin-left: 20px;
}
.dashed{
  border-bottom: 1px solid #dcdfe6;
  height: 1px;
}
</style>