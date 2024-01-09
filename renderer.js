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
      },
      formInline: {
        site: "",
        type: "pdf"
      },

      configed: false,

      pageNumber: 0, //现在一共多少页
      isExistPdf: false, // 是否存在pdf
      isExistBrowser: false, // 是否存在浏览器

      operateIng: false // 操作中
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
      window.electronAPI.send('save')
      this.operateIng = true
    },
    onCreatedPdf() {
      window.electronAPI.send('grasp')
      this.operateIng = true
    },
    onCloseBrowser() {
      window.electronAPI.send('close-browser')
    }
  },
  computed: {
    disableStart() {
      return this.isExistBrowser || this.operateIng
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
  mounted() {
    window.electronAPI.ready((name, { pageNumber, isExistPdf, isExistBrowser }) => {
      console.log(pageNumber, isExistPdf, isExistBrowser)
      this.pageNumber = pageNumber
      this.isExistPdf = isExistPdf
      this.isExistBrowser = isExistBrowser
      this.operateIng = false
      if (this[name]) {
        this[name](value)
      }
    })
    console.log('ready')
    window.electronAPI.send('ready')
  },
  created() {
    window._vm = this
  },
};
const app = Vue.createApp(App);
app.use(ElementPlus);
app.mount("#app");