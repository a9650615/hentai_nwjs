var exports = module.exports = {};

const Save = require('../../module/save');
const DownLoader = require('../../module/downloader');
let Data_Loader = require('../../module/data_loader')

//回復下載至 view 3
exports.re_download = (d,id) => {
    if(typeof d =='object' && d ){
      log(d);
      exports.add_view_download(d,id);
    };
  };

exports.add_download_view = ( data ) => {

    if(data){
      var html = $($('#view-3-view')[0].outerHTML);
      html.attr('title',data.name).attr('data-url',data.href);
      Data_Loader.parseImage( data.img, html,function( url, obj){ //載入圖片
         obj.children('.board-left').children('.list-clover-image').attr('src',url);
      });
      html.find('.board-right .list-name').text(data.name);
      $(html).show();
      var bt_p_s = $(html).find('.board-right .list-button .button-p-s');
      var bt_del = $(html).find('.board-right .list-button .button-delete');
      var bt_open = $(html).find('.board-right .list-button .button-open');
      bt_open.attr('data-id',data.Id).bind('click',function(){
        shell.showItemInFolder(setting.path+t.downloader.replace_path(data.name)+'/');
        //gui.Shell.showItemInFolder(setting.path+replace_path(data.data[$(this).attr('data-id')].name)+'/');
      });

      bt_p_s.attr('data-id',data.Id).bind('click',function(){
        DownLoader.switchStatus($(this).attr('data-id'));
      });

      bt_del.attr('data-id',data.Id).bind('click',function(){
        // delete data.data[$(this).attr('data-id')]; //須修正 global
        // $(this).parents('.card').remove();
        // Save.save_data();
      });
      $(html).find('.board-right .list-state').text('等待開始中');
      html.attr('id','download-'+data.Id);
      // if(id){
      //   $(html).find('.board-right .list-state').text(data.nowdownload+'/'+data.max);
      //   $(html).find('.board-right .download-bar .determinate').css('width',(data.nowdownload/data.max)*100+'%');
      //   bt_p_s.attr('data-id',id).text('繼續');
      //   // if(dat.max==dat.nowdownload)
      //   // bt_p_s.remove();
      // };

      $("#view-3 .container").prepend(html);
    }
  }
  /* 下載狀態切換 */
exports.changeStatusView = ( id ) => {
    
    // if(data.data[id]){
    //   if(data.data[id].pause){
    //     data.data[id].pause = false;
    //     //$('#download-'+id).find('.loading').addClass('indeterminate');
    //   }else{ 
    //     data.data[id].pause = true;
    //     //$('#download-'+id).find('.loading').removeClass('indeterminate');
    //   }
    //   $('#download-'+id+' .button-p-s').text(data.data[id].pause?'繼續':'暫停');
    //   t.downloader.download_file(id);
    // };
  };