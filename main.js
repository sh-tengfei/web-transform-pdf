// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const puppeteer = require('puppeteer');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    headless: false,
    ignoreHTTPSErrors: true,
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
  mainWindow.webContents.openDevTools()
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

async function handleSetGrabValue (e) {
 // 打开一个浏览器实例
 const browser = await puppeteer.launch({ headless: false });

 // 创建一个空白页面
 const page = await browser.newPage();
 // 访问百度首页，并等待页面加载完成
 await page.goto('https://www.baidu.com/', { waitUntil: 'networkidle0' });
 // 将页面保存为pdf格式
 await page.pdf({ path: 'baidu.pdf', format: 'A4' });
 // 关闭浏览器实例
 await browser.close();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  ipcMain.on('set-grab-value', handleSetGrabValue)

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
