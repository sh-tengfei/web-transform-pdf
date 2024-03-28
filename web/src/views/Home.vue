<template>
  <div class="home" v-loading="loading">
    <div class="title">
      <div class="title-value">设置抓取内容</div>
      <div class="tips">
        node:<span id="node-version"></span>;
      </div>
      <div class="tips">
        chrome:<span id="chrome-version"></span>;
      </div>
      <div class="tips">
        electron:<span id="electron-version"></span>;
      </div>
    </div>
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
        <el-button @click="onOpenBrower" :disabled="disableOpenBrower">打开浏览器</el-button>
        <el-button type="info" @click="onSavePdf" :disabled="disableSave">生成PDF</el-button>
        <el-button type="success" @click="showSaveName = true" :disabled="disableCreatedPdf">保存PDF</el-button>
        <el-button type="warning" @click="onCloseBrowser" :disabled="disableClose">关闭浏览器</el-button>
      </el-form-item>
    </el-form>
    <el-form-item class="save-number" label="">
      <p v-if="pdfNumber > 0">已生成PDF数：<el-tag type="success">{{pdfNumber}}页</el-tag></p>&nbsp;
      <p v-if="browserPages > 0">浏览器页数：<el-tag type="warning">{{browserPages}}页</el-tag></p>
    </el-form-item>
    <el-form-item class="save-number" label="文件名称" v-if="fileName">
      <el-tag type="info">{{fileName}}</el-tag>
    </el-form-item>
    <el-dialog v-model="showSaveName" title="保存文件名称">
      <el-form :model="saveNameForm">
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
    <div class="info">
      <h1>Hello World!</h1>
      We are using Node.js <span id="node-version"></span>,
      Chromium <span id="chrome-version"></span>,
      and Electron <span id="electron-version"></span>.
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'HomeView',
  data() {
    return {
      types: [{
        value: 'pdf',
        label: 'PDF'
      }],
      sizes: [
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
      }],
      rules: {
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
      },
      formInline: {
        site: "",
        type: "pdf",
        size: "defalut"
      },

      existConfig: false,

      pdfNumber: 0, //pdf现在一共多少页
      isExistBrowser: false, // 是否存在浏览器

      operateIng: false, // 操作中
      browserPages: 0, // 浏览器页数
      fileName: null, // 文件名称

      showSaveName: false,
      saveNameForm: {
        saveName: null,
      },
      pdfPath: null
    };
  },
  methods: {
    onSendConfig() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          window.electronAPI.send('config', JSON.stringify(this.formInline))
          this.operateIng = true
        }
      })
    },
    onOpenBrower() {
      window.electronAPI.send('openBrowser')
      this.operateIng = true
    },
    onSavePdf() {
      this.operateIng = true
      window.electronAPI.send('save')
    },
    onCreatedPdf() {
      if (!this.saveNameForm.saveName) {
        return window.ElementPlus.ElMessageBox.alert('请输入文件名称')
      }
      this.showSaveName = false
      this.operateIng = true
      window.electronAPI.send('create', this.saveNameForm.saveName)
      this.saveNameForm.saveName = null
    },
    onCloseBrowser() {
      window.ElementPlus.ElMessageBox.confirm('确认关闭浏览器？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(()=>{
        window.electronAPI.send('close')
      }).catch((e)=>{
        console.log(e)
      })
    }
  },
  computed: {
    disableStart() {
      return this.existConfig || this.operateIng
    },
    disableOpenBrower() {
      return this.isExistBrowser || !this.existConfig || this.operateIng
    },
    disableSave() {
      return this.operateIng || !this.isExistBrowser || !this.existConfig || this.pdfNumber > 0
    },
    disableCreatedPdf() {
      return this.pdfNumber === 0 || this.operateIng || !this.existConfig || !this.isExistBrowser
    },
    disableClose() {
      return !this.isExistBrowser || this.operateIng
    },
  },
  watch: {
    pdfPath(val) {
      if (val) {
        const a = document.createElement('a')
        a.href = val
        a.download = this.fileName
        a.click()
      }
    }
  },
  mounted() {
    window.electronAPI.ready((name, e) => {
      const { pdfNumber, existBrowser, browserPages, fileName, path, existConfig } = e
      this.pdfNumber = pdfNumber
      this.isExistBrowser = existBrowser
      this.browserPages = browserPages
      this.existConfig = existConfig
      this.operateIng = false
      if (path) {
        this.pdfPath = path
        this.fileName = fileName
      } else {
        this.pdfPath = null
        this.fileName = null
      }
    })
    window.electronAPI.send('ready')
  },
  created() {
    window._vm = this
  },
}
</script>
