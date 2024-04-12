// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib')
const fs = require('fs');
const files = `${__dirname}/files/`
let isDev = false
if (process && process.env && process.env.PWD && process.env.PWD.includes && process.env.PWD.includes('web-transform-pdf')) {
  isDev = true
}

function createWindow () {
  // Create base browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    ignoreHTTPSErrors: true,
    alwaysOnTop: !true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      webviewTag: true
    }
  })
  try {
    let checkDir = fs.existsSync(files)
    if (!checkDir) {
      fs.mkdirSync(files)
    }
  } catch (error) {
    console.log(error)
  }

  if (isDev) {
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:8081/')
  } else {
    mainWindow.loadFile('web/dist/index.html')
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let browser = null
let curPage = null
let curPDF = null
let curConfig = null

async function getCurrentData() {
  const pages = browser ? await browser.pages() : null
  return {
    existConfig: !!curConfig,
    pdfNumber: curPDF ? await curPDF.getPageCount() : 0,
    existBrowser: browser ? true : false,
    browserPages: pages ? pages.length : 0
  }
}

async function createBrowser() {
  if (browser) {
    return browser
  }
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

  browser.on('targetcreated', async (target) => {
    const pages = await browser.pages()
    curPage = pages[pages.length -1]
    while (pages.length > 1) {
      const firstPage = pages.shift()
      firstPage.close()
      // await curPage.waitForNetworkIdle()
      // await curPage.focus().catch((e)=>{
      //   console.log('focus error', e)
      // })
    }
  })
  return browser
}

async function handleSetConfig (e, value) {
  curConfig = JSON.parse(value)
  curPDF = await PDFDocument.create()
  e.reply('config-done', await getCurrentData())
}

async function handleOpenBrowser (e) {
  await createBrowser(curConfig.site)
  const pages = await browser.pages()
  curPage = pages.pop();
  await curPage.goto(curConfig.site, { waitUntil: 'networkidle2' })
  e.reply('open-done', await getCurrentData())
}

async function clickContrastSave(currentPage) {
  let prevContent = null
  let curContent = null
  let page = 1
  const size = await currentPage.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
  });

  do {
    prevContent = (await currentPage.content()).replace(/\s+/ig, '')
    let opt = { footerTemplate: `<div style="font-size: 20px;color: #333;"><span>当前页码：${page}</span></div>`, displayHeaderFooter: true, }
    if (curConfig.size === 'defalut') {
      opt.width = size.width
      opt.height = size.height
    } else {
      opt.format = curConfig.size
    }
    const pdf = await currentPage.pdf(opt);
    const donorPdfDoc = await PDFDocument.load(pdf);
    const copiedPage = await curPDF.copyPages(donorPdfDoc, [0]); // Copy first page of first PDF
    curPDF.addPage(copiedPage[0]);
    await currentPage.click('body').catch((e)=>{
      console.log('click error', e)
    })
    await currentPage.waitForNetworkIdle().catch((e)=>{
      console.log('waitForNetworkIdle error', e)
    })
    curContent = (await currentPage.content()).replace(/\s+/ig, '')
    page++
  } while(prevContent !== curContent);
  return curPDF
}

async function handleSetSavePdf(e) {
  // 将页面保存为pdf格式
  await clickContrastSave(curPage)

  e.reply('save-done', await getCurrentData())
}

// 浏览器 ready
async function handleBrowserReady (e) {
  if (browser) {
    await browser.close()
    browser = null
  }
  curPDF = null
  curConfig = null
  e.reply('ready-done', await getCurrentData())
}

async function handleSetCreatePdf(e, name) {
  const mergedPdfBuffer = await curPDF.save()
  const filename = `${name}.pdf`
  const filepath = path.join(files, filename)

  const result = fs.writeFileSync(filepath, mergedPdfBuffer);
  // 清除配置 PDF数据
  curPDF = null
  curConfig = null
  e.reply('create-done', { ...await getCurrentData(), fileName: filename, path: filepath, result })
  handleCloseBrowser(e)
}

async function handleCloseBrowser (e) {
  if (browser) await browser.close()
  browser = null
  curPDF = null
  curConfig = null
  e.reply('close-done', { ...await getCurrentData() })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  ipcMain.on('ready', handleBrowserReady)
  ipcMain.on('config', handleSetConfig)
  ipcMain.on('openBrowser', handleOpenBrowser)
  ipcMain.on('close', handleCloseBrowser)
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
  try {
    fs.rmSync(files, { recursive: true})
  } catch (error) {
    console.log(error)
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
