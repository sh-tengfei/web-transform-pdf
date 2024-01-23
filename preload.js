/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron')
let cb = null
contextBridge.exposeInMainWorld('electronAPI', {
  send: (...args)=> {
    ipcRenderer.send(...args)
  },
  ready: (vmCb) => {
    cb = vmCb
  },
  invoke: ipcRenderer.invoke
})

ipcRenderer.on('ready-done', (e, value)=>{
  cb && cb('readyDone', value)
})
ipcRenderer.on('open-done', (e, value)=>{
  cb && cb('openDone', value)
})
ipcRenderer.on('config-done', (e, value)=>{
  cb && cb('configDone', value)
})
ipcRenderer.on('close-done', (e, value)=>{
  cb && cb('closeDone', value)
})
ipcRenderer.on('create-done', (e, value)=>{
  cb && cb('createDone', value)
})
ipcRenderer.on('save-done', (e, value)=>{
  cb && cb('saveDone', value)
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


