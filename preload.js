/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer, ipcMain } = require('electron')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib')
const fs = require('fs');
console.log(ipcRenderer.send, ipcRenderer.invoke)
contextBridge.exposeInMainWorld('electronAPI', {
  send: (...args)=> {
    ipcRenderer.send(...args)
  },
  invoke: ipcRenderer.invoke
})

ipcMain.on('config-done', (e)=>{
  console.log('config-done', e)
  window.vm.configDone(true)
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


