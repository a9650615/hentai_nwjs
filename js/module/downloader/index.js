var exports = module.exports = {};

var mkdirp = require('mkdirp');
var request = require('request');
var path = require('path');
var fs = require('fs');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var data_loader = require( '../data_loader');

let Notice = require('../Notice');
const Status = require('./status');

  exports.create_path = function (path){
    //var stats = fs.lstatSync(path);
    //if (!stats.isDirectory()) {
    //  fs.mkdir( path, 0777,function(e){console.log(e)});
    //};
    mkdirp(path, function(err) {
     //path was created unless there was error
     console.log('創建資料夾失敗:'+err);
    });
  };

  exports.replace_path = function (path){
    return path.replace('/','').replace('.','').replace('\\','').replace(':','').replace('*','')
    .replace('?','').replace('"','').replace('<','').replace('>','').replace('|','');
  };
  
  
  /* 新增下載序列 */
  exports.addDownLoadGallary = ( id, data ) => {
    delete data.comment;
    delete data.tags;
    data.Id = id;
    if(!global.Data.Datas[id]){
      data.DownLoadInfo = {
        Status: Status.RUN,
        FetchFinish: false
      };
    }
    exports.addDownloadStatus(data);
    global.Data.Datas[id] = data;
    Save.save_data();
  }
  //
  exports.addDownloadStatus = (data) => {
    if(exports.downLoadingThreadsBiggerThanSetting()){ //滿了
      data.DownLoadInfo.Status = Status.WAIT;
    }
    global.ProgramData.DownLoadOrder[data.DownLoadInfo.Status].push(data.Id);
  }

  //修改下載狀態
  exports.changeDownloadStatus = ( chgStatus, data ) => {
    let oldStatus = data.DownLoadInfo.Status;
    let oldIndex;
    //console.log('更換:'+chgStatus);
    if(global.ProgramData.DownLoadOrder[oldStatus])
      oldIndex = global.ProgramData.DownLoadOrder[oldStatus].indexOf(data.Id);
    //console.log('order:'+oldIndex);
    if(oldIndex!=undefined)//沒有舊資料
    global.ProgramData.DownLoadOrder[oldStatus].splice( oldIndex, 1);//移除
    if(global.ProgramData.DownLoadOrder[Status[chgStatus]])
    global.ProgramData.DownLoadOrder[Status[chgStatus]].push(data.Id);//放入
    data.DownLoadInfo.Status = Status[chgStatus];//修改狀態
  }

  //計算目前正在下載數量是否大於限制
  exports.downLoadingThreadsBiggerThanSetting = () => {
    let settingThreads = global.Setting.download_threads;
    return (settingThreads==-1)?false:(global.ProgramData.DownLoadOrder.Running.length>=settingThreads);
  }

  //共有三種狀態 Running、Waiting、Pause、Finished
  exports.switchStatus = ( id ) => {
    console.log(id);
    let data = global.Data.Datas[id];
    if(data.DownLoadInfo.Status==Status.RUN||data.DownLoadInfo.Status==Status.WAIT){
      //切換成暫停
      exports.changeDownloadStatus('PAUSE', data);
    }else{
      if(exports.downLoadingThreadsBiggerThanSetting()){ //滿了
        exports.changeDownloadStatus('WAIT', data);
      }else{
        exports.changeDownloadStatus('RUN', data);
      }
    }
  }
  //取得狀態
  exports.isPause = ( id ) => {
    let status = global.Data.Datas[id].DownLoadInfo.Status;
    return status==Status.PAUSE;
  }

  /*exports.download_file = function ( id, func){
      if(!data.data[id].pause){
        if(data.data[id].name)
        exports.create_path(setting.path+exports.replace_path(data.data[id].name)+'/');
        save_data();
        data_loader.parseData('image',
          {
            _url_ : data.data[id].start.replace( global.Data.data.base,'')
          },
          function( da, e){
            if(e) console.log('阿斯'+e);
            if(data.data[id].nowdownload==null)
              data.data[id].nowdownload = 1;
            else
              data.data[id].nowdownload++;
            data.data[id].start = da.next;
            data.data[id].max = da.total*1;
            $('#download-'+id+' .board-right .card-content .list-state').text(data.data[id].nowdownload+'/'+da.total);
            $('#download-'+id).find('.download-bar').children('.determinate').css('width',(data.data[id].nowdownload/da.total)*100+'%');
            console.log(da.fullimage);
            exports.save_file(
              id,
              data.data[id].source?(da.fullimage?da.fullimage:da.image):da.image,//da.fullimage,
              setting.path+exports.replace_path(data.data[id].name)+'/'+data.data[id].nowdownload,
              function(d){
                console.log(d);
                save_data();
                if(data.data[id])
                if(data.data[id].max>data.data[id].nowdownload)
                exports.download_file(id);
                else{
                  $('#download-'+id+' .button-p-s').remove();
                  alert({title:'下載完成!',message:data.data[id].name+'下載完成，共 '+data.data[id].max+' 頁'});
                };
              });
          });
      };
          //});//下載檔案
    };
*/

  // exports.save_file = function( id, uri, filename, callback){
  //   var type;
  //   console.log(uri);
  //   request({
  //     method: 'GET',
  //     uri: uri,
  //     maxRedirects: 300,
  //     headers: {
  //       'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
  //       'Cookie': global.Setting.UserCookie,
  //       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  //       'Connection': 'keep-alive',
  //       encoding: 'binary'
  //     }
  //   },function(err, res, body){
  //       if(err)
  //       if(err.statusMessage!='OK'){
  //         console.log('以下err');
  //         console.log(err);
  //         data.data[id].nowdownload--;
  //         exports.download_file(id);
  //       }
  //     }).on('response',function (res) {
  //         //Here you can modify the headers
  //        type = 'jpg';
  //        if(res){
  //        //log('content-type:', res.headers['content-type']);
  //        //log('content-length:', res.headers['content-length']);
  //         type=res.headers['content-type'].replace('image/','').replace('\\html; charset=ISO-8859-1','');
  //        };
  //        console.log(type);
  //        fs.rename(filename+'.undownload', filename+'.'+type, function(err) {
  //            if ( err ) console.log('ERROR: ' + err);
  //        });
  //     }).pipe(fs.createWriteStream(filename+'.undownload').on('error', function(e){
  //           console.log(e);
  //           console.log('儲存圖片發生錯誤'+e);
  //     })).on('close', callback);
  //   /*.pipe(fs.createWriteStream(filename+'.'+type)).on('error', function(e){
  //           console.log(e);
  //           console.log('儲存圖片發生錯誤'+e);
  //     })*/
  // };
