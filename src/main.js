const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 420,
    icon: path.join(__dirname, "icons", "launcher_icon.jpg"),
    webPreferences: {
      nodeIntegration: true, //gives access to the nodeJS api
      contextIsolation: false,
      enableRemoteModule: true,
      //devTools: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
  //win.setResizable(false);
  win.setMenuBarVisibility(false);
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("show-notification", (event, ...args) => {
  const notification = {
    title: "Video Downloaded",
    body: `${args[0]}`,
    icon: path.join(__dirname, "icons", "launcher_icon.jpg"),
  };

  new Notification(notification).show();
});
