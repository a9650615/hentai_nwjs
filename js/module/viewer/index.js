
var exports = module.exports = {};

var data = {};

const BrowserWindow = require('electron').remote.BrowserWindow;
const ipcMain = require('electron').ipcRenderer;

exports.openView = function ( da ){
	data.data = da;
	if(!data.window){
		
	}else{
	  //console.log('has opened');
	  // data.window.window.$ = global.$;
	  //data.window.window.data = da;
	}

	data.window = new BrowserWindow({
		focus: true,
		min_width: 800,
		min_height: 700,
		toolbar: false,
		show: false
	});

	if(!global.setting.debug)
	data.window.setMenu(null);
	
	try{
		data.window.on('closed', function() {
		  //this.hide(); // Pretend to be closed already
		  console.log("We're closing...");
		  //this.close(true);
		  data.window = null;
		});
	}catch(e){
		console.log(e);
	};
	
	ipcMain.on('get-read-data', function(event, arg) {
	  console.log(arg);  // prints "ping"
	  event.sender.send('send-read-data', {data: data});
	});

	data.window.loadURL('file://'+global.__dir +'/views/viewer.html');

	data.window.show();

	data.window.webContents.on('did-finish-load', function(){
	  //var document = data.window.window.document;
	  //var win = global.gui.Window.get(data.window);
	  console.log('loaded');
	  data.window.webContents.executeJavaScript(
	  	'data ='+JSON.stringify(data)+';global.Data='+
	  	JSON.stringify({data: global.Data.data})+
	  	';dir='+JSON.stringify(global.__dir)+
	  	';global.Setting={};global.Setting.UserCookie='+JSON.stringify(global.Setting.UserCookie)+';'+
	  	';Viewer.init();');
	});

	data.window.on('customEvent', function(e){
		console.log(e);
	});
}