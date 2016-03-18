var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var window_controll = require(__dirname+'/window_controll');
var Toaster = require('electron-toaster');
var toaster = new Toaster();
// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 700, height: 500, 'min-height': 300,  'min-width': 550});
  toaster.init(mainWindow);
  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.openDevTools();
  // 測試功能
  //var dialog = require('dialog');
  //dialog.showMessageBox(mainWindow,{message:dialog.showOpenDialog(mainWindow,{ properties: [ 'openFile', 'openDirectory', 'openDirectory' ]})});
  //console.log(dialog.showOpenDialog(mainWindow,{ properties: [ 'openFile', 'openDirectory', 'openDirectory' ]}));


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
