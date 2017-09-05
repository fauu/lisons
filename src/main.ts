const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let win: any;

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });

  if (isDev) {
    const url = "http://localhost:3000";
    win.loadURL(url);
    win.webContents.on("did-fail-load", () => {
      setTimeout(() => win.loadURL(url), 1000);
    });
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
