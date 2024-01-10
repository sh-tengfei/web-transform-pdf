// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib')
const fs = require('fs');

function createWindow () {
  // Create base browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    ignoreHTTPSErrors: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      webviewTag: true
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadURL('http://localhost:8081/')
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let browser = null
let curPage = null
let curConfig = null
let curPDF = null

async function getCurrentData() {
  const pages = browser ? await browser.pages() : null
  return {
    pageNumber: curPDF ? await curPDF.getPageCount() : 0,
    isExistPdf: !!curPDF,
    isExistBrowser: browser ? true : false,
    browserPages: pages ? pages.length : 0
  }
}

async function createBrowser() {
  // 打开一个浏览器实例
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport : null,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--start-maximized',
      '--no-first-run'
    ],
    channel: 'chrome',
  });
  browserPID = browser.process().pid
  return browser
}

async function handleSetConfig (e, value) {
  curConfig = JSON.parse(value)
  browser = await createBrowser(curConfig.site)
  const pages = await browser.pages()
  curPage = pages[0];
  await curPage.goto(curConfig.site, { waitUntil: 'networkidle2' })
  curPDF = await PDFDocument.create()
  e.reply('config-done', await getCurrentData())
}

async function handleSetSavePdf(e) {
  // 将页面保存为pdf格式
  const pdf = await curPage.pdf({ format: 'A4' });
  const donorPdfDoc = await PDFDocument.load(pdf);
  const copiedPage = await curPDF.copyPages(donorPdfDoc, [0]); // Copy first page of first PDF
  curPDF.addPage(copiedPage[0]);
  e.reply('save-done', await getCurrentData())
}


async function handleCloseBrowser (e) {
  if (browser) await browser.close()
  browser = null
  e.reply('close-done', true)
}

// 浏览器 ready
async function handleBrowserReady (e) {
  browser = null
  curPDF = null
  curConfig = null
  if (browser) await browser.close()
  e.reply('ready-done', await getCurrentData())
}

async function handleSetCreatePdf(e, name) {
  console.log(name, __dirname)
  const mergedPdfBuffer = await curPDF.save()
  const filename = `./files/${name}.pdf`

  const result = fs.writeFileSync(filename, mergedPdfBuffer);
  // 清除配置 PDF数据
  curPDF = null
  curConfig = null
  e.reply('create-done', { ...await getCurrentData(), fileName: filename, path: path.join(__dirname, filename), result })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  ipcMain.on('config', handleSetConfig)
  ipcMain.on('ready', handleBrowserReady)
  ipcMain.on('close-browser', handleCloseBrowser)

  ipcMain.on('save', handleSetSavePdf)
  ipcMain.on('create', handleSetCreatePdf)
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
