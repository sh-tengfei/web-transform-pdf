/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer, ipcMain } = require('electron')
const path = require('node:path')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib')
const fs = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
  setGrabValue: (value) => ipcRenderer.send('set-grab-value', value),
  setSaveValue: () => ipcRenderer.send('set-save-value', true),
  setDone: () => ipcRenderer.send('set-done', true),
})

// ipcMain.on('step-done', (e)=>{
//   console.log('step-done', e)
//   window.vm.doneCb(true)
// })

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


