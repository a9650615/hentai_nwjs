
//var gui = require('nw.gui');
//var win = gui.Window.get();
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;
window.$ = window.jQuery = require('../js/extend/jquery-1.11.3.js');
var request = require('request').defaults({ encoding: null });
const win = remote.getCurrentWindow();

var data,dir;

var config = {
	progress:{
		load_list : '讀取圖片列表中...',
		load_n_list : '讀取第%1張資訊中...'
	},
	can_read:false,
	min_read: 4,
	fullscreen: false
};

var temp = {
	list :[],
	now  : 1,
	total: 0,
	list_get : 0,
	list_finish:false
};
console.log(global.__dir);
var  data_loader ;

var Viewer = {
	get_data:  function(){
	/*console.log('get data...');
	  ipcRenderer.send('get-read-data', 'test');
	  ipcRenderer.on('send-read-data', function(event, arg) {
	    console.log(arg); // prints "pong"
	  });*/
	},
	init : function(){
		data_loader = require( dir+'/js/module/data_loader/index.js');
		data_loader.parseImage( data.data.img, null, function( url){
			//console.log(url);
			$('#loading-image').css({
				'background':'url('+url+') center',
				'background-size':'cover'
			});
			$('#loading_background').css({
				'background':'url('+url+') no-repeat center',
				'background-size':'cover'
			});
		});
		this.change_type(config.progress.load_list,0);
		this.get_all_detail();
		this.event();
	},
	event 		: function(){
		$('#btn-fuls').bind('click',function(){
			console.log(win);
			if(!config.fullscreen){
				$(this).find('i').addClass('fa-compress').removeClass('fa-expand');
				//win.enterFullscreen();
				win.setFullScreen(true);
			}
			else{
				$(this).find('i').addClass('fa-expand').removeClass('fa-compress');
				//win.leaveFullscreen();
				win.setFullScreen(false);
			};
			config.fullscreen = !config.fullscreen;
		});
		$('#btn-last').bind('click',function(){
			Viewer.change_page('l');
		});
		$('#btn-next').bind('click',function(){
			Viewer.change_page('r');
		});
		$(document).bind('keydown',	function(e){
			switch(e.keyCode){
				case 37:
						Viewer.change_page('l');
					break;//左
				case 39:
						Viewer.change_page('r');
					break;//右
			}
		});
	},
	show_page	: function(){
		$('#page-view')[0].innerHTML=temp.now  + '/' + temp.total;
	},
	change_page	: function( type ){
		if( config.can_read ){
			switch( type ){
				case 'l':
						if(temp.now>1)
							temp.now--;
					break;
				case 'r':
						if(temp.now<temp.total)
							temp.now++;
					break;
				default: 
					temp.now = type;
					break;
			};	
		}
		Viewer.img(temp.list[temp.now].view||'');
	},
	img 		: function(src){
		if(src)
		$('#image-view').attr('src',src)/*.css('width',$('#image-view').width())*/;
	},
	no_loading	: function(){
		$('#loading').hide();
		$('#s-loading').hide();
	},
	not_read	: function(){
		$('#loading').show();
		$('#s-loading').hide();
		config.can_read = false;
	},
	can_read	: function(){
		$('#loading').hide();
		$('#s-loading').show();
		config.can_read = true;
	},
	change_type : function( type, percent){
		if(config.can_read){
			$('#loading').hide();
			$('#s-load-text').text( type );
			$('#s-loading-progress').css('width', percent+'%');
			$('#s-loading').show();
		}else{
			$('#s-loading').hide();
			$('#loading-text').text( type );
			$('#loading-progress').css('width', percent+'%');
			$('#loading').show();
		};
	},
	parseImg 	   : function( url, data, req){
		var _u = null;
		request.get(url, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
		    	// new Buffer(body).toString('base64')
		        _u = "data:" + response.headers["content-type"] + ";base64," +new Buffer(body).toString('base64');
		    	req( _u, data);
		    }
		});
	},
	get_all_detail : function(){
		
		if(!temp.list_finish & temp.list_get - temp.now > config.min_read){
			this.can_read();
		}else{
			this.not_read();
		};

		data_loader.parseData('image',{
          _url_ : data.data.start.replace( global.Data.data.base,'')
        },function( da ){
        	temp.list_get = parseInt(da.now);
        	temp.list[da.now] = da;
        	temp.total = parseInt(da.total);
        	Viewer.show_page();
        	Viewer.parseImg(da.image, da.now, function( base64, data){
        		temp.list[data].view = base64;
        		if(data == '1'){
        			Viewer.change_page(da.now);
        		};
        	});
        	Viewer.change_type(
        		config.progress.load_n_list.replace('%1',da.now),
        		temp.list_get / temp.total *100
        	);
        	if(parseInt(da.now) < parseInt(da.total)){
        		data.data.start = da.next;
        		Viewer.get_all_detail();
        	}else{
        		temp.list_finish = true;
        		Viewer.can_read();
        		Viewer.no_loading();
        	};
        });
	}
};

window.onload = function(){
	//Viewer.init();
	//win.emit('customEvent');
}