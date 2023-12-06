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
      grasping: false,
      isSave: false,

      configed: false,
      graspDoneIng: false,
      pdfSaveing: false,

      loading: false
    };
  },
  methods: {
    onSubmitGrasp() {
      this.$refs.ruleFormRef.validate((valid, fields) => {
        if (valid) {
          window.electronAPI.send('config', JSON.stringify(this.formInline))
          this.configed = true
          this.loading = true
        }
      })
    },
    onSavePdf() {
      window.electronAPI.setSaveValue()
      setTimeout(()=>{
        this.isSave = true
      }, 2000)
    },
    onGraspDone() {
      window.electronAPI.setDone()
      this.configed = false
      this.graspDoneIng = true
    },
    configDone() {
      this.loading = false
    }
  },
  computed: {
    disableGrasping() {
      return this.grasping
    }
  },
  created() {
    window.vm = this
  },
};
const app = Vue.createApp(App);
app.use(ElementPlus);
app.mount("#app");