global.Data    = {};
global.__dir = __dirname;
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var remote = require('remote');
var dialog = remote.require('dialog');
let shell = require('electron').shell;
let {clipboard} = require('electron');

window.$ = window.jQuery = require('./js/extend/jquery-1.11.3.js');
global.$ = window.$;
global.UserService = require('./js/module/UserService');
global.Setting = require('./js/setting.js');
global.ProgramData = {  //不存到data的程式資料
  base : 'http://exhentai.org' ,/*'http://yeeee.ddns.net:8008/index.php/api/'*/
  page : 1 ,
  nowdata: {}
};

function update_usercookie(){
  global.Setting.UserCookie = localStorage.getItem('UserCookie')?localStorage.getItem('UserCookie'):global.Setting.UserCookie;
}

global.update_usercookie = update_usercookie;

//extra library
var ToolBar = require('./js/module/toolbar/index.js');
var Save = require('./js/module/save/index.js');
//view library
var LoginContent = require('./js/view/login/login.js');
var MenuContent = require('./js/view/menu/menu.js');

/*錯誤處理*/
process.on('uncaughtException', function (er) {
  console.log(er);
  console.log(er.stack)
});

window.addEventListener('error' ,function(errEvent){
   /* console.log(
      'uncaughtException: '  +
              errEvent.message + '\nfilename:"' +
              (errEvent.filename ? errEvent.filename : 'app_front.js') +
              '", line:' + errEvent.lineno
    );
  */
  //errEvent.preventDefault();
})

/*--------*/
function Hentai($){
  global.$ = $; // 定義全域
  var fs = require('fs'); // require only if you don't already have it
  //var mkdirp = require('mkdirp');
  var request = require('request');
  //var remote = require("remote");
  //var ipc = require('ipc');
  //dialog.showMessageBox({message:mainWindow});
  var PATH = {
    'js' : './js/module/'//nwDir + '\\js\\',
  };
  var setting = {
    path : nwDir + '/download/',
    debug : false,
    GallaryTypes: {},
    download_threads:  -1 ,
  };
  global.Setting = setting;
  
  var data = {
    now : 0,
    data:[],
    id : 0,
    download_id:0,
    search_data:[]
  };
  update_usercookie();//取得會員資料
  global.Data = data;
  this.Menu        = require( PATH.js + 'menu');
  this.data_loader = require( PATH.js + 'data_loader');
  var Events = require('./js/module/events/index.js'); //事件加載
  // this.viewer      = require( PATH.js + 'viewer');
  var t = this;
  
  function alert(data){
      if(typeof data == 'object')
      var options = {
            icon: ".\\stylesheet\\icon.png",
            body: data.message
        };
      else
        var options = {
            icon: ".\\stylesheet\\icon.png",
            body: data
        };
      var notification = new Notification("提示",options);
        notification.onclick = function () {
            notification.close();
        }

        notification.onshow = function () {
          // play sound on show
          //myAud=document.getElementById("audio1");
          //myAud.play();

          // auto close after 1 second
          //setTimeout(function() {notification.close();}, 6000);
        };
  };
  function init(){
    try{
      data = require(nwDir+'/data.json');
    }catch(e){

    }
    try {
      setting = require(nwDir+'/setting.json');
      global.Setting = setting;
    }
    catch (e) {
      alert({title:'歡迎使用!',message:'第一次使用建議至設定調整下載路徑'});
      save_setting();
    };
    for(var i in data.data){
       re_down(data.data[i],i);
    }
    for(var i in data.search_data){
       add_QuickSearch(data.search_data[i], i);
    }
    //取代TYPE名稱設定
    for(let i in setting.GallaryTypes){
       global.Setting.GallaryTypes[i] = setting.GallaryTypes[i];
    }
    if(UserService.uConfig(UserService.SiteData('uconfig'), 'tl')=='j'){
      $('#view-6-show-jpn-title').attr("checked",true);
    }
      //console.log(setting.debug);
    if(setting.debug)
          win.showDevTools();
    /*Load Modules*/
    t.downloader      = require( PATH.js + 'downloader');
    /*Load Modules*/
    Events.events();
    ToolBar.change_page(1);
    $('#view4-dir-view-path').val(setting.path);
  }
 
  //view 7
  add_QuickSearch = ( d, id, animate) => {
    var html = $($('#view-7-section')[0].outerHTML);
    $(html).find('.keyword').text(d).bind('click', function(){
      $('#search-bar').val($(this).text());
      call_search();
    });
    $(html).find('.delete').attr('data-keyword',d).bind('click', function(){
      $(this).parents('li').hide(100, function(){$(this).remove()})
      data.search_data.splice(data.search_data.indexOf(d),1);
      save_data();
    });
    $(html).attr('id','quick-search-'+id).show().prependTo('#view-7-container');
    if(animate)
    Materialize.showStaggeredList('#view-7-container')
  }

  call_search = () => {
    $('#view-5 .container').html('');
          $('.main-menu li[data-index=5]').attr('enable','true');
          ToolBar.change_page(5);
          Events.load_search(search_page-1);
  }

  //view 5
var log = function(d){
    if(setting.debug)
    console.log(d);
  };
  //console.log(UserService.uConfig(UserService.SiteData('uconfig'), 'tl','j'));
  init();
  //return can_load;
  return this;
};
var Main ;
$(document).ready(function(){
  Main = new Hentai(window.$);
  ToolBar.change_page(2)
});
