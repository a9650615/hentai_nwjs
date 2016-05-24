//global.gui     = require('nw.gui');
global.Data    = {};
//var gui = require('nw.gui');
//var win = gui.Window.get();
global.__dir = __dirname;
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
window.$ = window.jQuery = require('./js/extend/jquery-1.11.3.js');
global.$ = window.$;
global.UserService = require('./js/module/UserService');
var remote = require('remote');
var dialog = remote.require('dialog');
const shell = require('electron').shell;

global.Setting = require('./js/setting.js');
function update_usercookie(){
  global.Setting.UserCookie = localStorage.getItem('UserCookie')?localStorage.getItem('UserCookie'):global.Setting.UserCookies;
}
global.update_usercookie = update_usercookie;

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
  };
  global.setting = setting;
  var last_view_page = null; //最後一個瀏覽頁面
  var list_page = 0;
  var search_page = 0;
  var search_to_end = false;
  var first_search = true;
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
    download_id:0,
    search_data:[]
  };
  update_usercookie();//取得會員資料
  global.Data.data = data;
  this.Menu        = require( PATH.js + 'menu');
  this.data_loader = require( PATH.js + 'data_loader');
  this.viewer      = require( PATH.js + 'viewer');
  var t = this;
  var search = {
    g : /http:\/\/exhentai.org\/g\/+(\d*)\/[A-a1-9].*\//g
  };
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
    events();
    change_page(1);
    load_list();
    window_resize();
    $('#view4-dir-view-path').val(setting.path);
  }
  function window_resize(){
    /*if($(window).width()<800){
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
    };*/
  };

  function save_setting(){
    fs.writeFile(nwDir+'/setting.json',JSON.stringify(setting));
  };

  function save_data(func){
    fs.writeFile(nwDir+'/data.json',JSON.stringify(data),func);
  };


  function events(){
    //Login Event
    LoginContent.events();
    //添加到快速搜尋
    $('#add-to-fast-search').bind('click', () => {
      if($('#search-bar').val()!=''){
        if(!data.search_data)data.search_data = [];
        data.search_data.push($('#search-bar').val());
        save_data();
        add_QuickSearch($('#search-bar').val(), data.search_data.length,true);
        Materialize.toast('添加成功', 5000);
      }
    });
    //返回目錄
    $('#back-to-menu').bind('click', () => {
      MenuContent.BackToMainMenu();
      change_last_page();
    });
    //call searchbar
    $('#view-1-callsearch').bind('click', () => {
        MenuContent.ChangeSearch();
        if(first_search)
        change_page(7);
        else change_page(5);
    });
    //searchbar clear
    $('#search-bar-clear').bind('click', () => {
      MenuContent.ClearSearchBar();
      change_page(7,true);//建議搜尋
    });
    //call menu
    $('#view-1-callmenu').bind('click', () => {
      MenuContent.ChangeMainMenu();
      change_page(1);
    });

    $('#view-6-show-jpn-title').on('change', () => {
      if($('#view-6-show-jpn-title').is(':checked'))
        UserService.uConfig(UserService.SiteData('uconfig'), 'tl','j');
      else
        UserService.uConfig(UserService.SiteData('uconfig'), 'tl','r');
      update_usercookie();
    });
    //Account Setting
    let GallaryTypesHtml = [];

    for(let i in global.Setting.GallaryTypes){
        $('#view-1-typeselect').append('<option value="f_'+i+'">'+global.Setting.GallaryTypes[i]+'</option>');
        GallaryTypesHtml.push('<div><span class="label">'+i+'</span><input name="'+i+'" class="bottom_line" type="text" value="'+Setting.GallaryTypes[i]+'"></div>');
    }
    $('#view-4-GallaryType').html(GallaryTypesHtml.join(''));

    $('#view-4-GallaryTypeSave').on('click', () => {  //儲存TYPE名稱設定
      let data = {};
      console.log(setting);
      $('#view-4-GallaryType input').each( ( i, h) => {
          if(h.value){
            setting.GallaryTypes[h.name] = h.value;
            global.Setting.GallaryTypes[h.name] = h.value;
          };
      });
      save_setting();
    });

    //select
    for(var i=0;i<=9;i++){ //add to favorite
      $('#detail-favoriteid').append('<option>'+i+'</option>');
    };

    $('#view-1-refresh').on('click', () => { //更新按鈕
      $('#view-1 .container>:not(.selecter)').remove();
      load_list();
    });

    $('#detail-addfavorite').on('click', () => { // 加到最愛
      let split = data.nowdata.url.split('/');
      global.UserService.AddToFavorite( split[1], split[2], { favcat: $('#detail-favoriteid').val(),favnote:'' }).then( ( type ) => {
        //console.log(type);
        if(type==1){
          $('#detail-addfavorite-section').hide();
          $('#detail-removefavorite').show();
        }
      });
    });

    $('#detail-removefavorite').on('click', () => { // 移除最愛
      let split = data.nowdata.url.split('/');
      global.UserService.AddToFavorite( split[1], split[2], { favcat: 'favdel',favnote:'' }).then( ( type ) => {
        //console.log(type);
        if(type==1){
          $('#detail-addfavorite-section').show();
          $('#detail-removefavorite').hide();
        }
      });
    });

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
      MenuContent.ChangeMainMenu();
    });

    $('#detail-source-download').bind('click',function(){//下載
      add_view3( null, null, true);
      change_page(3);
      MenuContent.ChangeMainMenu();
    });

    $('#detail-view').bind('click',function(){ //閱讀
      t.viewer.openView(data.nowdata);
    });

    $('#search-bar').bind('keyup',function(e){
      if($(this).val()=='')
        change_page(7,true);//建議搜尋
      if(e.keyCode==13){
        var url = $('#search-bar').val().trim().match(search.g) ;
        if( url ){
          load_detail( url[0] );
        }else{
          //$('#view-5 .list-item:not([id="view-5-view"])').remove();
          call_search();
          //load_detail($(this).attr('data-url'));
        };
      };
    });

    $('#view4-dir-view-path').click(function(){
        $('#view4-dir-path').click();
    });

    $('#view4-dir-path').on('click',function(){
        //console.log(dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory']}));
        setting.path = (dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory']}) || setting.path);
        if(setting.path.slice(-1) != '/') setting.path += '/';
        $('#view4-dir-view-path').val(setting.path);
        save_setting();
    });
    /*$('#view4-dir-path').attr('nwworkingdir',setting.path).bind('change',function(){
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
    //});
    $(window).resize(function(){
      window_resize();
    });

    $('select').material_select();//更新選擇
    $(document).ready(function(){
      Materialize.updateTextFields();
    });
  };

  function change_last_page(){
    change_page(last_view_page,true);
  }

  function change_page(page, history){
    if($('#header .main-menu li[data-index="'+page+'"]').attr('enable')!='false'){
      if(!history)
      last_view_page = data.page;
      data.page = page;
      $('#header .main-menu li').removeClass();
      $('#header .main-menu li[data-index="'+data.page+'"]').addClass('active');
      $('.view').hide();
      $('.view[data-index="'+data.page+'"]').show();
      if(page==2)
        MenuContent.ChangeMainBack();
      if(page==5)
        MenuContent.ChangeSearch();
    }
  };
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
          change_page(5);
          search_page = 1;
          search_to_end = false;
          load_search(search_page-1);
          first_search = false;
  }

  //view 3
  function re_down(d,id){
    if(typeof d =='object' && d ){
      log(d);
      add_view3(d,id);
    };
  };

  function add_view3(d,id, issource){
    var dat ;
      if(d)
      dat = d;
      else
      dat = data.data[data.now];

    if(!dat)
    dat = data.nowdata;

    if(issource)
      dat.source = true;

    if(dat){
      if(!id){/*重複判斷*/
        for(var i in data.data){
          if(data.data[i]&&data.data[i].id&&dat.id==data.data[i].id){
            data.data[i].pause = false;
            $('#download-'+i+' .button-p-s').text('暫停');
            t.downloader.download_file(i);
            return false;
          };
        };
      };
      //dat = data.nowdata;
      var html = $($('#view-3-view')[0].outerHTML);
      html.attr('title',dat.name).attr('data-url',dat.href);
      t.data_loader.parseImage( dat.img, html,function( url, obj){
         obj.children('.board-left').children('.list-clover-image').attr('src',url);
      });
      html.find('.board-right .list-name').text(dat.name);
      $(html).show().bind('dblclick',function(){

      });
      var bt_p_s = $(html).find('.board-right .list-button .button-p-s');
      var bt_del = $(html).find('.board-right .list-button .button-delete');
      var bt_open = $(html).find('.board-right .list-button .button-open');
      bt_open.attr('data-id',id||data.now).bind('click',function(){
        shell.showItemInFolder(setting.path+t.downloader.replace_path(data.data[$(this).attr('data-id')].name)+'/');
        //gui.Shell.showItemInFolder(setting.path+replace_path(data.data[$(this).attr('data-id')].name)+'/');
      });
      bt_p_s.bind('click',function(){
        p_s_download($(this).attr('data-id'));
      });
      bt_del.attr('data-id',id||data.now).bind('click',function(){
        delete data.data[$(this).attr('data-id')];
        $(this).parents('.card').remove();
        save_data();
      });
      if(!d){
        html.attr('id','download-'+data.now);
        data.data[data.now] = data.nowdata;
        //臨時解決方案
        save_data(function(){
          t.downloader.download_file( data.now, function(cc){log(cc);});
        });
        bt_p_s.attr('data-id',data.now);
      }else{
        html.attr('id','download-'+id);
        $(html).find('.board-right .list-state').text(dat.nowdownload+'/'+dat.max);
        $(html).find('.board-right .download-bar .determinate').css('width',(dat.nowdownload/dat.max)*100+'%');
        bt_p_s.attr('data-id',id).text('繼續');
        if(dat.max==dat.nowdownload)
        bt_p_s.remove();
      };

      $("#view-3 .container").prepend(html);
    }
  }
  function p_s_download( id){
    if(data.data[id]){
      if(data.data[id].pause){
        data.data[id].pause = false;
        $('#download-'+id).find('.loading').addClass('indeterminate');
      }else{ 
        data.data[id].pause = true;
        $('#download-'+id).find('.loading').removeClass('indeterminate');
      }
      $('#download-'+id+' .button-p-s').text(data.data[id].pause?'繼續':'暫停');
      t.downloader.download_file(id);
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
        _url_ : [url[3],url[4],url[5]].join('/')+'/?hc=1'
      },
      function ( data){
        view2( data, id);
      });

  };

  function view2( dat, id){
    console.log(dat);
    data.nowdata = dat;
    data.nowdata.id = id;
    save_data();//New
    $('#header .main-menu li[data-index="2"]').attr('enable','true');
    change_page(2);
    MenuContent.ChangeMainBack();//更換menu
    $('#detail-name').text(dat.name);
    t.data_loader.parseImage( dat.img, null, function( url){
      $('#detail-background').css('background-image','url('+url+')').css('background-position','50%');
      $('#detail-image').attr('src',url);
    });
    $('#detail-time').text(dat.information.posted);
    $('#detail-language').text(dat.information.language);

    //最愛
    $('#detail-addfavorite-section').hide();
    $('#detail-removefavorite').hide();
    let split = data.nowdata.url.split('/');
    if(localStorage.getItem('UserName')){
      $('#detail-source-download').show();
      global.UserService.CheckFavorite( split[1], split[2]).then((type) => {
            data.nowdata.isfavorite = type;
            if(data.nowdata.isfavorite){
              $('#detail-addfavorite-section').hide();
              $('#detail-removefavorite').show();
            }else{
              $('#detail-addfavorite-section').show();
              $('#detail-removefavorite').hide();
            };
      });
    }else{
      $('#detail-source-download').hide();
    };

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
          shell.openExternal($(this).attr('href'));
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
    /* 類型判斷 */
    let condition = {
      page : page,
      'f_apply':'Apply+Filter'
    };
    if($('#view-1-typeselect').val() != 0)
    $('#view-1-typeselect option').each( (i,w) => {
      if( i!=0) // delete all
      if(w.selected){
        condition[w.value] = 1;
      }else{
        condition[w.value] = 0;
      };
    });

    t.data_loader.parseData( 'list',
      condition,
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
        var html = $($('#view-1-view')[0].outerHTML)/*.attr('id','view-1-id-'+data[i].href.replace('http://','').split('/')[2])*/;
        //html.attr('title',data[i].name).attr('data-url',data[i].href);
        html.children('.board-right').children('.card-content').children('.list-name').children('span.text').text(data[i].name);
        html.children('.board-right').children('.card-content').children('.list-rank').children('span.text').text(data[i].rank);
        html.children('.board-right').children('.card-content').children('.list-type').children('span.text').text(global.Setting.GallaryTypes[data[i].type]);
        $(html).show().children('.card-action').children('.action-detail')
        html.find('.card-action .action-detail').attr('title',data[i].name).attr('data-url',data[i].href).bind('click',function(){
          $('.main-menu[data-index=2]').attr('enable','false');
          load_detail($(this).attr('data-url'));
        });
        $(view+'-container').append(html);
        //data[i].href.replace('http://','').split('/')[2]
        t.data_loader.parseImage(data[i].img, html,function( url, obj){
          /*$('#view-1-id-'+id)*/
          obj.children('.board-left').children('.list-clover-image').attr('src',url);
        });
      };
    };
  };

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
});
