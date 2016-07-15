var exports = module.exports = {};
const {dialog} = require('electron').remote;
//modules
let ToolBar = require('../toolbar');
let Save = require('../save');
let Viewer = require('../viewer');
let Data_Loader = require('../data_loader');
const Downloader = require('../../module/downloader')
//views
let Views = {};
Views.ListView = require('../../view/ListView');
Views.DetailView = require('../../view/DetailView');
Views.DownLoadView = require('../../view/DownLoadView');

//data
let can_load = {
  'search' : true,
  'list'   : true
};
let search_page = 0;
let search_to_end = false;
let list_page = 0;

exports.load_search = ( page ) => {
	if( page ) search_page = page;
	Data_Loader.parseData( 'list',
	  {page:page, f_search: encodeURI($('#search-bar').val().trim().replace(' ','+')), f_doujinshi:'on', f_manga:'on', f_artistcg:'on', f_gamecg:'on', f_western:'on', 'f_non-h':'on', f_imageset:'on', f_cosplay:'on', f_asianporn:'on', f_misc:'on', f_apply:'Apply+Filter'},
	  function(data){
	    Views.ListView.add_view_list(data,'#view-5');
	    //console.log(global.Data.end); // 尚未偵錯
	    search_to_end = global.Data.end;
	    can_load['search'] = true;
	});
}

exports.load_list = ( page ) => {
	if(!page)page=0;
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

	Data_Loader.parseData( 'list',
	  condition,
	  function(data){
	    Views.ListView.add_view_list(data,'#view-1');
	    can_load['list'] = true;
	});
}

exports.events = () => {
	//Login Event
	LoginContent.events();
	//線程數修改
	console.log(global.Setting.download_threads);
	if(global.Setting.download_threads)
	$('#view4-download-line-number').val( global.Setting.download_threads );
	$('#view4-download-line-number').on( 'change', ( event ) => {
	  global.Setting.download_threads = $( event.currentTarget ).val();
	})
	//添加到快速搜尋
	$('#add-to-fast-search').bind('click', () => {
	  if($('#search-bar').val()!=''){
	    if(!global.Data.search_data)global.Data.search_data = [];
	    global.Data.search_data.push($('#search-bar').val());
	    Save.save_data();
	    add_QuickSearch($('#search-bar').val(), global.Data.search_data.length,true);
	    Materialize.toast('添加成功', 5000);
	  }
	});
	//返回目錄
	$('#back-to-menu').bind('click', () => {
	  MenuContent.BackToMainMenu();
	  ToolBar.change_last_page();
	});
	//call searchbar
	$('#view-1-callsearch').bind('click', () => {
	    MenuContent.ChangeSearch();
	    //if(first_search)
	    ToolBar.change_page(7);
	    //else ToolBar.change_page(5);
	});
	//searchbar clear
	$('#search-bar-clear').bind('click', () => {
	  MenuContent.ClearSearchBar();
	  ToolBar.change_page(7,true);//建議搜尋
	});
	//call menu
	$('#view-1-callmenu').bind('click', () => {
	  MenuContent.ChangeMainMenu();
	  ToolBar.change_page(1);
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
	  $('#view-4-GallaryType input').each( ( i, h) => {
	      if(h.value){
	        global.Setting.GallaryTypes[h.name] = h.value;
	      };
	  });
	  Save.save_setting();
	});

	//select
	for(var i=0;i<=9;i++){ //add to favorite
	  $('#detail-favoriteid').append('<option>'+i+'</option>');
	};

	$('#view-1-refresh').on('click', () => { //更新按鈕
	  $('#view-1 .container>:not(.selecter)').remove();
	  exports.load_list();
	});

	$('#detail-addfavorite').on('click', () => { // 加到最愛
	  let split = global.ProgramData.nowdata.url.split('/');
	  global.UserService.AddToFavorite( split[1], split[2], { favcat: $('#detail-favoriteid').val(),favnote:'' }).then( ( type ) => {
	    //console.log(type);
	    if(type==1){
	      $('#detail-addfavorite-section').hide();
	      $('#detail-removefavorite').show();
	    }
	  });
	});

	$('#detail-removefavorite').on('click', () => { // 移除最愛
	  let split = global.ProgramData.nowdata.url.split('/');
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
	    exports.load_list(list_page);
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
	    ToolBar.change_page($(this).attr('data-index'));
	  };
	});
	$('#detail-download').bind('click',function(){//下載
	  Views.DownLoadView.add_download_view(global.ProgramData.nowdata);
		Downloader.addDownLoadGallary( global.ProgramData.now, global.ProgramData.nowdata);
	  ToolBar.change_page(3);
	  MenuContent.ChangeMainMenu();
	});

	$('#detail-source-download').bind('click',function(){//下載
	  Views.DownLoadView.add_download_view( null, null, true);
	  ToolBar.change_page(3);
	  MenuContent.ChangeMainMenu();
	});

	$('#detail-view').bind('click',function(){ //閱讀
	  Viewer.openView(global.ProgramData.nowdata);
	});

	$('#search-bar').bind('keyup',function(e){
	  if($(this).val()=='')
	    ToolBar.change_page(7,true);//建議搜尋
	  if(e.keyCode==13){
	    var url = $('#search-bar').val().trim().match(/http:\/\/exhentai.org\/g\/+(\d*)\/[A-Za-z1-9].*\//g) ;
	    if( url ){
	      ToolBar.change_page(1,true);//建議搜尋
	      Views.DetailView.load_detail( url[0] );
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
	    global.Setting.path = (dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory']}) || global.Setting.path);
	    if(global.Setting.path.slice(-1) != '/') global.Setting.path += '/';
	    $('#view4-dir-view-path').val(global.Setting.path);
	    Save.save_setting();
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

	$('select').material_select();//更新選擇
	$(document).ready(function(){
	  Materialize.updateTextFields();
	  exports.load_list();
	});
}