var exports = module.exports = {};
$ = global.$;

let last_view_page = null; //最後一個瀏覽頁面

exports.change_last_page = () => {
    exports.change_page(last_view_page,true);
}

exports.change_page = ( page, history) => {
	var data = global.ProgramData;
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
}