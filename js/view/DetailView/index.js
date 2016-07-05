var exports = module.exports = {};

const shell = require('electron').shell;
let Data_Loader = require('../../module/data_loader');

exports.load_detail = ( url ) => {
    var url = url.split('/');
    var id = url[4];
    global.ProgramData.now = global.ProgramData.id++;

    Data_Loader.parseData('detail',
      {
        _url_ : [url[3],url[4],url[5]].join('/')+'/?hc=1'
      },
      function ( data){
        exports.view( data, id);
      });

  };
  //詳細內容
  exports.view = ( dat, id) => {
    console.log(dat);
    global.ProgramData.nowdata = dat;
    global.ProgramData.id = id;
    //save_data();//好像沒有意義
    $('#header .main-menu li[data-index="2"]').attr('enable','true');
    ToolBar.change_page(2);
    MenuContent.ChangeMainBack();//更換menu
    $('#detail-name').text(dat.name);
    Data_Loader.parseImage( dat.img, null, function( url){
      $('#detail-background').css('background-image','url('+url+')').css('background-position','50%');
      $('#detail-image').attr('src',url);
    });
    $('#detail-time').text(dat.information.posted);
    $('#detail-language').text(dat.information.language);

    //最愛
    $('#detail-addfavorite-section').hide();
    $('#detail-removefavorite').hide();
    let split = global.ProgramData.nowdata.url.split('/');
    if(localStorage.getItem('UserName')){
      $('#detail-source-download').show();
      global.UserService.CheckFavorite( split[1], split[2]).then((type) => {
            global.ProgramData.nowdata.isfavorite = type;
            if(global.ProgramData.nowdata.isfavorite){
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
          exports.load_detail($(this).attr('href'));
        else
          shell.openExternal($(this).attr('href'));
      });
      html.find('.comment-log span').text(dat.comment[i].log);
      $(html).show().appendTo('#detail-comments');
    }
  };