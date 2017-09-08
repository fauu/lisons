import { app, BrowserWindow } from "electron"
import electronDebug = require("electron-debug")
import * as path from "path"
import * as url from "url"

let mainWindow: Electron.BrowserWindow | null

const isDev = process.env.NODE_ENV === "dev"
if (isDev) {
  electronDebug({ enabled: true, showDevTools: "bottom" })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    webPreferences: { experimentalFeatures: true },
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#222"
    // icon: path.join(__dirname, "assets/icon.png")
  })

  if (isDev) {
    const webServerUrl = "http://localhost:3000"
    mainWindow.loadURL(webServerUrl)
    mainWindow.webContents.on("did-fail-load", () => {
      setTimeout(() => mainWindow!.loadURL(webServerUrl), 1000)
    })
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
      })
    )
  }

  mainWindow.setMenu(null as any)

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})
