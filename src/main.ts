import { app, BrowserWindow } from "electron"
import localShortcut = require("electron-localshortcut")
import * as path from "path"
import * as url from "url"

import { colors } from "~/app/data/Style"

const isDev = process.env.NODE_ENV === "dev"

let mainWindow: Electron.BrowserWindow | null

const createWindow = (): Electron.BrowserWindow => {
  mainWindow = new BrowserWindow({
    webPreferences: { experimentalFeatures: true, webSecurity: !isDev },
    minWidth: 1200,
    minHeight: 600,
    backgroundColor: colors.primary,
    icon: path.join(__dirname, "icon.png")
  })
  mainWindow.maximize()

  if (isDev) {
    const devServerUrl = "http://localhost:3000"
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.on("did-fail-load", () => {
      setTimeout(() => mainWindow!.loadURL(devServerUrl), 1000)
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

  return mainWindow
}

const openDevTools = (win: Electron.BrowserWindow) => {
  win.webContents.openDevTools({ mode: "bottom" })
}

const toggleDevTools = () => {
  BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
}

const reload = () => {
  BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache()
}

app.on("ready", () => {
  createWindow()
  localShortcut.register("F5", reload)
  localShortcut.register("F12", toggleDevTools)
})

app.on("browser-window-created", (_, win) => {
  if (isDev) {
    openDevTools(win)
  }
})

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
