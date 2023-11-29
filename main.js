// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib')
const fs = require('fs');

function createWindow () {
  // Create base browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
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

async function createBrowser() {
  if (browser) {
    return browser
  }
  // 打开一个浏览器实例
  browser = await puppeteer.launch({ headless: false });
  return browser
}

async function handleSetGrabValue (e, value) {
  curConfig = JSON.parse(value)
  browser = await createBrowser()
  curPage = await browser.newPage();
  curPDF = await PDFDocument.create()
  ipcMain.emit('step-done', '1')
}

async function handleSetSaveValue() {
  // 访问目标页
  await curPage.goto(curConfig.site, { waitUntil: 'networkidle2' });
  // 将页面保存为pdf格式
  const pdf = await curPage.pdf({ format: 'A4' });
  const donorPdfDoc = await PDFDocument.load(pdf);
  const copiedPage = await curPDF.copyPages(donorPdfDoc, [0]); // Copy first page of first PDF
  curPDF.addPage(copiedPage[0]);

  ipcMain.emit('step-done', '1')
  return 1
}

async function handleSetDone() {
  const mergedPdfBuffer = await pdfDoc.save()
  const name = curConfig.site.replace(/https?:\/\//ig, '').replace('/', '.pdf')

  fs.writeFileSync(name, mergedPdfBuffer);
  // 关闭浏览器实例
  await browser.close();
  ipcMain.emit('step-done', '1')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  ipcMain.on('set-grab-value', handleSetGrabValue)
  ipcMain.on('set-save-value', handleSetSaveValue)
  ipcMain.on('set-done', handleSetDone)

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
