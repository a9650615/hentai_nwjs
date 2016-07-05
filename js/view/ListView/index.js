var exports = module.exports = {};

let Data_Loader = require('../../module/data_loader');

let DetailView = require('../DetailView');
exports.isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.add_view_list = ( data, view) => {
    for(var i in data){
      if(exports.isNumeric(i)){
        var html = $($('#view-1-view')[0].outerHTML),
                card_content = html.children('.board-right').children('.card-content');
        card_content.children('.list-name').children('span.text').text(data[i].name);
        card_content.children('.list-rank').children('span.text').text(data[i].rank);
        card_content.children('.list-type').children('span.text').text(global.Setting.GallaryTypes[data[i].type]);
        $(html).show().children('.card-action').children('.action-detail')

        html.find('.card-action .action-copy').attr('data-url',data[i].href).bind('click' , ( e ) => {
          clipboard.write({ text : $(e.currentTarget).attr('data-url')})
          Materialize.toast('複製成功', 5000);
        });

        html.find('.card-action .action-detail').attr('title',data[i].name).attr('data-url',data[i].href).bind('click',function(){
          $('.main-menu[data-index=2]').attr('enable','false');
          DetailView.load_detail($(this).attr('data-url'));
        });

        $(view+'-container').append(html);
        //data[i].href.replace('http://','').split('/')[2]
        Data_Loader.parseImage(data[i].img, html,function( url, obj){
          /*$('#view-1-id-'+id)*/
          obj.children('.board-left').children('.list-clover-image').attr('src',url);
        });
        
      };
    };
  };