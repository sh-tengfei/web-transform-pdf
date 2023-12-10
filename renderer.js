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
      graspDoneIng: false,
      pdfSaveIng: false,

      loading: false,
      canClose: false,
      pdfNumber: 0
    };
  },
  methods: {
    onStartGrasp() {
      this.$refs.ruleFormRef.validate((valid, fields) => {
        if (valid) {
          window.electronAPI.send('config', JSON.stringify(this.formInline))
          this.configed = true
        }
      })
    },
    onSavePdf() {
      window.electronAPI.send('save')
      this.pdfSaveIng = true
    },
    onGraspDone() {
      window.electronAPI.send('grasp')
      this.graspDoneIng = true
    },
    onBrowserClose() {
      window.electronAPI.send('browser-close')
    },
    configDone() {
      this.loading = false
    },
    readyDone(state) {
      this.canClose = state
    },
    browserDone(state) {
      this.canClose = state
    },
    closeDone() {
      this.configed = false
    },
    saveDone(pages) {
      this.pdfNumber = pages
      this.pdfSaveIng = false
    },
    graspDone(e) {
      this.graspDoneIng = false
    }
  },
  computed: {
    disableGrasping() {
      return this.grasping
    }
  },
  mounted() {
    window.electronAPI.ready((name, value) => {
      if (this[name]) {
        this[name](value)
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