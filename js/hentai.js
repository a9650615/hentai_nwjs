global.gui     = require('nw.gui');
global.Data    = {};
var gui = require('nw.gui');
var win = gui.Window.get();
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
window.$ = window.jQuery = require('./js/extend/jquery-1.11.3.js');
global.$ = window.$;
global.Service = require('Service');

/*錯誤處理*/
process.on('uncaughtException', function (er) {
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
  errEvent.preventDefault();
})

/*--------*/

function Hentai($){
  global.$ = $; // 定義全域
  var fs = require('fs'); // require only if you don't already have it
  var mkdirp = require('mkdirp');
  var request = require('request');
  //var remote = require("remote");
  //var ipc = require('ipc');
  //dialog.showMessageBox({message:mainWindow});
  var PATH = {
    'js' : ''//nwDir + '\\js\\',
  };
  var setting = {
    path : nwDir + '/download/',
    debug : false,
  };
  var list_page = 0;
  var search_page = 0;
  var search_to_end = false;
  var can_load = {
    'search' : true,
    'list'   : true
  };
  var data = {
    base : 'http://exhentai.org' ,/*'http://yeeee.ddns.net:8008/index.php/api/'*/
    end  : '',
    page : 1 ,
    nowdata:[],
    now : 0,
    data:[],
    id : 0,
    download_id:0
  };
  global.Data.data = data;
  this.data_loader = require( PATH.js + 'data_loader');
  this.Menu        = require( PATH.js + 'menu');
  this.viewer      = require( PATH.js + 'viewer');
  var t = this;
  function alert(data){
      /*
    if(typeof data == 'object')
    var msg = {
        title : data.title,
        message : data.message,
        detail : data.detail,
        width : 440,
        // height : 160, window will be autosized
        timeout : 6000,
        focus: true // set focus back to main window
    };
    else {
      var msg = {
          title : "提示!",
          message : data,
          detail : null,
          width : 440,
          //height : 50, //window will be autosized
          timeout : 6000,
          focus: true // set focus back to main window
      };
    }
    ipc.send('electron-toaster-message', msg);*/
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
    }
    catch (e) {
      alert({title:'歡迎使用!',message:'第一次使用建議至設定調整下載路徑'});
      save_setting();
    };

    for(var i in data.data){
       re_down(data.data[i],i);
    }
      //console.log(setting.debug);
    if(setting.debug)
          win.showDevTools();
    events();
    change_page(1);
    load_list();
    window_resize();
    $('#view4-dir-view-path').val(setting.path);
  }
  function window_resize(){
    if($(window).width()<800){
      $('.view').height($(window).height() - 50);
      $('.view').width('').css('left','');
      $('#header').width('');
    }
    else{
      $('.view').height($(window).height());
      if($('#header').width()>=300){
        $('#header').width(300);
        $('.view').width($(window).width()-300).css('left','300px');
      };
    };
  };
  function save_setting(){
    fs.writeFile(nwDir+'/setting.json',JSON.stringify(setting));
  };

  function save_data(){
    fs.writeFile(nwDir+'/data.json',JSON.stringify(data));
  };

  function events(){
    $('#view-1').bind('scroll',function(e){
      if(can_load['list'])
      if($(this).scrollTop()+10>=($(this).prop('scrollHeight')-$(this).height())){
        list_page++;
        load_list(list_page);
        can_load['list'] = false;
      };
    });
    $('#view-5').bind('scroll',function(e){
      if(search_page!=0&&search_to_end==false&&can_load['search'])
      if($(this).scrollTop()+10>=($(this).prop('scrollHeight')-$(this).height())){
        search_page++;
        load_search(search_page-1);
        can_load['search'] = false;
      };
    });
    $('#header .main-menu li').bind('click',function(){
       if($(this).attr('enable')=='true'){
        $('#header .main-menu li').removeClass();
        change_page($(this).attr('data-index'));
      };
    });
    $('#detail-download').bind('click',function(){//下載
      add_view3();
      change_page(3);
    });
    
    $('#detail-view').bind('click',function(){ //閱讀
      t.viewer.openView(data.nowdata);
    });

    $('#search-bar').bind('keyup',function(e){
      if(e.keyCode==13){
        $('#view-5 .list-item[id=""]').remove();
        $('.main-menu li[data-index=5]').attr('enable','true');
        change_page(5);
        search_page = 1;
        search_to_end = false;
        load_search(search_page-1);
        //load_detail($(this).attr('data-url'));
      };
    });
    $('#view4-dir-view-path').click(function(){
        $('#view4-dir-path').click();    
    });  
    $('#view4-dir-path').attr('nwworkingdir',setting.path).bind('change',function(){
      //var path_selector = remote.getGlobal('Path_Selector');
     // var pa = path_selector(setting.path);
      var pa = $(this).val();
        console.log(pa);
      if(pa!=undefined){
        setting.path = pa + '/';
        $('#view4-dir-view-path').val(setting.path);
        save_setting();
        alert('設置完成');
      };
      /*
      try{
        var stats = fs.lstatSync($('#view4-dir-path').val()+'\\');
        setting.path = $('#view4-dir-path').val()+'\\';
        alert('設置完成');
        save_setting();
      }catch(e){
        alert('位置不存在！！');
      };
      */
    });
    $(window).resize(function(){
      window_resize();
    });
  };

  function change_page(page){
    if($('#header .main-menu li[data-index="'+page+'"]').attr('enable')!='false'){
      data.page = page;
      $('#header .main-menu li').removeClass();
      $('#header .main-menu li[data-index="'+data.page+'"]').addClass('selected');
      $('.view').hide();
      $('.view[data-index="'+data.page+'"]').show();
    }
  };
  //view 3
  function re_down(d,id){
    if(typeof d =='object' && d ){
      log(d);
      add_view3(d,id);
    };
  };

  function add_view3(d,id){
    var dat ;
    if(d)
    dat = d;
    else
    dat = data.data[data.now];
    if(!dat)
    dat = data.nowdata;

    if(dat){
      if(!id){/*重複判斷*/
        for(var i in data.data){
          if(data.data[i]&&data.data[i].id&&dat.id==data.data[i].id){
            data.data[i].pause = false;
            $('#download-'+i+' .button-p-s').text('暫停');
            download_file(i);
            return false;
          };
        };
      };

      //dat = data.nowdata;
      var html = $($('#view-3-view')[0].outerHTML);
      html.attr('title',dat.name).attr('data-url',dat.href);
      t.data_loader.parseImage( dat.img, html,function( url, obj){
         obj.children('.board-left').children('.list-clover-image').css('background-image','url('+url+')');
      });
      html.children('.board-right').children('.list-name').text(dat.name);
      $(html).show().bind('dblclick',function(){

      });
      var bt_p_s = $(html).children('.board-right').children('.list-button').children('.button-p-s');
      var bt_del = $(html).children('.board-right').children('.list-button').children('.button-delete');
      var bt_open = $(html).children('.board-right').children('.list-button').children('.button-open');
      bt_open.attr('data-id',id||data.now).bind('click',function(){
        gui.Shell.showItemInFolder(setting.path+replace_path(data.data[$(this).attr('data-id')].name)+'/');
      });
      bt_p_s.bind('click',function(){
        p_s_download($(this).attr('data-id'));
      });
      bt_del.attr('data-id',id||data.now).bind('click',function(){
        delete data.data[$(this).attr('data-id')];
        $(this).parents('.list-item').remove();
        save_data();
      });
      if(!d){
        html.attr('id','download-'+data.now);
        data.data[data.now] = data.nowdata;
        download_file( data.now, function(cc){log(cc);});
        bt_p_s.attr('data-id',data.now);
      }else{
        html.attr('id','download-'+id);
        $(html).children('.board-right').children('.list-state').text(dat.nowdownload+'/'+dat.max);
        $(html).children('.board-right').children('.download-bar').children('.progress').css('width',(dat.nowdownload/dat.max)*100+'%');
        bt_p_s.attr('data-id',id).text('繼續');
        if(dat.max==dat.nowdownload)
        bt_p_s.remove();
      };

      $("#view-3").prepend(html);
    }
  }
  function p_s_download( id){
    if(data.data[id]){
      if(data.data[id].pause)
      data.data[id].pause = false;
      else data.data[id].pause = true;
      $('#download-'+id+' .button-p-s').text(data.data[id].pause?'繼續':'暫停');
      download_file(id);
    };
  };
  //view 2
  function load_detail(url){
    var url = url.split('/');
    var id = url[4];
    data.now = data.id++;
    //data.now = id[6];
    /*
    ajax(url,function (data){
      view2( data, id);
    });*/
    
    t.data_loader.parseData('detail',
      {
        _url_ : [url[3],url[4],url[5]].join('/')+'/'
      },
      function ( data){
        view2( data, id);
      });
    
  };

  function view2( dat, id){
    data.nowdata = dat;
    data.nowdata.id = id;
    $('#header .main-menu li[data-index="2"]').attr('enable','true');
    change_page(2);
    $('#detail-name').text(dat.name);
    t.data_loader.parseImage( dat.img, null, function( url){
      $('#detail-background').css('background-image','url('+url+')');
      $('#detail-image').css('background-image','url('+url+')');
    });
    $('#detail-time').text(dat.information.posted);
    $('#detail-language').text(dat.information.language);
    //評論
    $('#detail-comments').html($('#detail-comment-view')[0].outerHTML);
    for(var i in dat.comment){
      var html = $($('#detail-comment-view')[0].outerHTML);
      html.find('.comment-user span').text(dat.comment[i].User+''+(dat.comment[i].isupl?'(上傳者)':''));
      html.find('.comment-msg span').html(dat.comment[i].msg).find('a').bind('click',function(e){
        e.preventDefault();
        if($(this).attr('href').match('http://exhentai.org/g/'))
          load_detail($(this).attr('href'));
        else
          global.gui.Shell.openExternal($(this).attr('href'));
      });
      html.find('.comment-log span').text(dat.comment[i].log);
      $(html).show().appendTo('#detail-comments');
    }
  };
  //view 5
  function load_search(page){
    /*
    ajax(data.base + 'search_t/'+$('#search-bar').val()+'/'+page+data.end,function (data){
      add_view1_list(data,'#view-5');
      search_to_end = data.end;
      can_load['search'] = true;
    },function(){log('list-load-fail')});
    */
    t.data_loader.parseData( 'list', 
      {page:page, f_search: encodeURI($('#search-bar').val().trim().replace(' ','+')), f_doujinshi:'on', f_manga:'on', f_artistcg:'on', f_gamecg:'on', f_western:'on', 'f_non-h':'on', f_imageset:'on', f_cosplay:'on', f_asianporn:'on', f_misc:'on', f_apply:'Apply+Filter'},
      function(data){
        add_view1_list(data,'#view-5');
        search_to_end = data.end;
        can_load['search'] = true;
    });
  }
  // view 1
  function load_list(page){
    if(!page)page=0;
    /*
    ajax(data.base + '/?page='+page + data.end,function (data){
      add_view1_list(data,'#view-1');
      can_load['list'] = true;
    },function(){log('list-load-fail')});
    */
    t.data_loader.parseData( 'list', 
      {page : page},
      function(data){
        add_view1_list(data,'#view-1');
        can_load['list'] = true;
    });
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function add_view1_list( data, view){
    for(var i in data){
      if(isNumeric(i)){
        var html = $($(view+'-view')[0].outerHTML)/*.attr('id','view-1-id-'+data[i].href.replace('http://','').split('/')[2])*/;
        html.attr('title',data[i].name).attr('data-url',data[i].href);
        html.children('.board-right').children('.list-name').children('span.text').text(data[i].name);
        html.children('.board-right').children('.list-rank').children('span.text').text(data[i].rank);
        html.children('.board-right').children('.list-type').children('span.text').text(data[i].type);
        $(html).show().bind('click',function(){
          $('.main-menu[data-index=2]').attr('enable','false')
          load_detail($(this).attr('data-url'));
        });
        $(view).append(html);
        //data[i].href.replace('http://','').split('/')[2]
        t.data_loader.parseImage(data[i].img, html,function( url, obj){
          /*$('#view-1-id-'+id)*/
          obj.children('.board-left').children('.list-clover-image').css('background-image','url('+url+')');
        });
      };
    };
  };

  function ajax( url, success, fail){
    /*
    $.ajax({
      url : url,
      type:'get',
      success : success,
      error : fail
    });*/
  };
  function create_path(path){
    //var stats = fs.lstatSync(path);
    //if (!stats.isDirectory()) {
    //  fs.mkdir( path, 0777,function(e){console.log(e)});
    //};
    mkdirp(path, function(err) {
     //path was created unless there was error
    });
  };

  function download_file( id, func){
    if(!data.data[id].pause){
      create_path(setting.path+replace_path(data.data[id].name)+'/');
      save_data();
      /*
      ajax(data.data[id].start,function(da){
        //console.log(da);
        //ajax(da.image,function(dt){
        //  fs.writeFile( setting.path+data.data[id].name+'\\'+data.data[id].nowdownload+'.jpg',dt,func);
      });*/
      t.data_loader.parseData('image',
        {
          _url_ : data.data[id].start.replace( global.Data.data.base,'')
        },
        function( da ){
          if(data.data[id].nowdownload==null)
            data.data[id].nowdownload = 1;
          else
            data.data[id].nowdownload++;
          data.data[id].start = da.next;
          data.data[id].max = da.total*1;
          $('#download-'+id).children('.board-right').children('.list-state').text(data.data[id].nowdownload+'/'+da.total);
          $('#download-'+id).children('.board-right').children('.download-bar').children('.progress').css('width',(data.data[id].nowdownload/da.total)*100+'%');
          save_file(
            id,
            da.image,//da.fullimage,
            setting.path+replace_path(data.data[id].name)+'/'+data.data[id].nowdownload,
            function(d){
              log(d);
              save_data();
              if(data.data[id])
              if(data.data[id].max>data.data[id].nowdownload)
              download_file(id);
              else{
                $('#download-'+id+' .button-p-s').remove();
                alert({title:'下載完成!',message:data.data[id].name+'下載完成，共 '+data.data[id].max+' 頁'});
              };
            });
        });
    };
        //});//下載檔案
  };
  var log = function(d){
    if(setting.debug)
    console.log(d);
  };

  var save_file = function( id, uri, filename, callback){
    request.head(uri, function(err, res, body){
      if(err)
      if(err.statusMessage!='OK'){
        log('以下err');
        log(err);
        data.data[id].nowdownload--;
        download_file(id);
      }
      var type = 'jpg';
      if(res){
      log('content-type:', res.headers['content-type']);
      log('content-length:', res.headers['content-length']);
      type=res.headers['content-type'].replace('image/','');
      };
      request(uri).pipe(fs.createWriteStream(filename+'.'+type)).on('close', callback);
    });
  };

  function replace_path(path){
    return path.replace('/','').replace('.','').replace('\\','').replace(':','').replace('*','')
    .replace('?','').replace('"','').replace('<','').replace('>','').replace('|','');
  };

  function saveFile () {
    dialog.showSaveDialog({ filters: [
       { name: 'text', extensions: ['txt'] }
      ]}, function (fileName) {
      if (fileName === undefined) return;
      fs.writeFile(fileName, 'ww', function (err) {
       if (err === undefined) {
         dialog.showMessageBox({ message: "The file has been saved! :-)",
          buttons: ["OK"] });
       } else {
         dialog.showErrorBox("File Save Error", err.message);
       }
      });
    });
  };
  init();
  //return can_load;
  return this;
};
var Main ;
$(document).ready(function(){
  Main = new Hentai(window.$);
});
