/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const App = {
  data() {
    return {
      types: [{
        value: 'pdf',
        label: 'PDF'
      }],
      sizes: [{
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
        size: "A4"
      },

      existConfig: false,

      pageNumber: 0, //pdf现在一共多少页
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
    onStart() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          window.electronAPI.send('config', JSON.stringify(this.formInline))
          this.operateIng = true
        }
      })
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
    disableSave() {
      return !this.isExistBrowser || this.operateIng
    },
    disableCreatedPdf() {
      return this.pageNumber === 0 || this.operateIng
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
      const { pageNumber, existBrowser, browserPages, fileName, path, existConfig } = e
      this.pageNumber = pageNumber
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
};
const app = Vue.createApp(App);
app.use(ElementPlus);
app.mount("#app");