var exports = module.exports = {};

let Downloader = require('../../module/downloader')

//回復下載至 view 3
exports.re_download = (d,id) => {
    if(typeof d =='object' && d ){
      log(d);
      exports.add_view_download(d,id);
    };
  };

exports.add_view_download = (d,id, issource) => {
    var dat ;
      if(d)
      dat = d;
      else
      dat = global.Data.data[global.ProgramData.now];

    if(!dat)
    dat = global.ProgramData.nowdata;

    if(issource)
      dat.source = true;

    if(dat){
      if(!id){/*重複判斷*/
        for(var i in data.data){
          if(global.Data.data[i]&&data.data[i].id&&dat.id==data.data[i].id){
            data.data[i].pause = false;
            $('#download-'+i+' .button-p-s').text('暫停');
            t.downloader.download_file(i);
            return false;
          };
        };
      };
      //dat = data.nowdata;
      /*var html = $($('#view-3-view')[0].outerHTML);
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
        delete data.data[$(this).attr('data-id')]; //須修正 global
        $(this).parents('.card').remove();
        Save.save_data();
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
    }*/
  }
  /* 下載狀態切換 */
exports.switch_download = ( id) => {
    if(data.data[id]){
      if(data.data[id].pause){
        data.data[id].pause = false;
        //$('#download-'+id).find('.loading').addClass('indeterminate');
      }else{ 
        data.data[id].pause = true;
        //$('#download-'+id).find('.loading').removeClass('indeterminate');
      }
      $('#download-'+id+' .button-p-s').text(data.data[id].pause?'繼續':'暫停');
      t.downloader.download_file(id);
    };
  };